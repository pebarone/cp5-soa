// src/models/reservation.model.js

/**
 * Representa uma Reserva de quarto.
 * Baseado na definição do documento[cite: 19].
 */
class Reservation {
    /**
     * @param {string} id - Identificador único (UUID string)[cite: 118, 119].
     * @param {string} guestId - ID do hóspede[cite: 19, 121].
     * @param {string} roomId - ID do quarto[cite: 19, 124].
     * @param {Date} checkinExpected - Data prevista para check-in[cite: 19, 127].
     * @param {Date} checkoutExpected - Data prevista para check-out[cite: 19, 129].
     * @param {string} status - Status da reserva[cite: 19, 134, 137].
     * @param {Date | null} [checkinAt] - Timestamp do check-in efetivo (opcional)[cite: 131].
     * @param {Date | null} [checkoutAt] - Timestamp do check-out efetivo (opcional)[cite: 133].
     * @param {number | null} [estimatedAmount] - Valor estimado (opcional)[cite: 19, 138].
     * @param {number | null} [finalAmount] - Valor final (opcional)[cite: 19, 139].
     * @param {Date} [createdAt] - Timestamp de criação[cite: 19, 140].
     * @param {Date | null} [updatedAt] - Timestamp da última atualização (opcional)[cite: 147].
     */
    constructor(
        id,
        guestId,
        roomId,
        checkinExpected,
        checkoutExpected,
        status,
        checkinAt = null,
        checkoutAt = null,
        estimatedAmount = null,
        finalAmount = null,
        createdAt = new Date(),
        updatedAt = null
    ) {
        this.id = id;
        this.guestId = guestId;
        this.roomId = roomId;
        this.checkinExpected = checkinExpected;
        this.checkoutExpected = checkoutExpected;
        this.status = status;
        this.checkinAt = checkinAt;
        this.checkoutAt = checkoutAt;
        this.estimatedAmount = estimatedAmount;
        this.finalAmount = finalAmount;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}

// Constantes para os status da reserva [cite: 19, 137]
Reservation.STATUS = {
    CREATED: 'CREATED',
    CHECKED_IN: 'CHECKED_IN',
    CHECKED_OUT: 'CHECKED_OUT',
    CANCELED: 'CANCELED'
};

module.exports = Reservation;