// src/repositories/guest.repository.js
const oracledb = require('oracledb');
const { execute } = require('../config/database'); // Assume que teremos essa função
const Guest = require('../models/guest.model');

// Mapeamento manual de colunas Oracle (maiúsculas) para propriedades do modelo (camelCase)
function mapGuestRowToModel(row) {
    return new Guest(
        row.ID,
        row.FULL_NAME,
        row.DOCUMENT,
        row.EMAIL,
        row.PHONE,
        row.CREATED_AT
    );
}

class GuestRepository {

    /**
     * Cria um novo hóspede no banco de dados.
     * @param {object} guestData - Dados do hóspede { id, fullName, document, email, phone }.
     * @returns {Promise<Guest>} O hóspede criado.
     */
    async create(guestData) {
        const sql = `INSERT INTO RESERVAS_GUESTS (id, full_name, document, email, phone)
                     VALUES (:id, :fullName, :document, :email, :phone)`;

        const binds = {
            id: guestData.id, // UUID deve ser gerado antes, na camada de serviço ou controller
            fullName: guestData.fullName,
            document: guestData.document,
            email: guestData.email,
            phone: guestData.phone
        };

        // Note: Oracle não retorna o registro inserido facilmente como RETURNING em todas as versões/configs.
        // Vamos confiar que a inserção funcionou e retornar o objeto original enriquecido.
        // O select * from RESERVAS_GUESTS where id = :id só funcionaria com autoCommit false e dentro da mesma transação
        await execute(sql, binds, { autoCommit: true });

        // Buscamos o registro recém-criado para obter o timestamp correto do DB
        const createdGuest = await this.findById(guestData.id);
        return createdGuest; // Retorna o objeto completo buscado do DB
    }

    /**
     * Busca um hóspede pelo ID.
     * @param {string} id - O ID do hóspede (UUID).
     * @returns {Promise<Guest|null>} O hóspede encontrado ou null.
     */
    async findById(id) {
        const sql = `SELECT id, full_name, document, email, phone, created_at
                     FROM RESERVAS_GUESTS
                     WHERE id = :id`;
        const result = await execute(sql, [id]); // Binds por array posicional

        if (result.rows.length === 0) {
            return null;
        }
        return mapGuestRowToModel(result.rows[0]);
    }

    /**
     * Busca todos os hóspedes.
     * @returns {Promise<Guest[]>} Uma lista de hóspedes.
     */
    async findAll() {
        const sql = `SELECT id, full_name, document, email, phone, created_at
                     FROM RESERVAS_GUESTS
                     ORDER BY full_name`;
        const result = await execute(sql);
        return result.rows.map(mapGuestRowToModel);
    }

    /**
     * Busca um hóspede pelo email.
     * @param {string} email - O email do hóspede.
     * @returns {Promise<Guest|null>} O hóspede encontrado ou null.
     */
    async findByEmail(email) {
        const sql = `SELECT id, full_name, document, email, phone, created_at
                     FROM RESERVAS_GUESTS
                     WHERE email = :email`;
        const result = await execute(sql, [email]);

        if (result.rows.length === 0) {
            return null;
        }
        return mapGuestRowToModel(result.rows[0]);
    }

    /**
      * Busca um hóspede pelo documento.
      * @param {string} document - O documento do hóspede.
      * @returns {Promise<Guest|null>} O hóspede encontrado ou null.
      */
    async findByDocument(document) {
        const sql = `SELECT id, full_name, document, email, phone, created_at
                     FROM RESERVAS_GUESTS
                     WHERE document = :document`;
        const result = await execute(sql, [document]);

        if (result.rows.length === 0) {
            return null;
        }
        return mapGuestRowToModel(result.rows[0]);
    }


    /**
     * Atualiza os dados de um hóspede.
     * @param {string} id - O ID do hóspede a ser atualizado.
     * @param {object} guestData - Dados a serem atualizados { fullName, email, phone }.
     * @returns {Promise<Guest|null>} O hóspede atualizado ou null se não encontrado.
     */
    async update(id, guestData) {
        // Não atualizamos document ou ID
        const sql = `UPDATE RESERVAS_GUESTS
                     SET full_name = :fullName,
                         email = :email,
                         phone = :phone
                     WHERE id = :id`;

        const binds = {
            fullName: guestData.fullName,
            email: guestData.email,
            phone: guestData.phone,
            id: id
        };

        const result = await execute(sql, binds, { autoCommit: true });

        if (result.rowsAffected === 0) {
            return null; // Ou lançar erro
        }
        return await this.findById(id); // Retorna o hóspede atualizado
    }

    /**
     * Deleta um hóspede pelo ID.
     * ATENÇÃO: Verificar regras de negócio antes de deletar (ex: se tem reservas).
     * A FK na tabela de reservas pode impedir isso.
     * @param {string} id - O ID do hóspede.
     * @returns {Promise<number>} O número de linhas afetadas (0 ou 1).
     */
    async delete(id) {
        // Adicionar verificação se o hóspede tem reservas antes de deletar?
        // Ou confiar na constraint FK? Por ora, confiamos na FK.
        const sql = `DELETE FROM RESERVAS_GUESTS WHERE id = :id`;
        const result = await execute(sql, [id], { autoCommit: true });
        return result.rowsAffected;
    }
}

// Exporta uma instância única do repositório
module.exports = new GuestRepository();