// src/dtos/guest.dto.js

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
}

/**
 * DTO para a resposta da API ao lidar com Hóspedes.
 * Filtra e formata os dados do modelo Guest antes de enviá-los.
 */
class GuestResponseDTO {
    /**
     * @param {Guest} guestModel - A instância do modelo Guest.
     */
    constructor(guestModel) {
        this.id = guestModel.id;
        this.fullName = guestModel.fullName;
        this.document = guestModel.document; // Considerar mascarar se necessário
        this.email = guestModel.email;
        this.phone = guestModel.phone;
        this.createdAt = guestModel.createdAt;
    }
}

module.exports = {
    GuestRequestDTO,
    GuestResponseDTO
};