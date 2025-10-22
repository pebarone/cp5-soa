// src/controllers/room.controller.js
const roomService = require('../services/room.service');
const { RoomRequestDTO, RoomResponseDTO } = require('../dtos/room.dto');

// Middleware para capturar erros
const catchAsync = fn => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

class RoomController {

    // POST /rooms
    create = catchAsync(async (req, res, next) => {
        const roomRequest = new RoomRequestDTO(req.body);
        const newRoom = await roomService.createRoom(roomRequest);
        const roomResponse = new RoomResponseDTO(newRoom);
        res.status(201).json(roomResponse); // 201 Created [cite: 13]
    });

    // GET /rooms
    findAll = catchAsync(async (req, res, next) => {
        // Possível filtro por disponibilidade? Ex: /rooms?availableFrom=YYYY-MM-DD&availableTo=YYYY-MM-DD&capacity=2
        const { availableFrom, availableTo, capacity } = req.query;

        let rooms;
        // Verifica se pelo menos um filtro de disponibilidade foi fornecido
        if (availableFrom || availableTo || capacity) {
            // Se algum filtro foi fornecido, todos são necessários
            if (!availableFrom || !availableTo) {
                return res.status(400).json({ 
                    message: 'Para filtrar por disponibilidade, forneça as datas de check-in (availableFrom) e check-out (availableTo).' 
                });
            }

            // Converte as strings de data para objetos Date
            const checkinDate = new Date(availableFrom);
            const checkoutDate = new Date(availableTo);
            const requiredCapacity = capacity ? parseInt(capacity, 10) : 1; // Capacidade padrão = 1

            // Validações básicas antes de chamar o service
            if (isNaN(checkinDate.getTime()) || isNaN(checkoutDate.getTime())) {
                 return res.status(400).json({ message: 'Parâmetros de data inválidos.' });
            }
            if (capacity && (isNaN(requiredCapacity) || requiredCapacity <= 0)) {
                return res.status(400).json({ message: 'Capacidade deve ser um número inteiro positivo.' });
            }
             if (checkoutDate <= checkinDate) {
                 return res.status(400).json({ message: 'Data de check-out deve ser posterior à data de check-in.' });
            }

            rooms = await roomService.findAvailableRooms(checkinDate, checkoutDate, requiredCapacity);
        } else {
            rooms = await roomService.getAllRooms();
        }

        const roomsResponse = rooms.map(room => new RoomResponseDTO(room));
        res.status(200).json(roomsResponse); // 200 OK
    });

    // GET /rooms/:id
    findById = catchAsync(async (req, res, next) => {
        const id = req.params.id;
        const room = await roomService.getRoomById(id);
        const roomResponse = new RoomResponseDTO(room);
        res.status(200).json(roomResponse); // 200 OK
    });

    // PUT /rooms/:id
    update = catchAsync(async (req, res, next) => {
        const id = req.params.id;
        const roomRequest = new RoomRequestDTO(req.body);
        // Omitir 'number' da validação/atualização se necessário
        const updatedRoom = await roomService.updateRoom(id, roomRequest);
        const roomResponse = new RoomResponseDTO(updatedRoom);
        res.status(200).json(roomResponse); // 200 OK
    });

    // PATCH /rooms/:id/deactivate (ou PUT com status no body)
    deactivate = catchAsync(async (req, res, next) => {
        const id = req.params.id;
        const deactivatedRoom = await roomService.deactivateRoom(id); // Usa o método específico do service
        const roomResponse = new RoomResponseDTO(deactivatedRoom);
        res.status(200).json(roomResponse); // 200 OK
    });

     // PATCH /rooms/:id/activate (ou PUT com status no body)
    activate = catchAsync(async (req, res, next) => {
        const id = req.params.id;
        const activatedRoom = await roomService.activateRoom(id); // Usa o método específico do service
        const roomResponse = new RoomResponseDTO(activatedRoom);
        res.status(200).json(roomResponse); // 200 OK
    });


    // DELETE /rooms/:id (Não recomendado pela regra de negócio, usar deactivate)
    // delete = catchAsync(async (req, res, next) => {
    //     const id = req.params.id;
    //     await roomService.deleteRoom(id); // O service lançará ConflictError se houver reservas
    //     res.status(204).send(); // 204 No Content
    // });
}

module.exports = new RoomController();