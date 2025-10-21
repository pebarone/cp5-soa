// src/models/room.model.js

/**
 * Representa um Quarto do hotel.
 * Baseado na definição do documento[cite: 18].
 */
class Room {
    /**
     * @param {string} id - Identificador único (UUID string)[cite: 94, 99].
     * @param {number} number - Número do quarto (único)[cite: 18, 95].
     * @param {string} type - Tipo do quarto (STANDARD, DELUXE, SUITE)[cite: 18, 96, 105].
     * @param {number} capacity - Capacidade de hóspedes[cite: 18, 97].
     * @param {number} pricePerNight - Preço base da diária[cite: 18, 98].
     * @param {string} status - Status do quarto (ATIVO, INATIVO)[cite: 18, 113, 112].
     */
    constructor(id, number, type, capacity, pricePerNight, status) {
        this.id = id;
        this.number = number;
        this.type = type;
        this.capacity = capacity;
        this.pricePerNight = pricePerNight;
        this.status = status;
    }
}

// Constantes para os tipos de quarto [cite: 18, 105]
Room.TYPES = {
    STANDARD: 'STANDARD',
    DELUXE: 'DELUXE',
    SUITE: 'SUITE'
};

// Constantes para os status do quarto [cite: 18, 112]
Room.STATUS = {
    ATIVO: 'ATIVO',
    INATIVO: 'INATIVO'
};

module.exports = Room;