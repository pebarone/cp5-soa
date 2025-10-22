// src/dtos/room.dto.js
const { body, query } = require('express-validator');
const Room = require('../models/room.model'); // Para constantes

/**
 * DTO para a requisição de criação ou atualização de um Quarto.
 */
class RoomRequestDTO {
    /**
     * @param {object} body - O corpo da requisição HTTP.
     */
    constructor(body) {
        this.number = body.number;           // number, obrigatório na criação
        this.type = body.type;               // string ('STANDARD', 'DELUXE', 'SUITE'), obrigatório
        this.capacity = body.capacity;       // number, obrigatório
        this.pricePerNight = body.pricePerNight; // number, obrigatório
        this.status = body.status;           // string ('ATIVO', 'INATIVO'), opcional (default 'ATIVO')
    }

    /**
     * Validações para criação de um quarto.
     */
    static validate() {
        return [
            body('number').isInt({ gt: 0 }).withMessage('Número do quarto deve ser um inteiro positivo.'),
            body('type').isIn(Object.values(Room.TYPES)).withMessage(`Tipo inválido. Válidos: ${Object.values(Room.TYPES).join(', ')}.`),
            body('capacity').isInt({ gt: 0 }).withMessage('Capacidade deve ser um inteiro positivo.'),
            body('pricePerNight').isFloat({ gt: -0.01 }).withMessage('Preço por noite deve ser um número não negativo.'),
            body('status').optional().isIn(Object.values(Room.STATUS)).withMessage(`Status inválido. Válidos: ${Object.values(Room.STATUS).join(', ')}.`)
        ];
    }

    /**
     * Validações para atualização de um quarto (campos opcionais).
     */
    static validateUpdate() {
        return [
            body('type').optional().isIn(Object.values(Room.TYPES)).withMessage(`Tipo inválido. Válidos: ${Object.values(Room.TYPES).join(', ')}.`),
            body('capacity').optional().isInt({ gt: 0 }).withMessage('Capacidade deve ser um inteiro positivo.'),
            body('pricePerNight').optional().isFloat({ gt: -0.01 }).withMessage('Preço por noite deve ser um número não negativo.'),
            body('status').optional().isIn(Object.values(Room.STATUS)).withMessage(`Status inválido. Válidos: ${Object.values(Room.STATUS).join(', ')}.`)
        ];
    }

    /**
     * Validações para query params de disponibilidade.
     */
    static validateAvailabilityQuery() {
        return [
            query('availableFrom').optional().isISO8601().toDate().withMessage('Data inicial inválida (formato YYYY-MM-DD).'),
            query('availableTo').optional().isISO8601().toDate().withMessage('Data final inválida (formato YYYY-MM-DD).'),
            query('capacity').optional().isInt({ gt: 0 }).withMessage('Capacidade deve ser um inteiro positivo.')
        ];
    }
}

/**
 * DTO para a resposta da API ao lidar com Quartos.
 */
class RoomResponseDTO {
    /**
     * @param {Room} roomModel - A instância do modelo Room.
     */
    constructor(roomModel) {
        this.id = roomModel.id;
        this.number = roomModel.number;
        this.type = roomModel.type;
        this.capacity = roomModel.capacity;
        this.pricePerNight = roomModel.pricePerNight;
        this.status = roomModel.status;
    }
}

module.exports = {
    RoomRequestDTO,
    RoomResponseDTO
};