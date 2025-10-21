// src/services/room.service.js
const roomRepository = require('../repositories/room.repository');
const reservationRepository = require('../repositories/reservation.repository'); // Necessário para verificar reservas
const { v4: uuidv4 } = require('uuid');
const Room = require('../models/room.model');
const Reservation = require('../models/reservation.model'); // Para constantes de status

// --- Reutilizando Erros Customizados ---
class ConflictError extends Error { constructor(message) { super(message); this.name = 'ConflictError'; this.statusCode = 409; } }
class NotFoundError extends Error { constructor(message) { super(message); this.name = 'NotFoundError'; this.statusCode = 404; } }
class ValidationError extends Error { constructor(message) { super(message); this.name = 'ValidationError'; this.statusCode = 400; } }
// --- Fim Erros Customizados ---

class RoomService {

    /**
     * Valida os dados de entrada para um quarto.
     * @param {object} roomData - { number, type, capacity, pricePerNight, status }
     * @throws {ValidationError} Se dados forem inválidos.
     */
    _validateRoomData(roomData, isUpdate = false) {
        if (!isUpdate) { // Number é obrigatório apenas na criação
            if (!roomData.number || typeof roomData.number !== 'number' || roomData.number <= 0 || !Number.isInteger(roomData.number)) {
                throw new ValidationError('Número do quarto é obrigatório, deve ser um inteiro positivo.');
            }
        }
        if (!roomData.type || !Object.values(Room.TYPES).includes(roomData.type)) {
            throw new ValidationError(`Tipo de quarto inválido. Válidos: ${Object.values(Room.TYPES).join(', ')}.`);
        }
        if (!roomData.capacity || typeof roomData.capacity !== 'number' || roomData.capacity <= 0 || !Number.isInteger(roomData.capacity)) {
            throw new ValidationError('Capacidade do quarto é obrigatória e deve ser um inteiro positivo.');
        }
        if (roomData.pricePerNight === undefined || roomData.pricePerNight === null || typeof roomData.pricePerNight !== 'number' || roomData.pricePerNight < 0) {
            throw new ValidationError('Preço por noite é obrigatório e não pode ser negativo.');
        }
         // Status é opcional na criação (default ATIVO no repo), mas se fornecido, deve ser válido
        if (roomData.status !== undefined && roomData.status !== null && !Object.values(Room.STATUS).includes(roomData.status)) {
             throw new ValidationError(`Status inválido. Válidos: ${Object.values(Room.STATUS).join(', ')}.`);
        }
    }

    /**
     * Cria um novo quarto.
     * @param {object} roomData - { number, type, capacity, pricePerNight, status? }
     * @returns {Promise<Room>} O quarto criado.
     * @throws {ValidationError} Se dados inválidos.
     * @throws {ConflictError} Se o número do quarto já existir.
     */
    async createRoom(roomData) {
        this._validateRoomData(roomData);

        // Verifica se já existe um quarto com este número (não implementado no repo, mas importante)
        // const existingRoom = await roomRepository.findByNumber(roomData.number); // Supõe que findByNumber existe
        // if (existingRoom) {
        //     throw new ConflictError(`Já existe um quarto com o número ${roomData.number}.`);
        // }
        // Nota: A constraint UNIQUE no banco já faria isso, mas validar antes é melhor UX.

        const newRoomData = {
            id: uuidv4(),
            number: roomData.number,
            type: roomData.type,
            capacity: roomData.capacity,
            pricePerNight: roomData.pricePerNight,
            status: roomData.status || Room.STATUS.ATIVO // Default para ATIVO
        };

        const createdRoom = await roomRepository.create(newRoomData);
        return createdRoom;
    }

    /**
     * Busca um quarto pelo ID.
     * @param {string} id - ID do quarto.
     * @returns {Promise<Room>} O quarto encontrado.
     * @throws {NotFoundError} Se não encontrado.
     */
    async getRoomById(id) {
        const room = await roomRepository.findById(id);
        if (!room) {
            throw new NotFoundError('Quarto não encontrado.');
        }
        return room;
    }

    /**
     * Lista todos os quartos.
     * @returns {Promise<Room[]>} Lista de quartos.
     */
    async getAllRooms() {
        return await roomRepository.findAll();
    }

    /**
     * Atualiza dados de um quarto.
     * @param {string} id - ID do quarto.
     * @param {object} roomUpdateData - { type, capacity, pricePerNight, status }
     * @returns {Promise<Room>} O quarto atualizado.
     * @throws {NotFoundError} Se não encontrado.
     * @throws {ValidationError} Se dados inválidos.
     */
    async updateRoom(id, roomUpdateData) {
        this._validateRoomData(roomUpdateData, true); // Valida, ignorando a obrigatoriedade do 'number'

        // Garante que o quarto existe
        await this.getRoomById(id);

        // Prepara dados para o repositório (number e id não são atualizados aqui)
        const updateData = {
            type: roomUpdateData.type,
            capacity: roomUpdateData.capacity,
            pricePerNight: roomUpdateData.pricePerNight,
            status: roomUpdateData.status || Room.STATUS.ATIVO // Se status não for passado, mantém ou define como ATIVO? Define como ativo.
        };

        const updatedRoom = await roomRepository.update(id, updateData);
        if (!updatedRoom) {
            // Caso raro se deletado entre get e update
            throw new NotFoundError('Quarto não encontrado durante a atualização.');
        }
        return updatedRoom;
    }

     /**
     * Desativa um quarto (muda status para INATIVO) se não tiver reservas ativas.
     * NÃO deleta fisicamente, conforme regra.
     * @param {string} id - ID do quarto a desativar.
     * @returns {Promise<Room>} O quarto com status atualizado.
     * @throws {NotFoundError} Se o quarto não for encontrado.
     * @throws {ConflictError} Se o quarto tiver reservas ativas ('CREATED' ou 'CHECKED_IN').
     */
    async deactivateRoom(id) {
        const room = await this.getRoomById(id); // Garante que existe

        // Regra: Não excluir/desativar quartos com reservas ativas 
        const reservations = await reservationRepository.findByRoomId(id);
        const hasActiveReservations = reservations.some(r =>
            r.status === Reservation.STATUS.CREATED || r.status === Reservation.STATUS.CHECKED_IN
        );

        if (hasActiveReservations) {
            throw new ConflictError('Não é possível desativar um quarto que possui reservas ativas (status CREATED ou CHECKED_IN).');
        }

        const affectedRows = await roomRepository.updateStatus(id, Room.STATUS.INATIVO);
        if (affectedRows === 0) {
             throw new NotFoundError('Quarto não encontrado ao tentar desativar.');
        }

        // Retorna o quarto atualizado
        room.status = Room.STATUS.INATIVO; // Atualiza o status no objeto local
        return room;
    }

     /**
     * Reativa um quarto (muda status para ATIVO).
     * @param {string} id - ID do quarto a reativar.
     * @returns {Promise<Room>} O quarto com status atualizado.
     * @throws {NotFoundError} Se o quarto não for encontrado.
     */
     async activateRoom(id) {
        const room = await this.getRoomById(id); // Garante que existe

        const affectedRows = await roomRepository.updateStatus(id, Room.STATUS.ATIVO);
         if (affectedRows === 0) {
             throw new NotFoundError('Quarto não encontrado ao tentar reativar.');
         }

        room.status = Room.STATUS.ATIVO; // Atualiza o status no objeto local
        return room;
    }

    /**
     * Busca quartos disponíveis filtrando por data e capacidade.
     * @param {Date} checkinDate
     * @param {Date} checkoutDate
     * @param {number} requiredCapacity
     * @returns {Promise<Room[]>} Lista de quartos disponíveis.
     * @throws {ValidationError} Se as datas ou capacidade forem inválidas.
     */
    async findAvailableRooms(checkinDate, checkoutDate, requiredCapacity) {
        if (!(checkinDate instanceof Date) || isNaN(checkinDate) || !(checkoutDate instanceof Date) || isNaN(checkoutDate)) {
            throw new ValidationError('Datas de check-in e check-out inválidas.');
        }
        if (checkoutDate <= checkinDate) {
             throw new ValidationError('Data de Check-out deve ser posterior à Data de Check-in.');
        }
        if (typeof requiredCapacity !== 'number' || requiredCapacity <= 0 || !Number.isInteger(requiredCapacity)) {
             throw new ValidationError('Capacidade requerida deve ser um inteiro positivo.');
        }

        return await roomRepository.findAvailable(checkinDate, checkoutDate, requiredCapacity);
    }
}

module.exports = new RoomService();