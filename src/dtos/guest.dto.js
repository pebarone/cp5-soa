// src/dtos/guest.dto.js
const { body } = require('express-validator');

/**
 * Valida CPF brasileiro
 * @param {string} cpf - CPF com ou sem formatação
 * @returns {boolean}
 */
function isValidCPF(cpf) {
    // Remove caracteres não numéricos
    cpf = cpf.replace(/[^\d]/g, '');
    
    // Verifica se tem 11 dígitos
    if (cpf.length !== 11) return false;
    
    // Verifica se todos os dígitos são iguais (ex: 111.111.111-11)
    if (/^(\d)\1{10}$/.test(cpf)) return false;
    
    // Validação do primeiro dígito verificador
    let sum = 0;
    for (let i = 0; i < 9; i++) {
        sum += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let digit = 11 - (sum % 11);
    if (digit >= 10) digit = 0;
    if (digit !== parseInt(cpf.charAt(9))) return false;
    
    // Validação do segundo dígito verificador
    sum = 0;
    for (let i = 0; i < 10; i++) {
        sum += parseInt(cpf.charAt(i)) * (11 - i);
    }
    digit = 11 - (sum % 11);
    if (digit >= 10) digit = 0;
    if (digit !== parseInt(cpf.charAt(10))) return false;
    
    return true;
}

/**
 * Valida CNPJ brasileiro
 * @param {string} cnpj - CNPJ com ou sem formatação
 * @returns {boolean}
 */
function isValidCNPJ(cnpj) {
    // Remove caracteres não numéricos
    cnpj = cnpj.replace(/[^\d]/g, '');
    
    // Verifica se tem 14 dígitos
    if (cnpj.length !== 14) return false;
    
    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1{13}$/.test(cnpj)) return false;
    
    // Validação do primeiro dígito verificador
    let length = cnpj.length - 2;
    let numbers = cnpj.substring(0, length);
    const digits = cnpj.substring(length);
    let sum = 0;
    let pos = length - 7;
    
    for (let i = length; i >= 1; i--) {
        sum += parseInt(numbers.charAt(length - i)) * pos--;
        if (pos < 2) pos = 9;
    }
    
    let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== parseInt(digits.charAt(0))) return false;
    
    // Validação do segundo dígito verificador
    length = length + 1;
    numbers = cnpj.substring(0, length);
    sum = 0;
    pos = length - 7;
    
    for (let i = length; i >= 1; i--) {
        sum += parseInt(numbers.charAt(length - i)) * pos--;
        if (pos < 2) pos = 9;
    }
    
    result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== parseInt(digits.charAt(1))) return false;
    
    return true;
}

/**
 * Valida se é CPF ou CNPJ válido
 * @param {string} value - Documento com ou sem formatação
 * @returns {boolean}
 */
function isValidCPForCNPJ(value) {
    if (!value) return false;
    
    const cleanValue = value.replace(/[^\d]/g, '');
    
    if (cleanValue.length === 11) {
        return isValidCPF(cleanValue);
    } else if (cleanValue.length === 14) {
        return isValidCNPJ(cleanValue);
    }
    
    return false;
}

/**
 * DTO para a requisição de criação ou atualização de um Hóspede.
 * Define os dados esperados no corpo da requisição.
 */
class GuestRequestDTO {
    /**
     * @param {object} body - O corpo da requisição HTTP.
     */
    constructor(body) {
        this.fullName = body.fullName; 
        // Remove formatação do documento antes de salvar
        this.document = body.document ? body.document.replace(/[^\d]/g, '') : body.document;
        this.email = body.email;       
        this.phone = body.phone;       
    }

    static validate() {
        return [
            body('fullName').notEmpty().withMessage('O nome completo é obrigatório.'),
            body('document')
                .notEmpty().withMessage('O documento é obrigatório.')
                .custom(value => {
                    if (!isValidCPForCNPJ(value)) {
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
            body('fullName').optional().notEmpty().withMessage('O nome completo não pode ser vazio.'),
            body('document')
                .optional()
                .custom(value => {
                    if (value && !isValidCPForCNPJ(value)) {
                        throw new Error('O documento deve ser um CPF ou CNPJ válido.');
                    }
                    return true;
                }),
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