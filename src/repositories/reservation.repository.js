// src/repositories/reservation.repository.js
const oracledb = require('oracledb');
const { execute } = require('../config/database');
const Reservation = require('../models/reservation.model');

// Mapeamento Oracle -> Modelo
function mapReservationRowToModel(row) {
    // Atenção com datas e timestamps retornados pelo Oracle
    return new Reservation(
        row.ID,
        row.GUEST_ID,
        row.ROOM_ID,
        row.CHECKIN_EXPECTED, // O driver oracledb pode retornar como Date
        row.CHECKOUT_EXPECTED, // O driver oracledb pode retornar como Date
        row.STATUS,
        row.CHECKIN_AT, // Pode ser null
        row.CHECKOUT_AT, // Pode ser null
        row.ESTIMATED_AMOUNT, // Pode ser null
        row.FINAL_AMOUNT, // Pode ser null
        row.CREATED_AT,
        row.UPDATED_AT // Pode ser null
    );
}

class ReservationRepository {

    /**
     * Cria uma nova reserva.
     * @param {object} reservationData - Dados da reserva.
     * @returns {Promise<Reservation>} A reserva criada.
     */
    async create(reservationData) {
        const sql = `INSERT INTO RESERVAS_RESERVATIONS (
                        id, guest_id, room_id, checkin_expected, checkout_expected,
                        status, estimated_amount, created_at, updated_at
                     ) VALUES (
                        :id, :guestId, :roomId, :checkinExpected, :checkoutExpected,
                        :status, :estimatedAmount, SYSTIMESTAMP, SYSTIMESTAMP
                     )`; // created_at e updated_at inicializados

        const binds = {
            id: reservationData.id, // UUID gerado externamente
            guestId: reservationData.guestId,
            roomId: reservationData.roomId,
            checkinExpected: reservationData.checkinExpected, // Espera-se objeto Date
            checkoutExpected: reservationData.checkoutExpected, // Espera-se objeto Date
            status: reservationData.status || Reservation.STATUS.CREATED,
            estimatedAmount: reservationData.estimatedAmount
        };

        await execute(sql, binds, { autoCommit: true });
        return await this.findById(reservationData.id); // Busca para retornar o objeto completo com timestamps
    }

    /**
     * Busca uma reserva pelo ID.
     * @param {string} id - O ID da reserva (UUID).
     * @returns {Promise<Reservation|null>} A reserva encontrada ou null.
     */
    async findById(id) {
        const sql = `SELECT * FROM RESERVAS_RESERVATIONS WHERE id = :id`;
        const result = await execute(sql, [id]);

        if (result.rows.length === 0) {
            return null;
        }
        return mapReservationRowToModel(result.rows[0]);
    }

    /**
     * Busca todas as reservas (pode precisar de paginação no futuro).
     * @returns {Promise<Reservation[]>} Lista de reservas.
     */
    async findAll() {
        const sql = `SELECT * FROM RESERVAS_RESERVATIONS ORDER BY created_at DESC`;
        const result = await execute(sql);
        return result.rows.map(mapReservationRowToModel);
    }

    /**
     * Busca reservas por ID do hóspede.
     * @param {string} guestId - ID do hóspede.
     * @returns {Promise<Reservation[]>} Lista de reservas do hóspede.
     */
    async findByGuestId(guestId) {
        const sql = `SELECT * FROM RESERVAS_RESERVATIONS WHERE guest_id = :guestId ORDER BY checkin_expected`;
        const result = await execute(sql, [guestId]);
        return result.rows.map(mapReservationRowToModel);
    }

    /**
     * Busca reservas por ID do quarto.
     * @param {string} roomId - ID do quarto.
     * @returns {Promise<Reservation[]>} Lista de reservas do quarto.
     */
    async findByRoomId(roomId) {
        const sql = `SELECT * FROM RESERVAS_RESERVATIONS WHERE room_id = :roomId ORDER BY checkin_expected`;
        const result = await execute(sql, [roomId]);
        return result.rows.map(mapReservationRowToModel);
    }

    /**
     * Busca reservas ativas (CREATED, CHECKED_IN) de um quarto que conflitam com um período.
     * @param {string} roomId - ID do quarto.
     * @param {Date} checkinDate - Início do período.
     * @param {Date} checkoutDate - Fim do período.
     * @param {string | null} excludeReservationId - Opcional: ID de uma reserva a ser excluída da verificação (útil para updates).
     * @returns {Promise<Reservation[]>} Lista de reservas conflitantes.
     */
    async findConflictingReservations(roomId, checkinDate, checkoutDate, excludeReservationId = null) {
        let sql = `SELECT * FROM RESERVAS_RESERVATIONS
                   WHERE room_id = :roomId
                     AND status IN (:statusCreated, :statusCheckedIn)
                     AND checkin_expected < :checkoutDate
                     AND checkout_expected > :checkinDate`;

        const binds = {
            roomId: roomId,
            statusCreated: Reservation.STATUS.CREATED,
            statusCheckedIn: Reservation.STATUS.CHECKED_IN,
            checkoutDate: checkoutDate,
            checkinDate: checkinDate
        };

        if (excludeReservationId) {
            sql += ` AND id != :excludeId`;
            binds.excludeId = excludeReservationId;
        }

        const result = await execute(sql, binds);
        return result.rows.map(mapReservationRowToModel);
    }

    /**
     * Atualiza o status e timestamps de uma reserva (Check-in, Check-out, Cancel).
     * @param {string} id - ID da reserva.
     * @param {string} newStatus - Novo status.
     * @param {Date | null} checkinTime - Timestamp de check-in (se aplicável).
     * @param {Date | null} checkoutTime - Timestamp de check-out (se aplicável).
     * @param {number | null} finalAmount - Valor final (se aplicável).
     * @returns {Promise<Reservation|null>} A reserva atualizada ou null.
     */
    async updateStatus(id, newStatus, checkinTime = null, checkoutTime = null, finalAmount = null) {
        const sql = `UPDATE RESERVAS_RESERVATIONS
                     SET status = :newStatus,
                         checkin_at = :checkinAt,
                         checkout_at = :checkoutAt,
                         final_amount = :finalAmount,
                         updated_at = SYSTIMESTAMP
                     WHERE id = :id`;

        const binds = {
            newStatus: newStatus,
            checkinAt: checkinTime,
            checkoutAt: checkoutTime,
            finalAmount: finalAmount,
            id: id
        };

        const result = await execute(sql, binds, { autoCommit: true });

        if (result.rowsAffected === 0) {
            return null;
        }
        return await this.findById(id);
    }

     /**
     * Atualiza dados editáveis de uma reserva (datas previstas, valor estimado).
     * Usado antes do check-in.
     * @param {string} id - ID da reserva.
     * @param {Date} newCheckinExpected - Nova data de check-in prevista.
     * @param {Date} newCheckoutExpected - Nova data de check-out prevista.
     * @param {number} newEstimatedAmount - Novo valor estimado.
     * @returns {Promise<Reservation|null>} A reserva atualizada ou null.
     */
     async updateDetails(id, newCheckinExpected, newCheckoutExpected, newEstimatedAmount) {
        const sql = `UPDATE RESERVAS_RESERVATIONS
                     SET checkin_expected = :checkinExpected,
                         checkout_expected = :checkoutExpected,
                         estimated_amount = :estimatedAmount,
                         updated_at = SYSTIMESTAMP
                     WHERE id = :id AND status = :statusCreated`; // Só permite alterar se CREATED

        const binds = {
            checkinExpected: newCheckinExpected,
            checkoutExpected: newCheckoutExpected,
            estimatedAmount: newEstimatedAmount,
            id: id,
            statusCreated: Reservation.STATUS.CREATED
        };

        const result = await execute(sql, binds, { autoCommit: true });

        if (result.rowsAffected === 0) {
            // Pode ser que não achou o ID ou o status não era CREATED
            const existing = await this.findById(id);
            if (!existing) return null; // Não achou
            throw new Error(`Só é possível alterar detalhes de reservas com status ${Reservation.STATUS.CREATED}. Status atual: ${existing.status}`);
        }
        return await this.findById(id);
    }


    /**
     * Deleta uma reserva pelo ID.
     * Geralmente, prefere-se cancelar (mudar status) a deletar.
     * @param {string} id - O ID da reserva.
     * @returns {Promise<number>} O número de linhas afetadas.
     */
    async delete(id) {
        const sql = `DELETE FROM RESERVAS_RESERVATIONS WHERE id = :id`;
        const result = await execute(sql, [id], { autoCommit: true });
        return result.rowsAffected;
    }
}

module.exports = new ReservationRepository();