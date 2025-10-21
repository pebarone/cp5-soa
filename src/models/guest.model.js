// src/models/guest.model.js

/**
 * Representa um Hóspede.
 * Baseado na definição do documento.
 */
class Guest {
    /**
     * @param {string} id - Identificador único (UUID string).
     * @param {string} fullName - Nome completo do hóspede.
     * @param {string} document - Documento (CPF/Passaporte).
     * @param {string} email - Endereço de e-mail.
     * @param {string | null} phone - Número de telefone (opcional).
     * @param {Date} [createdAt] - Data de criação do registro.
     */
    constructor(id, fullName, document, email, phone = null, createdAt = new Date()) {
        this.id = id;
        this.fullName = fullName;
        this.document = document;
        this.email = email;
        this.phone = phone;
        this.createdAt = createdAt;
    }
}

module.exports = Guest;