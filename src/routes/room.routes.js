// src/routes/room.routes.js
const express = require('express');
const { param } = require('express-validator');
const roomController = require('../controllers/room.controller');
const validate = require('../middlewares/validation.middleware');
const { RoomRequestDTO } = require('../dtos/room.dto');

const router = express.Router();

// --- Regras de Validação ---
const idParamValidationRule = [
    param('id').isUUID(4).withMessage('ID de Quarto inválido (deve ser UUID v4).')
];

// --- Rotas ---

router.post(
    '/',
    RoomRequestDTO.validate(),
    validate,
    roomController.create
);

router.get(
    '/',
    // Aplica validação de query params SE eles existirem
    (req, res, next) => {
        if (req.query.availableFrom || req.query.availableTo || req.query.capacity) {
            // Executa a cadeia de validação de query
            Promise.all(RoomRequestDTO.validateAvailabilityQuery().map(validation => validation.run(req)))
                .then(() => validate(req, res, next)) // Chama o middleware de validação
                .catch(next); // Captura erros inesperados na validação
        } else {
            next(); // Pula para o controller se não houver filtros
        }
    },
    roomController.findAll
);


router.get(
    '/:id',
    idParamValidationRule,
    validate,
    roomController.findById
);

router.put(
    '/:id',
    idParamValidationRule,
    RoomRequestDTO.validateUpdate(),
    validate,
    roomController.update
);

router.patch(
    '/:id/deactivate',
    idParamValidationRule,
    validate,
    roomController.deactivate
);

router.patch(
    '/:id/activate',
    idParamValidationRule,
    validate,
    roomController.activate
);

// DELETE /rooms/:id (Descomentar se decidir implementar, mas não recomendado)
// router.delete('/:id', idParamValidationRule, validate, roomController.delete);

module.exports = router;