// src/controllers/guest.controller.js
const guestService = require('../services/guest.service');
const { GuestRequestDTO, GuestResponseDTO } = require('../dtos/guest.dto');

// Middleware para capturar erros e encaminhar para o errorHandler global
const catchAsync = fn => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

class GuestController {

    // POST /guests
    create = catchAsync(async (req, res, next) => {
        const guestRequest = new GuestRequestDTO(req.body);
        // A validação detalhada ocorre no serviço
        const newGuest = await guestService.createGuest(guestRequest);
        const guestResponse = new GuestResponseDTO(newGuest);
        res.status(201).json(guestResponse); // 201 Created [cite: 13]
    });

    // GET /guests
    findAll = catchAsync(async (req, res, next) => {
        const guests = await guestService.getAllGuests();
        const guestsResponse = guests.map(guest => new GuestResponseDTO(guest));
        res.status(200).json(guestsResponse); // 200 OK
    });

    // GET /guests/:id
    findById = catchAsync(async (req, res, next) => {
        const id = req.params.id;
        const guest = await guestService.getGuestById(id);
        // NotFoundError será capturado pelo catchAsync -> errorHandler
        const guestResponse = new GuestResponseDTO(guest);
        res.status(200).json(guestResponse); // 200 OK
    });

    // PUT /guests/:id
    update = catchAsync(async (req, res, next) => {
        const id = req.params.id;
        const guestRequest = new GuestRequestDTO(req.body);
        // A validação ocorre no serviço
        const updatedGuest = await guestService.updateGuest(id, guestRequest);
        // NotFoundError ou ConflictError serão capturados
        const guestResponse = new GuestResponseDTO(updatedGuest);
        res.status(200).json(guestResponse); // 200 OK
    });

    // DELETE /guests/:id
    delete = catchAsync(async (req, res, next) => {
        const id = req.params.id;
        await guestService.deleteGuest(id);
        // NotFoundError ou ConflictError serão capturados
        res.status(204).send(); // 204 No Content
    });
}

module.exports = new GuestController();