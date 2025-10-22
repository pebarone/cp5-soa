// src/dtos/guest.dto.js
const { body } = require('express-validator');

/**
 * DTO para a requisição de criação ou atualização de um Hóspede.
 * Define os dados esperados no corpo da requisição.
 */
class GuestRequestDTO {
    /**
     * @param {object} body - O corpo da requisição HTTP.
     */
    constructor(body) {
        this.fullName = body.fullName; // string, obrigatório
        this.document = body.document; // string, obrigatório
        this.email = body.email;       // string, obrigatório
        this.phone = body.phone;       // string, opcional
    }

    static validate() {
        return [
            body('fullName').notEmpty().withMessage('O nome completo é obrigatório.'),
            body('document').notEmpty().withMessage('O documento é obrigatório.').custom(value => {
                // Aceita CPF (11 dígitos) ou CNPJ (14 dígitos), com ou sem formatação
                const cpfCnpjRegex = /^(\d{11}|\d{14}|\d{3}\.\d{3}\.\d{3}-\d{2}|\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2})$/;
                if (!cpfCnpjRegex.test(value)) {
                    throw new Error('O documento deve ser um CPF ou CNPJ válido.');
                }
                return true;
            }),
            body('email').notEmpty().withMessage('O email é obrigatório.').isEmail().withMessage('O email deve ser válido.'),
            body('phone').optional().custom(value => {
                // Aceita formatos como (XX) XXXX-XXXX, (XX) XXXXX-XXXX, XX XXXXXXXX, etc.
                const phoneRegex = /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/;
                if (value && !phoneRegex.test(value)) {
                    throw new Error('O telefone deve estar em um formato brasileiro válido.');
                }
                return true;
            })
        ];
    }

    static validateUpdate() {
        return [
            body('fullName').optional().notEmpty().withMessage('O nome completo é obrigatório.'),
            // Documento (CPF/CNPJ) não pode ser alterado, então não validamos na atualização.
            body('email').optional().isEmail().withMessage('O email deve ser válido.'),
            body('phone').optional().custom(value => {
                const phoneRegex = /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/;
                if (value && !phoneRegex.test(value)) {
                    throw new Error('O telefone deve estar em um formato brasileiro válido.');
                }
                return true;
            })
        ];
    }
}

/**
 * DTO para a resposta da API ao lidar com Hóspedes.
 * Filtra e formata os dados do modelo Guest antes de enviá-los.
 */
class GuestResponseDTO {
    /**
     * @param {Guest} guestModel 
     */
    constructor(guestModel) {
        this.id = guestModel.id;
        this.fullName = guestModel.fullName;
        this.document = guestModel.document; 
        this.email = guestModel.email;
        this.phone = guestModel.phone;
        this.createdAt = guestModel.createdAt;
    }
}

module.exports = {
    GuestRequestDTO,
    GuestResponseDTO
};