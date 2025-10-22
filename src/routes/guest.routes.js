// src/routes/guest.routes.js
const express = require('express');
const { param } = require('express-validator');
const guestController = require('../controllers/guest.controller');
const validate = require('../middlewares/validation.middleware');
const { GuestRequestDTO } = require('../dtos/guest.dto');

const router = express.Router();

// --- Regras de Validação ---
const idParamValidationRule = [
    param('id').isUUID(4).withMessage('ID de Hóspede inválido (deve ser UUID v4).')
];

// --- Rotas ---

router.post(
    '/',
    GuestRequestDTO.validate(), // Aplica regras de validação do DTO
    validate, // Verifica os resultados da validação
    guestController.create
);

router.get('/', guestController.findAll);

router.get(
    '/:id',
    idParamValidationRule, // Valida o parâmetro ID
    validate,
    guestController.findById
);

router.put(
    '/:id',
    idParamValidationRule, // Valida ID
    GuestRequestDTO.validateUpdate(), // Valida corpo (opcionalmente)
    validate,
    guestController.update
);

router.delete(
    '/:id',
    idParamValidationRule, // Valida ID
    validate,
    guestController.delete
);

module.exports = router;