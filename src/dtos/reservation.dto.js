// src/dtos/reservation.dto.js
const { body, query } = require('express-validator');
const Reservation = require('../models/reservation.model'); // Para constantes

/**
 * DTO para a requisição de criação de uma Reserva.
 */
class CreateReservationRequestDTO {
    /**
     * @param {object} body - O corpo da requisição HTTP.
     */
    constructor(body) {
        this.guestId = body.guestId;                 // string, obrigatório
        this.roomId = body.roomId;                   // string, obrigatório
        // As datas virão como string da API, precisam ser convertidas para Date no controller/service
        this.checkinExpected = body.checkinExpected;   // string (formato 'YYYY-MM-DD'), obrigatório
        this.checkoutExpected = body.checkoutExpected; // string (formato 'YYYY-MM-DD'), obrigatório
        // numberOfGuests é opcional, default para 1 no service
        // this.numberOfGuests = body.numberOfGuests || 1;
    }

    /**
     * Validações para criação de uma reserva.
     */
    static validate() {
        return [
            body('guestId').isUUID(4).withMessage('ID de Hóspede inválido (UUID v4).'),
            body('roomId').isUUID(4).withMessage('ID de Quarto inválido (UUID v4).'),
            body('checkinExpected')
                .matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Data de check-in prevista deve estar no formato YYYY-MM-DD.')
                .custom((value) => {
                    const date = new Date(value + 'T00:00:00'); // Força timezone local
                    if (isNaN(date.getTime())) {
                        throw new Error('Data de check-in prevista inválida.');
                    }
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    if (date < today) {
                        throw new Error('A data de check-in não pode ser no passado.');
                    }
                    return true;
                }),
            body('checkoutExpected')
                .matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Data de check-out prevista deve estar no formato YYYY-MM-DD.')
                .custom((value, { req }) => {
                    const checkoutDate = new Date(value + 'T00:00:00');
                    if (isNaN(checkoutDate.getTime())) {
                        throw new Error('Data de check-out prevista inválida.');
                    }
                    
                    if (req.body.checkinExpected) {
                        const checkinDate = new Date(req.body.checkinExpected + 'T00:00:00');
                        if (checkoutDate <= checkinDate) {
                            throw new Error('Data de check-out prevista deve ser posterior à data de check-in prevista.');
                        }
                    }
                    return true;
                })
        ];
    }
}

/**
 * DTO para a requisição de atualização de detalhes de uma Reserva (antes do check-in).
 */
class UpdateReservationRequestDTO {
    /**
     * @param {object} body - O corpo da requisição HTTP.
     */
    constructor(body) {
         // As datas virão como string da API, precisam ser convertidas para Date no controller/service
        this.checkinExpected = body.checkinExpected;   // string (formato 'YYYY-MM-DD'), obrigatório
        this.checkoutExpected = body.checkoutExpected; // string (formato 'YYYY-MM-DD'), obrigatório
    }

    /**
     * Validações para atualização de uma reserva.
     */
    static validate() {
        return [
            body('checkinExpected')
                .matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Data de check-in prevista deve estar no formato YYYY-MM-DD.')
                .custom((value) => {
                    const date = new Date(value + 'T00:00:00');
                    if (isNaN(date.getTime())) {
                        throw new Error('Data de check-in prevista inválida.');
                    }
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    if (date < today) {
                        throw new Error('A data de check-in não pode ser no passado.');
                    }
                    return true;
                }),
            body('checkoutExpected')
                .matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Data de check-out prevista deve estar no formato YYYY-MM-DD.')
                .custom((value, { req }) => {
                    const checkoutDate = new Date(value + 'T00:00:00');
                    if (isNaN(checkoutDate.getTime())) {
                        throw new Error('Data de check-out prevista inválida.');
                    }
                    
                    if (req.body.checkinExpected) {
                        const checkinDate = new Date(req.body.checkinExpected + 'T00:00:00');
                        if (checkoutDate <= checkinDate) {
                            throw new Error('Data de check-out prevista deve ser posterior à data de check-in prevista.');
                        }
                    }
                    return true;
                })
        ];
    }

    /**
     * Validações para query params de filtros de reserva.
     */
    static validateQueryFilters() {
        return [
            query('guestId').optional().isUUID(4).withMessage('ID de Hóspede inválido (UUID v4).'),
            query('roomId').optional().isUUID(4).withMessage('ID de Quarto inválido (UUID v4).')
        ];
    }
}


/**
 * DTO para a resposta da API ao lidar com Reservas.
 */
class ReservationResponseDTO {
    /**
     * @param {Reservation} reservationModel - A instância do modelo Reservation.
     * @param {object} guest - Opcional: dados do hóspede para popular
     * @param {object} room - Opcional: dados do quarto para popular
     */
    constructor(reservationModel, guest = null, room = null) {
        this.id = reservationModel.id;
        this.guestId = reservationModel.guestId;
        this.roomId = reservationModel.roomId;
        // As datas já vêm como string YYYY-MM-DD do repository
        this.checkinExpected = reservationModel.checkinExpected;
        this.checkoutExpected = reservationModel.checkoutExpected;
        this.status = reservationModel.status;
        this.pricePerNightAtBooking = reservationModel.pricePerNightAtBooking; // Preço do quarto no momento da reserva
        this.checkinAt = reservationModel.checkinAt; // Pode ser null, retorna como está (ISO string)
        this.checkoutAt = reservationModel.checkoutAt; // Pode ser null, retorna como está (ISO string)
        this.estimatedAmount = reservationModel.estimatedAmount; // Pode ser null
        this.finalAmount = reservationModel.finalAmount; // Pode ser null
        this.createdAt = reservationModel.createdAt;
        this.updatedAt = reservationModel.updatedAt; // Pode ser null
        
        // Adiciona dados populados se fornecidos
        if (guest) {
            this.guest = {
                id: guest.id,
                fullName: guest.fullName,
                document: guest.document,
                email: guest.email,
                phone: guest.phone
            };
        }
        
        if (room) {
            this.room = {
                id: room.id,
                number: room.number,
                type: room.type,
                capacity: room.capacity,
                pricePerNight: room.pricePerNight,
                status: room.status
            };
        }
    }
}

// Não são estritamente necessários DTOs para check-in/out/cancel se a única info for o ID na URL,
// mas podem ser criados se houver necessidade de enviar dados no corpo (ex: confirmação especial).

module.exports = {
    CreateReservationRequestDTO,
    UpdateReservationRequestDTO,
    ReservationResponseDTO
};