// src/routes/reservation.routes.js
const express = require('express');
const { body, param, query } = require('express-validator');
const reservationController = require('../controllers/reservation.controller');
const validate = require('../middlewares/validation.middleware');
const Reservation = require('../models/reservation.model'); // Para constantes

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Reservation:
 *       type: object
 *       required:
 *         - guestId
 *         - roomId
 *         - checkinExpected
 *         - checkoutExpected
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: O ID da reserva.
 *         guestId:
 *           type: string
 *           format: uuid
 *           description: O ID do hóspede.
 *         roomId:
 *           type: string
 *           format: uuid
 *           description: O ID do quarto.
 *         checkinExpected:
 *           type: string
 *           format: date
 *           description: A data de check-in esperada.
 *         checkoutExpected:
 *           type: string
 *           format: date
 *           description: A data de check-out esperada.
 *         checkinAt:
 *           type: string
 *           format: date-time
 *           description: A data e hora do check-in.
 *         checkoutAt:
 *           type: string
 *           format: date-time
 *           description: A data e hora do check-out.
 *         status:
 *           type: string
 *           description: O status da reserva.
 *           enum: [Pendente, Confirmada, Check-in, Check-out, Cancelada]
 *       example:
 *         id: "a1b2c3d4-e5f6-7890-1234-567890abcdef"
 *         guestId: "a1b2c3d4-e5f6-7890-1234-567890abcdef"
 *         roomId: "a1b2c3d4-e5f6-7890-1234-567890abcdef"
 *         checkinExpected: "2025-12-24"
 *         checkoutExpected: "2025-12-26"
 *         status: "Pendente"
 */

// --- Regras de Validação ---
const createReservationValidationRules = [
    body('guestId').isUUID(4).withMessage('ID de Hóspede inválido (UUID v4).'),
    body('roomId').isUUID(4).withMessage('ID de Quarto inválido (UUID v4).'),
    body('checkinExpected').isISO8601().toDate().withMessage('Data de check-in prevista inválida (YYYY-MM-DD).'),
    body('checkoutExpected').isISO8601().toDate().withMessage('Data de check-out prevista inválida (YYYY-MM-DD).')
        // Validação customizada para garantir checkout > checkin (após conversão)
        .custom((value, { req }) => {
            if (req.body.checkinExpected) {
                const checkinDate = new Date(req.body.checkinExpected);
                const checkoutDate = new Date(value);
                 // Compara apenas a data, ignorando a hora
                 checkinDate.setUTCHours(0, 0, 0, 0);
                 checkoutDate.setUTCHours(0, 0, 0, 0);
                if (checkoutDate <= checkinDate) {
                    throw new Error('Data de check-out prevista deve ser posterior à data de check-in prevista.');
                }
            }
            return true;
        })
    // body('numberOfGuests').optional().isInt({ gt: 0 }).withMessage('Número de hóspedes deve ser inteiro positivo.')
];

const updateReservationValidationRules = [ // Apenas datas podem ser atualizadas
    body('checkinExpected').isISO8601().toDate().withMessage('Data de check-in prevista inválida (YYYY-MM-DD).'),
    body('checkoutExpected').isISO8601().toDate().withMessage('Data de check-out prevista inválida (YYYY-MM-DD).')
        .custom((value, { req }) => {
            if (req.body.checkinExpected) {
                 const checkinDate = new Date(req.body.checkinExpected);
                 const checkoutDate = new Date(value);
                 checkinDate.setUTCHours(0, 0, 0, 0);
                 checkoutDate.setUTCHours(0, 0, 0, 0);
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
