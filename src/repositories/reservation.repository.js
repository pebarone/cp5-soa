// src/repositories/reservation.repository.js
const oracledb = require('oracledb');
const { execute } = require('../config/database');
const Reservation = require('../models/reservation.model');

// Helper para converter Date do JavaScript para string YYYY-MM-DD
function formatDateToOracleString(date) {
    if (!date) return null;
    if (!(date instanceof Date)) return null;
    
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    
    return `${year}-${month}-${day}`;
}

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
                        :id, :guest_id, :room_id, 
                        TO_DATE(:checkin_expected, 'YYYY-MM-DD'), 
                        TO_DATE(:checkout_expected, 'YYYY-MM-DD'),
                        :status, :estimated_amount, SYSTIMESTAMP, SYSTIMESTAMP
                     )`; // created_at e updated_at inicializados

        const binds = {
            id: reservationData.id, // UUID gerado externamente
            guest_id: reservationData.guestId,
            room_id: reservationData.roomId,
            checkin_expected: formatDateToOracleString(reservationData.checkinExpected),
            checkout_expected: formatDateToOracleString(reservationData.checkoutExpected),
            status: reservationData.status || Reservation.STATUS.CREATED,
            estimated_amount: reservationData.estimatedAmount
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
        const sql = `SELECT id, guest_id, room_id,
                            TO_CHAR(checkin_expected, 'YYYY-MM-DD') as checkin_expected,
                            TO_CHAR(checkout_expected, 'YYYY-MM-DD') as checkout_expected,
                            status, checkin_at, checkout_at, estimated_amount, final_amount,
                            created_at, updated_at
                     FROM RESERVAS_RESERVATIONS 
                     WHERE id = :id`;
        const result = await execute(sql, { id });

        if (result.rows.length === 0) {
            return null;
        }
        const row = result.rows[0];
        return {
            ...mapReservationRowToModel(row),
            checkinExpected: row.CHECKIN_EXPECTED, // String YYYY-MM-DD
            checkoutExpected: row.CHECKOUT_EXPECTED // String YYYY-MM-DD
        };
    }

    /**
     * Busca todas as reservas (pode precisar de paginação no futuro).
     * @returns {Promise<Reservation[]>} Lista de reservas.
     */
    async findAll() {
        const sql = `SELECT id, guest_id, room_id, 
                            TO_CHAR(checkin_expected, 'YYYY-MM-DD') as checkin_expected,
                            TO_CHAR(checkout_expected, 'YYYY-MM-DD') as checkout_expected,
                            status, checkin_at, checkout_at, estimated_amount, final_amount, 
                            created_at, updated_at 
                     FROM RESERVAS_RESERVATIONS 
                     ORDER BY created_at DESC`;
        const result = await execute(sql);
        return result.rows.map(row => ({
            ...mapReservationRowToModel(row),
            checkinExpected: row.CHECKIN_EXPECTED, // String YYYY-MM-DD
            checkoutExpected: row.CHECKOUT_EXPECTED // String YYYY-MM-DD
        }));
    }

    /**
     * Busca reservas por ID do hóspede.
     * @param {string} guestId - ID do hóspede.
     * @returns {Promise<Reservation[]>} Lista de reservas do hóspede.
     */
    async findByGuestId(guestId) {
        const sql = `SELECT id, guest_id, room_id,
                            TO_CHAR(checkin_expected, 'YYYY-MM-DD') as checkin_expected,
                            TO_CHAR(checkout_expected, 'YYYY-MM-DD') as checkout_expected,
                            status, checkin_at, checkout_at, estimated_amount, final_amount,
                            created_at, updated_at
                     FROM RESERVAS_RESERVATIONS 
                     WHERE guest_id = :guest_id 
                     ORDER BY checkin_expected`;
        const result = await execute(sql, { guest_id: guestId });
        return result.rows.map(row => ({
            ...mapReservationRowToModel(row),
            checkinExpected: row.CHECKIN_EXPECTED,
            checkoutExpected: row.CHECKOUT_EXPECTED
        }));
    }

    /**
     * Busca reservas por ID do quarto.
     * @param {string} roomId - ID do quarto.
     * @returns {Promise<Reservation[]>} Lista de reservas do quarto.
     */
    async findByRoomId(roomId) {
        const sql = `SELECT id, guest_id, room_id,
                            TO_CHAR(checkin_expected, 'YYYY-MM-DD') as checkin_expected,
                            TO_CHAR(checkout_expected, 'YYYY-MM-DD') as checkout_expected,
                            status, checkin_at, checkout_at, estimated_amount, final_amount,
                            created_at, updated_at
                     FROM RESERVAS_RESERVATIONS 
                     WHERE room_id = :room_id 
                     ORDER BY checkin_expected`;
        const result = await execute(sql, { room_id: roomId });
        return result.rows.map(row => ({
            ...mapReservationRowToModel(row),
            checkinExpected: row.CHECKIN_EXPECTED,
            checkoutExpected: row.CHECKOUT_EXPECTED
        }));
    }

    /**
     * Busca reservas ativas (CREATED, CHECKED_IN) de um quarto que conflitam com um período.
     * @param {string} roomId - ID do quarto.
     * @param {string} checkinDate - Início do período (YYYY-MM-DD).
     * @param {string} checkoutDate - Fim do período (YYYY-MM-DD).
     * @param {string | null} excludeReservationId - Opcional: ID de uma reserva a ser excluída da verificação (útil para updates).
     * @returns {Promise<Reservation[]>} Lista de reservas conflitantes.
     */
    async findConflictingReservations(roomId, checkinDate, checkoutDate, excludeReservationId = null) {
        let sql = `SELECT * FROM RESERVAS_RESERVATIONS
                   WHERE room_id = :room_id
                     AND (status = :status_created OR status = :status_checked_in)
                     AND checkin_expected < TO_DATE(:checkout_date, 'YYYY-MM-DD')
                     AND checkout_expected > TO_DATE(:checkin_date, 'YYYY-MM-DD')`;

        const binds = {
            room_id: roomId,
            status_created: Reservation.STATUS.CREATED,
            status_checked_in: Reservation.STATUS.CHECKED_IN,
            checkout_date: checkoutDate,
            checkin_date: checkinDate
        };

        if (excludeReservationId) {
            sql += ` AND id != :exclude_id`;
            binds.exclude_id = excludeReservationId;
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
                     SET status = :new_status,
                         checkin_at = :checkin_at,
                         checkout_at = :checkout_at,
                         final_amount = :final_amount,
                         updated_at = SYSTIMESTAMP
                     WHERE id = :id`;

        const binds = {
            new_status: newStatus,
            checkin_at: checkinTime,
            checkout_at: checkoutTime,
            final_amount: finalAmount,
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
     * @param {string} newCheckinExpected - Nova data de check-in (YYYY-MM-DD).
     * @param {string} newCheckoutExpected - Nova data de check-out (YYYY-MM-DD).
     * @param {number} newEstimatedAmount - Novo valor estimado.
     * @returns {Promise<Reservation|null>} A reserva atualizada ou null.
     */
     async updateDetails(id, newCheckinExpected, newCheckoutExpected, newEstimatedAmount) {
        const sql = `UPDATE RESERVAS_RESERVATIONS
                     SET checkin_expected = TO_DATE(:checkin_expected, 'YYYY-MM-DD'),
                         checkout_expected = TO_DATE(:checkout_expected, 'YYYY-MM-DD'),
                         estimated_amount = :estimated_amount,
                         updated_at = SYSTIMESTAMP
                     WHERE id = :id AND status = :status_created`; // Só permite alterar se CREATED

        const binds = {
            checkin_expected: newCheckinExpected,
            checkout_expected: newCheckoutExpected,
            estimated_amount: newEstimatedAmount,
            id: id,
            status_created: Reservation.STATUS.CREATED
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
        const result = await execute(sql, { id }, { autoCommit: true });
        return result.rowsAffected;
    }
}

module.exports = new ReservationRepository();