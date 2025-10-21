// src/repositories/room.repository.js
const oracledb = require('oracledb');
const { execute } = require('../config/database');
const Room = require('../models/room.model');

// Mapeamento manual Oracle -> Modelo
function mapRoomRowToModel(row) {
    return new Room(
        row.ID,
        row.NUMBER,
        row.TYPE,
        row.CAPACITY,
        row.PRICE_PER_NIGHT,
        row.STATUS
    );
}

class RoomRepository {

    /**
     * Cria um novo quarto.
     * @param {object} roomData - { id, number, type, capacity, pricePerNight, status }
     * @returns {Promise<Room>} O quarto criado.
     */
    async create(roomData) {
        const sql = `INSERT INTO RESERVAS_ROOMS (id, "NUMBER", type, capacity, price_per_night, status)
                     VALUES (:id, :number, :type, :capacity, :pricePerNight, :status)`;

        const binds = {
            id: roomData.id, // UUID gerado externamente
            number: roomData.number,
            type: roomData.type,
            capacity: roomData.capacity,
            pricePerNight: roomData.pricePerNight,
            status: roomData.status || Room.STATUS.ATIVO // Default para ATIVO
        };

        await execute(sql, binds, { autoCommit: true });
        return new Room( // Retorna o objeto com os dados inseridos
            binds.id,
            binds.number,
            binds.type,
            binds.capacity,
            binds.pricePerNight,
            binds.status
        );
    }

    /**
     * Busca um quarto pelo ID.
     * @param {string} id - O ID do quarto (UUID).
     * @returns {Promise<Room|null>} O quarto encontrado ou null.
     */
    async findById(id) {
        const sql = `SELECT id, "NUMBER", type, capacity, price_per_night, status
                     FROM RESERVAS_ROOMS
                     WHERE id = :id`;
        const result = await execute(sql, [id]);

        if (result.rows.length === 0) {
            return null;
        }
        return mapRoomRowToModel(result.rows[0]);
    }

    /**
     * Busca todos os quartos.
     * @returns {Promise<Room[]>} Uma lista de quartos.
     */
    async findAll() {
        const sql = `SELECT id, "NUMBER", type, capacity, price_per_night, status
                     FROM RESERVAS_ROOMS
                     ORDER BY "NUMBER"`;
        const result = await execute(sql);
        return result.rows.map(mapRoomRowToModel);
    }

    /**
     * Busca quartos disponíveis em um determinado período e com capacidade mínima.
     * @param {Date} checkinDate - Data de check-in.
     * @param {Date} checkoutDate - Data de check-out.
     * @param {number} requiredCapacity - Capacidade mínima requerida.
     * @returns {Promise<Room[]>} Lista de quartos disponíveis.
     */
    async findAvailable(checkinDate, checkoutDate, requiredCapacity) {
        // Query para encontrar quartos ATIVOS com capacidade >= requiredCapacity
        // que NÃO tenham reservas conflitantes (CREATED ou CHECKED_IN) no período.
        const sql = `
            SELECT r.id, r."NUMBER", r.type, r.capacity, r.price_per_night, r.status
            FROM RESERVAS_ROOMS r
            WHERE r.status = :statusAtivo
              AND r.capacity >= :requiredCapacity
              AND NOT EXISTS (
                  SELECT 1
                  FROM RESERVAS_RESERVATIONS res
                  WHERE res.room_id = r.id
                    AND res.status IN (:statusCreated, :statusCheckedIn)
                    -- Verifica sobreposição de datas:
                    -- (res.checkin_expected < :checkoutDate AND res.checkout_expected > :checkinDate)
                    AND res.checkin_expected < :checkoutDate AND res.checkout_expected > :checkinDate
              )
            ORDER BY r."NUMBER"
        `;

        const binds = {
            statusAtivo: Room.STATUS.ATIVO,
            requiredCapacity: requiredCapacity,
            statusCreated: Reservation.STATUS.CREATED, // Import Reservation model needed
            statusCheckedIn: Reservation.STATUS.CHECKED_IN, // Import Reservation model needed
            checkoutDate: checkoutDate, // Certifique-se que são objetos Date
            checkinDate: checkinDate   // Certifique-se que são objetos Date
        };

        const result = await execute(sql, binds);
        return result.rows.map(mapRoomRowToModel);
    }

    /**
     * Atualiza os dados de um quarto (exceto número e ID).
     * @param {string} id - O ID do quarto.
     * @param {object} roomData - { type, capacity, pricePerNight, status }
     * @returns {Promise<Room|null>} O quarto atualizado ou null.
     */
    async update(id, roomData) {
        const sql = `UPDATE RESERVAS_ROOMS
                     SET type = :type,
                         capacity = :capacity,
                         price_per_night = :pricePerNight,
                         status = :status
                     WHERE id = :id`;

        const binds = {
            type: roomData.type,
            capacity: roomData.capacity,
            pricePerNight: roomData.pricePerNight,
            status: roomData.status,
            id: id
        };

        const result = await execute(sql, binds, { autoCommit: true });

        if (result.rowsAffected === 0) {
            return null;
        }
        // Retornamos um novo objeto com os dados atualizados
        const currentData = await this.findById(id); // Busca para ter certeza dos dados atuais
        return currentData; // Retorna o objeto completo do DB
    }

    /**
     * Deleta um quarto pelo ID.
     * ATENÇÃO: A FK na tabela de reservas pode impedir isso se houver reservas associadas.
     * Uma alternativa é apenas marcar como INATIVO.
     * @param {string} id - O ID do quarto.
     * @returns {Promise<number>} O número de linhas afetadas.
     */
    async delete(id) {
        // Considerar apenas atualizar status para INATIVO?
        // Por ora, tentamos deletar confiando na FK.
        const sql = `DELETE FROM RESERVAS_ROOMS WHERE id = :id`;
        const result = await execute(sql, [id], { autoCommit: true });
        return result.rowsAffected;
    }

     /**
     * Atualiza o status de um quarto (ex: para INATIVO).
     * @param {string} id - O ID do quarto.
     * @param {string} newStatus - O novo status ('ATIVO' ou 'INATIVO').
     * @returns {Promise<number>} O número de linhas afetadas.
     */
    async updateStatus(id, newStatus) {
        const sql = `UPDATE RESERVAS_ROOMS SET status = :newStatus WHERE id = :id`;
        const binds = { newStatus, id };
        const result = await execute(sql, binds, { autoCommit: true });
        return result.rowsAffected;
    }
}

// Precisa importar Reservation para as constantes de status em findAvailable
const Reservation = require('../models/reservation.model');

module.exports = new RoomRepository();