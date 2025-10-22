// src/routes/reservation.routes.js
const express = require('express');
const { param } = require('express-validator');
const reservationController = require('../controllers/reservation.controller');
const validate = require('../middlewares/validation.middleware');
const { CreateReservationRequestDTO, UpdateReservationRequestDTO } = require('../dtos/reservation.dto');

const router = express.Router();

// --- Regras de Validação ---
const idParamValidationRule = [
    param('id').isUUID(4).withMessage('ID de Reserva inválido (deve ser UUID v4).')
];

// --- Rotas ---

router.post(
    '/',
    CreateReservationRequestDTO.validate(),
    validate,
    reservationController.create
);

router.get(
    '/',
    [ // Validações opcionais de query params
        ...UpdateReservationRequestDTO.validateQueryFilters()
    ],
    validate, // Valida os query params se presentes
    reservationController.findAll
);

router.get(
    '/:id',
    idParamValidationRule,
    validate,
    reservationController.findById
);

router.put(
    '/:id',
    idParamValidationRule,
    UpdateReservationRequestDTO.validate(),
    validate,
    reservationController.updateDetails
);


router.patch(
    '/:id/cancel',
    idParamValidationRule,
    validate,
    reservationController.cancel
);

router.patch(
    '/:id/check-in',
    idParamValidationRule,
    validate,
    reservationController.checkIn
);

router.patch(
    '/:id/check-out',
    idParamValidationRule,
    validate,
    reservationController.checkOut
);

module.exports = router;