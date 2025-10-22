// src/dtos/reservation.dto.js
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
        // Formata as datas para o padrão YYYY-MM-DD para consistência na resposta
        this.checkinExpected = reservationModel.checkinExpected?.toISOString().split('T')[0];
        this.checkoutExpected = reservationModel.checkoutExpected?.toISOString().split('T')[0];
        this.status = reservationModel.status;
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