// src/routes/reservation.routes.js
const express = require('express');
const { body, param, query } = require('express-validator');
const reservationController = require('../controllers/reservation.controller');
const validate = require('../middlewares/validation.middleware');
const Reservation = require('../models/reservation.model'); // Para constantes

const router = express.Router();

// --- Regras de Validação ---
const createReservationValidationRules = [
    body('guestId').isUUID(4).withMessage('ID de Hóspede inválido (UUID v4).'),
    body('roomId').isUUID(4).withMessage('ID de Quarto inválido (UUID v4).'),
    body('checkinExpected')
        .matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Data de check-in prevista deve estar no formato YYYY-MM-DD.')
        .custom((value) => {
            const date = new Date(value + 'T00:00:00'); // Força timezone local
            if (isNaN(date.getTime())) {
                throw new Error('Data de check-in prevista inválida.');
            }
            return true;
        }),
    body('checkoutExpected')
        .matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Data de check-out prevista deve estar no formato YYYY-MM-DD.')
        .custom((value, { req }) => {
            const checkoutDate = new Date(value + 'T00:00:00');
            if (isNaN(checkoutDate.getTime())) {
                throw new Error('Data de check-out prevista inválida.');
            }
            
            if (req.body.checkinExpected) {
                const checkinDate = new Date(req.body.checkinExpected + 'T00:00:00');
                if (checkoutDate <= checkinDate) {
                    throw new Error('Data de check-out prevista deve ser posterior à data de check-in prevista.');
                }
            }
            return true;
        })
    // body('numberOfGuests').optional().isInt({ gt: 0 }).withMessage('Número de hóspedes deve ser inteiro positivo.')
];

const updateReservationValidationRules = [ // Apenas datas podem ser atualizadas
    body('checkinExpected')
        .matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Data de check-in prevista deve estar no formato YYYY-MM-DD.')
        .custom((value) => {
            const date = new Date(value + 'T00:00:00');
            if (isNaN(date.getTime())) {
                throw new Error('Data de check-in prevista inválida.');
            }
            return true;
        }),
    body('checkoutExpected')
        .matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Data de check-out prevista deve estar no formato YYYY-MM-DD.')
        .custom((value, { req }) => {
            const checkoutDate = new Date(value + 'T00:00:00');
            if (isNaN(checkoutDate.getTime())) {
                throw new Error('Data de check-out prevista inválida.');
            }
            
            if (req.body.checkinExpected) {
                const checkinDate = new Date(req.body.checkinExpected + 'T00:00:00');
                if (checkoutDate <= checkinDate) {
                    throw new Error('Data de check-out prevista deve ser posterior à data de check-in prevista.');
                }
            }
            return true;
        })
];


const idParamValidationRule = [
    param('id').isUUID(4).withMessage('ID de Reserva inválido (deve ser UUID v4).')
];

// --- Rotas ---

/**
 * @swagger
 * /api/reservations:
 *   post:
 *     summary: Cria uma nova reserva.
 *     tags: [Reservations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Reservation'
 *     responses:
 *       201:
 *         description: Reserva criada com sucesso.
 *       422:
 *         description: Erro de validação.
 */
router.post(
    '/',
    createReservationValidationRules,
    validate,
    reservationController.create
);

/**
 * @swagger
 * /api/reservations:
 *   get:
 *     summary: Retorna a lista de todas as reservas.
 *     tags: [Reservations]
 *     parameters:
 *       - in: query
 *         name: guestId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: O ID do hóspede.
 *       - in: query
 *         name: roomId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: O ID do quarto.
 *     responses:
 *       200:
 *         description: A lista de reservas.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Reservation'
 */
router.get(
    '/',
    [ // Validações opcionais de query params
        query('guestId').optional().isUUID(4).withMessage('ID de Hóspede inválido (UUID v4).'),
        query('roomId').optional().isUUID(4).withMessage('ID de Quarto inválido (UUID v4).')
        // Adicionar validação para status ou datas se implementar esses filtros
    ],
    validate, // Valida os query params se presentes
    reservationController.findAll
);

/**
 * @swagger
 * /api/reservations/{id}:
 *   get:
 *     summary: Retorna uma reserva pelo ID.
 *     tags: [Reservations]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: O ID da reserva.
 *     responses:
 *       200:
 *         description: A reserva encontrada.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Reservation'
 *       404:
 *         description: Reserva não encontrada.
 */
router.get(
    '/:id',
    idParamValidationRule,
    validate,
    reservationController.findById
);

/**
 * @swagger
 * /api/reservations/{id}:
 *   put:
 *     summary: Atualiza uma reserva pelo ID.
 *     tags: [Reservations]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: O ID da reserva.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Reservation'
 *     responses:
 *       200:
 *         description: Reserva atualizada com sucesso.
 *       404:
 *         description: Reserva não encontrada.
 *       422:
 *         description: Erro de validação.
 */
router.put(
    '/:id',
    idParamValidationRule,
    updateReservationValidationRules,
    validate,
    reservationController.updateDetails
);


/**
 * @swagger
 * /api/reservations/{id}/cancel:
 *   patch:
 *     summary: Cancela uma reserva.
 *     tags: [Reservations]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: O ID da reserva.
 *     responses:
 *       200:
 *         description: Reserva cancelada com sucesso.
 *       404:
 *         description: Reserva não encontrada.
 */
router.patch(
    '/:id/cancel',
    idParamValidationRule,
    validate,
    reservationController.cancel
);

/**
 * @swagger
 * /api/reservations/{id}/check-in:
 *   patch:
 *     summary: Faz o check-in de uma reserva.
 *     tags: [Reservations]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: O ID da reserva.
 *     responses:
 *       200:
 *         description: Check-in realizado com sucesso.
 *       404:
 *         description: Reserva não encontrada.
 */
router.patch(
    '/:id/check-in',
    idParamValidationRule,
    validate,
    reservationController.checkIn
);

/**
 * @swagger
 * /api/reservations/{id}/check-out:
 *   patch:
 *     summary: Faz o check-out de uma reserva.
 *     tags: [Reservations]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: O ID da reserva.
 *     responses:
 *       200:
 *         description: Check-out realizado com sucesso.
 *       404:
 *         description: Reserva não encontrada.
 */
router.patch(
    '/:id/check-out',
    idParamValidationRule,
    validate,
    reservationController.checkOut
);

module.exports = router;
