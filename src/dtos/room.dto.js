// src/dtos/room.dto.js
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