// src/services/guest.service.js
const guestRepository = require('../repositories/guest.repository');
const { v4: uuidv4 } = require('uuid'); // Para gerar IDs UUID
const Guest = require('../models/guest.model'); // Importa o modelo

// Classe de erro customizada para conflitos (HTTP 409)
class ConflictError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ConflictError';
        this.statusCode = 409;
    }
}

// Classe de erro customizada para não encontrado (HTTP 404)
class NotFoundError extends Error {
    constructor(message) {
        super(message);
        this.name = 'NotFoundError';
        this.statusCode = 404;
    }
}

// Classe de erro customizada para dados inválidos (HTTP 400/422)
class ValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ValidationError';
        this.statusCode = 400; // Ou 422 dependendo do contexto
    }
}


class GuestService {

    /**
     * Valida os dados básicos de um hóspede.
     * @param {object} guestData - Dados do hóspede { fullName, document, email, phone }.
     * @throws {ValidationError} Se dados forem inválidos.
     */
    _validateGuestData(guestData) {
        if (!guestData.fullName || typeof guestData.fullName !== 'string' || guestData.fullName.trim().length < 3) {
            throw new ValidationError('Nome completo é obrigatório e deve ter pelo menos 3 caracteres.');
        }
        if (!guestData.document || typeof guestData.document !== 'string' || guestData.document.trim().length === 0) {
            throw new ValidationError('Documento (CPF/Passaporte) é obrigatório.');
        }
        if (!guestData.email || typeof guestData.email !== 'string' || !guestData.email.includes('@')) { // Validação simples de email
            throw new ValidationError('E-mail inválido ou ausente.');
        }
        // Validação de telefone pode ser mais complexa, aqui apenas verifica se existe (se não for nulo)
        if (guestData.phone !== null && guestData.phone !== undefined && (typeof guestData.phone !== 'string' || guestData.phone.trim().length < 8)) {
             throw new ValidationError('Telefone inválido.');
        }
    }

    /**
     * Cria um novo hóspede após validação.
     * @param {object} guestData - Dados do hóspede { fullName, document, email, phone }.
     * @returns {Promise<Guest>} O hóspede criado.
     * @throws {ConflictError} Se email ou documento já existirem.
     * @throws {ValidationError} Se dados forem inválidos.
     */
    async createGuest(guestData) {
        this._validateGuestData(guestData);

        // Verifica duplicidade de email e documento ANTES de inserir
        const existingByEmail = await guestRepository.findByEmail(guestData.email);
        if (existingByEmail) {
            throw new ConflictError('Este e-mail já está cadastrado.');
        }
        const existingByDocument = await guestRepository.findByDocument(guestData.document);
        if (existingByDocument) {
            throw new ConflictError('Este documento já está cadastrado.');
        }

        const newGuestData = {
            id: uuidv4(), // Gera um novo UUID
            fullName: guestData.fullName,
            document: guestData.document,
            email: guestData.email,
            phone: guestData.phone || null // Garante null se não fornecido
        };

        const createdGuest = await guestRepository.create(newGuestData);
        return createdGuest;
    }

    /**
     * Busca um hóspede pelo ID.
     * @param {string} id - O ID do hóspede.
     * @returns {Promise<Guest>} O hóspede encontrado.
     * @throws {NotFoundError} Se o hóspede não for encontrado.
     */
    async getGuestById(id) {
        const guest = await guestRepository.findById(id);
        if (!guest) {
            throw new NotFoundError('Hóspede não encontrado.');
        }
        return guest;
    }

    /**
     * Busca todos os hóspedes.
     * @returns {Promise<Guest[]>} Lista de todos os hóspedes.
     */
    async getAllGuests() {
        return await guestRepository.findAll();
    }

    /**
     * Atualiza os dados de um hóspede.
     * @param {string} id - ID do hóspede a atualizar.
     * @param {object} guestUpdateData - Dados a serem atualizados { fullName, email, phone }.
     * @returns {Promise<Guest>} O hóspede atualizado.
     * @throws {NotFoundError} Se o hóspede não for encontrado.
     * @throws {ConflictError} Se o novo email já estiver em uso por outro hóspede.
     * @throws {ValidationError} Se dados forem inválidos.
     */
    async updateGuest(id, guestUpdateData) {
        // Valida apenas os campos que podem ser atualizados
        const dataToValidate = {
            fullName: guestUpdateData.fullName,
            document: 'dummy-document', // Documento não é atualizado, mas precisa passar na validação base
            email: guestUpdateData.email,
            phone: guestUpdateData.phone
        };
        this._validateGuestData(dataToValidate);

        // Garante que o hóspede existe
        const existingGuest = await this.getGuestById(id);

        // Verifica se o novo e-mail já está em uso por OUTRO hóspede
        if (guestUpdateData.email && guestUpdateData.email !== existingGuest.email) {
            const guestWithSameEmail = await guestRepository.findByEmail(guestUpdateData.email);
            if (guestWithSameEmail && guestWithSameEmail.id !== id) {
                throw new ConflictError('O e-mail informado já está em uso por outro hóspede.');
            }
        }

        // Prepara os dados para o repositório (não inclui document ou id)
        const updateData = {
            fullName: guestUpdateData.fullName,
            email: guestUpdateData.email,
            phone: guestUpdateData.phone || null
        };

        const updatedGuest = await guestRepository.update(id, updateData);
         if (!updatedGuest) {
             // Isso não deveria acontecer se getGuestById funcionou, mas por segurança
             throw new NotFoundError('Hóspede não encontrado após tentativa de atualização.');
         }
        return updatedGuest;
    }

    /**
     * Deleta um hóspede.
     * (Pode precisar adicionar lógica para verificar se há reservas associadas no futuro)
     * @param {string} id - ID do hóspede a deletar.
     * @returns {Promise<void>}
     * @throws {NotFoundError} Se o hóspede não for encontrado.
     * @throws {ConflictError} Se houver dependências (ex: reservas) - a ser implementado se necessário.
     */
    async deleteGuest(id) {
        // Garante que o hóspede existe antes de tentar deletar
        await this.getGuestById(id);

        // TODO (Opcional): Verificar se existem reservas ativas para este hóspede antes de deletar.
        // const reservations = await reservationRepository.findByGuestId(id);
        // if (reservations && reservations.some(r => r.status !== Reservation.STATUS.CANCELED && r.status !== Reservation.STATUS.CHECKED_OUT)) {
        //     throw new ConflictError('Não é possível deletar hóspede com reservas ativas.');
        // }

        const affectedRows = await guestRepository.delete(id);
        if (affectedRows === 0) {
            // Caso raro, mas possível se deletado entre o findById e o delete
             throw new NotFoundError('Hóspede não encontrado para deleção.');
        }
        // Não retorna nada em caso de sucesso
    }
}

// Exporta a CLASSE do serviço, não a instância. A instância será criada onde for usada (ex: no controller).
// module.exports = GuestService; // Se for usar injeção de dependência
module.exports = new GuestService(); // Exporta uma instância (mais simples por ora)