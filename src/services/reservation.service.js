// src/services/reservation.service.js
const reservationRepository = require('../repositories/reservation.repository');
const roomRepository = require('../repositories/room.repository');
const guestRepository = require('../repositories/guest.repository');
const { v4: uuidv4 } = require('uuid');
const Reservation = require('../models/reservation.model');
const Room = require('../models/room.model');
const { parseDateString } = require('../utils/dateUtils');

// --- Reutilizando Erros Customizados (definidos em guest.service.js ou em um arquivo utils/errors.js) ---
class ConflictError extends Error { constructor(message) { super(message); this.name = 'ConflictError'; this.statusCode = 409; } }
class NotFoundError extends Error { constructor(message) { super(message); this.name = 'NotFoundError'; this.statusCode = 404; } }
class ValidationError extends Error { constructor(message) { super(message); this.name = 'ValidationError'; this.statusCode = 400; } }
class ForbiddenError extends Error { constructor(message) { super(message); this.name = 'ForbiddenError'; this.statusCode = 403; } } // Para transições de estado inválidas
class UnprocessableEntityError extends Error { constructor(message) { super(message); this.name = 'UnprocessableEntityError'; this.statusCode = 422; } } // Para janela de check-in
// --- Fim Erros Customizados ---

// Helper para calcular diferença de dias (considerando diária mínima de 1)
function calculateNights(checkinDate, checkoutDate) {
    if (!(checkinDate instanceof Date) || !(checkoutDate instanceof Date) || isNaN(checkinDate.getTime()) || isNaN(checkoutDate.getTime())) {
        return 0; // Retorna 0 se as datas forem inválidas
    }
    // Zera a hora para comparar apenas dias inteiros
    const start = new Date(checkinDate.getFullYear(), checkinDate.getMonth(), checkinDate.getDate());
    const end = new Date(checkoutDate.getFullYear(), checkoutDate.getMonth(), checkoutDate.getDate());

    const diffTime = end.getTime() - start.getTime();
    if (diffTime < 0) return 0; // Check-out antes do check-in não conta diárias

    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(1, diffDays); // Garante mínimo de 1 diária
}

class ReservationService {

    /**
     * Valida os dados de entrada para criação/atualização de reserva.
     * @param {object} reservationData - { guestId, roomId, checkinExpected, checkoutExpected }
     * @throws {ValidationError} Se dados forem inválidos.
     */
    _validateReservationData(reservationData) {
        if (!reservationData.guestId) throw new ValidationError('ID do Hóspede é obrigatório.');
        if (!reservationData.roomId) throw new ValidationError('ID do Quarto é obrigatório.');
        if (!reservationData.checkinExpected || !(reservationData.checkinExpected instanceof Date) || isNaN(reservationData.checkinExpected.getTime())) {
            throw new ValidationError('Data de Check-in Prevista inválida.');
        }
        if (!reservationData.checkoutExpected || !(reservationData.checkoutExpected instanceof Date) || isNaN(reservationData.checkoutExpected.getTime())) {
            throw new ValidationError('Data de Check-out Prevista inválida.');
        }

        // Zera as horas para comparar apenas as datas
        const checkinDateOnly = new Date(reservationData.checkinExpected.getFullYear(), reservationData.checkinExpected.getMonth(), reservationData.checkinExpected.getDate());
        const checkoutDateOnly = new Date(reservationData.checkoutExpected.getFullYear(), reservationData.checkoutExpected.getMonth(), reservationData.checkoutExpected.getDate());

        if (checkoutDateOnly <= checkinDateOnly) {
            throw new ValidationError('Data de Check-out Prevista deve ser posterior à Data de Check-in Prevista.'); //
        }
        // Validação adicional: não permitir datas no passado? (Opcional, não estrito no PDF)
        // const today = new Date(); today.setHours(0, 0, 0, 0);
        // if (checkinDateOnly < today) {
        //     throw new ValidationError('Data de Check-in não pode ser no passado.');
        // }
    }

    /**
     * Cria uma nova reserva.
     * @param {object} reservationData - { guestId, roomId, checkinExpected, checkoutExpected }
     * @returns {Promise<Reservation>} A reserva criada.
     * @throws {NotFoundError} Se hóspede ou quarto não existem.
     * @throws {ConflictError} Se o quarto não está disponível ou capacidade excedida.
     * @throws {ValidationError} Se as datas forem inválidas.
     */
    async createReservation(reservationData) {
        this._validateReservationData(reservationData);

        const guest = await guestRepository.findById(reservationData.guestId);
        if (!guest) throw new NotFoundError('Hóspede não encontrado.');

        const room = await roomRepository.findById(reservationData.roomId);
        if (!room) throw new NotFoundError('Quarto não encontrado.');
        if (room.status !== Room.STATUS.ATIVO) { //
             throw new ConflictError(`Quarto ${room.number} não está ativo.`);
        }

        // Valida Capacidade (MVP considera 1 hóspede, ajustar se DTO incluir nº de hóspedes)
        const numberOfGuests = 1; // Ajustar se a API permitir especificar hóspedes
        if (numberOfGuests > room.capacity) {
            throw new ConflictError(`Número de hóspedes (${numberOfGuests}) excede a capacidade do quarto (${room.capacity}).`); //
        }

        // Valida Disponibilidade
        const conflictingReservations = await reservationRepository.findConflictingReservations(
            reservationData.roomId,
            reservationData.checkinExpected,
            reservationData.checkoutExpected
        );
        if (conflictingReservations.length > 0) {
            throw new ConflictError('O quarto não está disponível para o período solicitado.');
        }

        // Calcula valor estimado
        const nights = calculateNights(reservationData.checkinExpected, reservationData.checkoutExpected);
        const estimatedAmount = nights * room.pricePerNight;

        const newReservationData = {
            id: uuidv4(),
            guestId: reservationData.guestId,
            roomId: reservationData.roomId,
            checkinExpected: reservationData.checkinExpected,
            checkoutExpected: reservationData.checkoutExpected,
            status: Reservation.STATUS.CREATED, //
            estimatedAmount: estimatedAmount
        };

        const createdReservation = await reservationRepository.create(newReservationData);
        return createdReservation;
    }

    /**
     * Busca uma reserva pelo ID.
     * @param {string} id - ID da reserva.
     * @returns {Promise<Reservation>} A reserva encontrada.
     * @throws {NotFoundError} Se não encontrada.
     */
    async getReservationById(id) {
        const reservation = await reservationRepository.findById(id);
        if (!reservation) {
            throw new NotFoundError('Reserva não encontrada.');
        }
        
        // Popular dados de guest e room
        const [guest, room] = await Promise.all([
            guestRepository.findById(reservation.guestId),
            roomRepository.findById(reservation.roomId)
        ]);
        
        return {
            ...reservation,
            guest,
            room
        };
    }

    /**
     * Atualiza os detalhes de uma reserva (datas previstas).
     * Só permite atualização se a reserva ainda não teve check-in.
     * @param {string} id - ID da reserva.
     * @param {string} checkinExpected - Nova data de check-in (YYYY-MM-DD).
     * @param {string} checkoutExpected - Nova data de check-out (YYYY-MM-DD).
     * @param {number|null} estimatedAmount - Valor estimado (opcional, será recalculado se null).
     * @returns {Promise<Reservation>} A reserva atualizada.
     * @throws {NotFoundError} Se não encontrada.
     * @throws {ConflictError} Se o status não permitir atualização.
     */
    async updateDetails(id, checkinExpected, checkoutExpected, estimatedAmount = null) {
        const reservation = await this.getReservationById(id);

        // Só permite atualizar se ainda estiver no status CREATED
        if (reservation.status !== Reservation.STATUS.CREATED) {
            throw new ConflictError(`Não é possível atualizar uma reserva com status '${reservation.status}'. Atualização permitida apenas para status '${Reservation.STATUS.CREATED}'.`);
        }

        // Converte strings para Date para validação
        const checkinDate = parseDateString(checkinExpected);
        const checkoutDate = parseDateString(checkoutExpected);

        // Valida as novas datas
        const reservationData = {
            guestId: reservation.guestId,
            roomId: reservation.roomId,
            checkinExpected: checkinDate,
            checkoutExpected: checkoutDate
        };
        this._validateReservationData(reservationData);

        // Verifica disponibilidade do quarto nas novas datas (passa strings)
        const conflictingReservations = await reservationRepository.findConflictingReservations(
            reservation.roomId,
            checkinExpected,
            checkoutExpected,
            id // Exclui a própria reserva da verificação
        );

        if (conflictingReservations.length > 0) {
            throw new ConflictError('O quarto não está disponível no período solicitado.');
        }

        // Recalcula o valor estimado se não foi fornecido
        let finalEstimatedAmount = estimatedAmount;
        if (finalEstimatedAmount === null) {
            const room = await roomRepository.findById(reservation.roomId);
            const nights = calculateNights(checkinDate, checkoutDate);
            finalEstimatedAmount = nights * room.pricePerNight;
        }

        // Atualiza a reserva (passa strings)
        const updatedReservation = await reservationRepository.updateDetails(
            id,
            checkinExpected,
            checkoutExpected,
            finalEstimatedAmount
        );

        if (!updatedReservation) throw new NotFoundError('Reserva não encontrada ao tentar atualizar.');
        return updatedReservation;
    }

    /**
     * Cancela uma reserva.
     * @param {string} id - ID da reserva.
     * @returns {Promise<Reservation>} A reserva cancelada.
     * @throws {NotFoundError} Se não encontrada.
     * @throws {ConflictError} Se o status não for 'CREATED'.
     */
    async cancelReservation(id) {
        const reservation = await this.getReservationById(id);

        if (reservation.status !== Reservation.STATUS.CREATED) {
            throw new ConflictError(`Não é possível cancelar uma reserva com status '${reservation.status}'. Cancelamento permitido apenas para status '${Reservation.STATUS.CREATED}'.`); //
        }

        const updatedReservation = await reservationRepository.updateStatus(id, Reservation.STATUS.CANCELED);
        if (!updatedReservation) throw new NotFoundError('Reserva não encontrada ao tentar cancelar.'); // Segurança
        return updatedReservation;
    }

    /**
     * Realiza o check-in de uma reserva.
     * @param {string} id - ID da reserva.
     * @returns {Promise<Reservation>} A reserva com status atualizado.
     * @throws {NotFoundError} Se não encontrada.
     * @throws {ConflictError} Se o status não for 'CREATED'.
     * @throws {UnprocessableEntityError} Se fora da janela de check-in.
     */
    async checkInReservation(id) {
        const reservation = await this.getReservationById(id);

        if (reservation.status !== Reservation.STATUS.CREATED) {
            throw new ConflictError(`Não é possível fazer check-in de uma reserva com status '${reservation.status}'. Check-in permitido apenas para status '${Reservation.STATUS.CREATED}'.`); //
        }

        // Validação da Janela de Check-in
        const today = new Date(); today.setHours(0, 0, 0, 0); // Data atual sem hora
        const checkinExpectedDate = new Date(reservation.checkinExpected.getFullYear(), reservation.checkinExpected.getMonth(), reservation.checkinExpected.getDate()); // Data prevista sem hora

        // Política padrão: Permitir check-in apenas no dia previsto
        if (today.getTime() !== checkinExpectedDate.getTime()) {
             // Opcional: Permitir check-in um dia antes ou depois? A política padrão do PDF é apenas no dia.
            throw new UnprocessableEntityError(`Check-in permitido apenas na data prevista (${checkinExpectedDate.toLocaleDateString()}). Data atual: ${today.toLocaleDateString()}.`); //
        }

        const checkinTime = new Date(); // Timestamp atual
        const updatedReservation = await reservationRepository.updateStatus(id, Reservation.STATUS.CHECKED_IN, checkinTime);
        if (!updatedReservation) throw new NotFoundError('Reserva não encontrada ao tentar fazer check-in.');
        return updatedReservation;
    }

    /**
     * Realiza o check-out de uma reserva e calcula o valor final.
     * @param {string} id - ID da reserva.
     * @returns {Promise<Reservation>} A reserva com status atualizado e valor final.
     * @throws {NotFoundError} Se não encontrada.
     * @throws {ConflictError} Se o status não for 'CHECKED_IN'.
     */
    async checkOutReservation(id) {
        const reservation = await this.getReservationById(id);

        if (reservation.status !== Reservation.STATUS.CHECKED_IN) {
            throw new ConflictError(`Não é possível fazer check-out de uma reserva com status '${reservation.status}'. Check-out permitido apenas para status '${Reservation.STATUS.CHECKED_IN}'.`); //
        }

        if (!reservation.checkinAt) {
            // Isso não deveria acontecer se o status é CHECKED_IN, mas é uma checagem de segurança.
            throw new Error(`Erro interno: Reserva com status ${Reservation.STATUS.CHECKED_IN} não possui data/hora de check-in registrada.`);
        }

        const checkoutTime = new Date(); // Timestamp atual

        // Busca o quarto para pegar o preço da diária
        const room = await roomRepository.findById(reservation.roomId);
        if (!room) {
             // Caso raro onde o quarto foi deletado após a reserva ser feita (deveria ser impedido pela FK ou status INATIVO)
             throw new NotFoundError(`Quarto associado à reserva (ID: ${reservation.roomId}) não foi encontrado.`);
        }

        // Calcula o número de diárias efetivas
        const actualNights = calculateNights(reservation.checkinAt, checkoutTime);

        // Calcula valor final
        const finalAmount = actualNights * room.pricePerNight;

        const updatedReservation = await reservationRepository.updateStatus(
            id,
            Reservation.STATUS.CHECKED_OUT,
            reservation.checkinAt, // Mantém o checkin_at
            checkoutTime,
            finalAmount
        );

        if (!updatedReservation) throw new NotFoundError('Reserva não encontrada ao tentar fazer check-out.');
        return updatedReservation;
    }

    // --- Métodos Adicionais (Ex: Buscar por Hóspede, Quarto, etc.) ---

    async getReservationsByGuest(guestId) {
        // Valida se o hóspede existe primeiro
        await guestRepository.findById(guestId); // Lança NotFoundError se não existir
        return await reservationRepository.findByGuestId(guestId);
    }

    async getReservationsByRoom(roomId) {
         // Valida se o quarto existe primeiro
        await roomRepository.findById(roomId); // Lança NotFoundError se não existir
        return await reservationRepository.findByRoomId(roomId);
    }

    async findAll() {
        const reservations = await reservationRepository.findAll();
        
        // Popular dados de guest e room para cada reserva
        const populatedReservations = await Promise.all(
            reservations.map(async (reservation) => {
                const [guest, room] = await Promise.all([
                    guestRepository.findById(reservation.guestId),
                    roomRepository.findById(reservation.roomId)
                ]);
                
                // Adiciona os objetos guest e room à reserva
                return {
                    ...reservation,
                    guest,
                    room
                };
            })
        );
        
        return populatedReservations;
    }
}

// Exporta a instância
module.exports = new ReservationService();