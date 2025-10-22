// src/controllers/reservation.controller.js
const reservationService = require('../services/reservation.service');
const { CreateReservationRequestDTO, UpdateReservationRequestDTO, ReservationResponseDTO } = require('../dtos/reservation.dto');
const { parseDateString } = require('../utils/dateUtils');

// Middleware para capturar erros
const catchAsync = fn => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};


class ReservationController {

    // POST /reservations
    create = catchAsync(async (req, res, next) => {
        const requestData = new CreateReservationRequestDTO(req.body);

        // As datas vêm como string YYYY-MM-DD do frontend
        // Fazemos o parse para Date usando a função utilitária
        const checkinExpectedDate = parseDateString(requestData.checkinExpected);
        const checkoutExpectedDate = parseDateString(requestData.checkoutExpected);

        // Validação (não deve acontecer se o middleware de validação funcionou)
        if (!checkinExpectedDate || !checkoutExpectedDate) {
             return res.status(400).json({ message: 'Formato de data inválido. Use YYYY-MM-DD.' });
        }

        const reservationDataForService = {
            guestId: requestData.guestId,
            roomId: requestData.roomId,
            checkinExpected: checkinExpectedDate,
            checkoutExpected: checkoutExpectedDate,
            // numberOfGuests: requestData.numberOfGuests // Se adicionar no DTO
        };

        const newReservation = await reservationService.createReservation(reservationDataForService);
        const reservationResponse = new ReservationResponseDTO(newReservation);
        res.status(201).json(reservationResponse); // 201 Created [cite: 13]
    });

    // GET /reservations/:id
    findById = catchAsync(async (req, res, next) => {
        const id = req.params.id;
        const reservation = await reservationService.getReservationById(id);
        const reservationResponse = new ReservationResponseDTO(reservation, reservation.guest, reservation.room);
        res.status(200).json(reservationResponse); // 200 OK
    });

    // GET /reservations (Pode adicionar filtros por guestId, roomId, status, datas)
    findAll = catchAsync(async (req, res, next) => {
        // Exemplo: buscar por guestId
        const { guestId, roomId } = req.query;
        let reservations;
        if (guestId) {
            reservations = await reservationService.getReservationsByGuest(guestId);
        } else if (roomId) {
            reservations = await reservationService.getReservationsByRoom(roomId);
        } else {
             // CUIDADO: buscar todas as reservas pode ser pesado. Implementar paginação.
             // Por ora, limitamos ou buscamos todas (conforme definido no service)
             reservations = await reservationService.findAll(); // Usando service
        }
        const reservationsResponse = reservations.map(r => 
            new ReservationResponseDTO(r, r.guest, r.room)
        );
        res.status(200).json(reservationsResponse);
    });

    // PATCH /reservations/:id/cancel
    cancel = catchAsync(async (req, res, next) => {
        const id = req.params.id;
        const canceledReservation = await reservationService.cancelReservation(id);
        const reservationResponse = new ReservationResponseDTO(canceledReservation);
        res.status(200).json(reservationResponse); // 200 OK
    });

    // PATCH /reservations/:id/check-in
    checkIn = catchAsync(async (req, res, next) => {
        const id = req.params.id;
        const checkedInReservation = await reservationService.checkInReservation(id);
        const reservationResponse = new ReservationResponseDTO(checkedInReservation);
        res.status(200).json(reservationResponse); // 200 OK
    });

    // PATCH /reservations/:id/check-out
    checkOut = catchAsync(async (req, res, next) => {
        const id = req.params.id;
        const checkedOutReservation = await reservationService.checkOutReservation(id);
        const reservationResponse = new ReservationResponseDTO(checkedOutReservation);
        res.status(200).json(reservationResponse); // 200 OK
    });

     // PUT /reservations/:id (Para atualizar detalhes ANTES do check-in)
     updateDetails = catchAsync(async (req, res, next) => {
        const id = req.params.id;
        const requestData = new UpdateReservationRequestDTO(req.body);

        // As datas vêm como string YYYY-MM-DD do frontend
        const checkinExpectedDate = parseDateString(requestData.checkinExpected);
        const checkoutExpectedDate = parseDateString(requestData.checkoutExpected);

        // Validação (não deve acontecer se o middleware de validação funcionou)
        if (!checkinExpectedDate || !checkoutExpectedDate) {
             return res.status(400).json({ message: 'Formato de data inválido. Use YYYY-MM-DD.' });
        }

        // Validação de datas (checkout > checkin) acontece no service
        const updatedReservation = await reservationService.updateDetails(
            id,
            checkinExpectedDate,
            checkoutExpectedDate,
            null // Deixa o service recalcular
        );

        const reservationResponse = new ReservationResponseDTO(updatedReservation);
        res.status(200).json(reservationResponse); // 200 OK
    });

}

module.exports = new ReservationController();