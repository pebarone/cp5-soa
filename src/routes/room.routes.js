// src/routes/room.routes.js
const express = require('express');
const { body, param, query } = require('express-validator');
const roomController = require('../controllers/room.controller');
const validate = require('../middlewares/validation.middleware');
const Room = require('../models/room.model'); // Para constantes

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Room:
 *       type: object
 *       required:
 *         - number
 *         - type
 *         - capacity
 *         - pricePerNight
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: O ID do quarto.
 *         number:
 *           type: integer
 *           description: O número do quarto.
 *         type:
 *           type: string
 *           description: O tipo do quarto.
 *           enum: [Solteiro, Casal, Família, Presidencial]
 *         capacity:
 *           type: integer
 *           description: A capacidade do quarto.
 *         pricePerNight:
 *           type: number
 *           format: float
 *           description: O preço por noite.
 *         status:
 *           type: string
 *           description: O status do quarto.
 *           enum: [Disponível, Ocupado, Manutenção, Inativo]
 *       example:
 *         id: "a1b2c3d4-e5f6-7890-1234-567890abcdef"
 *         number: 101
 *         type: "Casal"
 *         capacity: 2
 *         pricePerNight: 150.50
 *         status: "Disponível"
 */

// --- Regras de Validação ---
const roomCreateValidationRules = [
    body('number').isInt({ gt: 0 }).withMessage('Número do quarto deve ser um inteiro positivo.'),
    body('type').isIn(Object.values(Room.TYPES)).withMessage(`Tipo inválido. Válidos: ${Object.values(Room.TYPES).join(', ')}.`),
    body('capacity').isInt({ gt: 0 }).withMessage('Capacidade deve ser um inteiro positivo.'),
    body('pricePerNight').isFloat({ gt: -0.01 }).withMessage('Preço por noite deve ser um número não negativo.'),
    body('status').optional().isIn(Object.values(Room.STATUS)).withMessage(`Status inválido. Válidos: ${Object.values(Room.STATUS).join(', ')}.`)
];

const roomUpdateValidationRules = [ // Similar, mas campos são opcionais
    body('type').optional().isIn(Object.values(Room.TYPES)).withMessage(`Tipo inválido. Válidos: ${Object.values(Room.TYPES).join(', ')}.`),
    body('capacity').optional().isInt({ gt: 0 }).withMessage('Capacidade deve ser um inteiro positivo.'),
    body('pricePerNight').optional().isFloat({ gt: -0.01 }).withMessage('Preço por noite deve ser um número não negativo.'),
    body('status').optional().isIn(Object.values(Room.STATUS)).withMessage(`Status inválido. Válidos: ${Object.values(Room.STATUS).join(', ')}.`)
    // Não permite atualizar 'number' via PUT
];

const idParamValidationRule = [
    param('id').isUUID(4).withMessage('ID de Quarto inválido (deve ser UUID v4).')
];

const availabilityQueryValidationRules = [
    query('availableFrom').isISO8601().toDate().withMessage('Data inicial inválida (formato YYYY-MM-DD).'),
    query('availableTo').isISO8601().toDate().withMessage('Data final inválida (formato YYYY-MM-DD).'),
    query('capacity').isInt({ gt: 0 }).withMessage('Capacidade deve ser um inteiro positivo.')
];

// --- Rotas ---

/**
 * @swagger
 * /api/rooms:
 *   post:
 *     summary: Cria um novo quarto.
 *     tags: [Rooms]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Room'
 *     responses:
 *       201:
 *         description: Quarto criado com sucesso.
 *       422:
 *         description: Erro de validação.
 */
router.post(
    '/',
    roomCreateValidationRules,
    validate,
    roomController.create
);

/**
 * @swagger
 * /api/rooms:
 *   get:
 *     summary: Retorna a lista de todos os quartos ou quartos disponíveis.
 *     tags: [Rooms]
 *     parameters:
 *       - in: query
 *         name: availableFrom
 *         schema:
 *           type: string
 *           format: date
 *         description: Data de início da disponibilidade.
 *       - in: query
 *         name: availableTo
 *         schema:
 *           type: string
 *           format: date
 *         description: Data de fim da disponibilidade.
 *       - in: query
 *         name: capacity
 *         schema:
 *           type: integer
 *         description: Capacidade do quarto.
 *     responses:
 *       200:
 *         description: A lista de quartos.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Room'
 */
router.get(
    '/',
    // Aplica validação de query params SE eles existirem
    (req, res, next) => {
        if (req.query.availableFrom || req.query.availableTo || req.query.capacity) {
            // Executa a cadeia de validação de query
            Promise.all(availabilityQueryValidationRules.map(validation => validation.run(req)))
                .then(() => validate(req, res, next)) // Chama o middleware de validação
                .catch(next); // Captura erros inesperados na validação
        } else {
            next(); // Pula para o controller se não houver filtros
        }
    },
    roomController.findAll
);


/**
 * @swagger
 * /api/rooms/{id}:
 *   get:
 *     summary: Retorna um quarto pelo ID.
 *     tags: [Rooms]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: O ID do quarto.
 *     responses:
 *       200:
 *         description: O quarto encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Room'
 *       404:
 *         description: Quarto não encontrado.
 */
router.get(
    '/:id',
    idParamValidationRule,
    validate,
    roomController.findById
);

/**
 * @swagger
 * /api/rooms/{id}:
 *   put:
 *     summary: Atualiza um quarto pelo ID.
 *     tags: [Rooms]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: O ID do quarto.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Room'
 *     responses:
 *       200:
 *         description: Quarto atualizado com sucesso.
 *       404:
 *         description: Quarto não encontrado.
 *       422:
 *         description: Erro de validação.
 */
router.put(
    '/:id',
    idParamValidationRule,
    roomUpdateValidationRules,
    validate,
    roomController.update
);

/**
 * @swagger
 * /api/rooms/{id}/deactivate:
 *   patch:
 *     summary: Desativa um quarto.
 *     tags: [Rooms]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: O ID do quarto.
 *     responses:
 *       200:
 *         description: Quarto desativado com sucesso.
 *       404:
 *         description: Quarto não encontrado.
 */
router.patch(
    '/:id/deactivate',
    idParamValidationRule,
    validate,
    roomController.deactivate
);

/**
 * @swagger
 * /api/rooms/{id}/activate:
 *   patch:
 *     summary: Reativa um quarto.
 *     tags: [Rooms]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: O ID do quarto.
 *     responses:
 *       200:
 *         description: Quarto reativado com sucesso.
 *       404:
 *         description: Quarto não encontrado.
 */
router.patch(
    '/:id/activate',
    idParamValidationRule,
    validate,
    roomController.activate
);

// DELETE /rooms/:id (Descomentar se decidir implementar, mas não recomendado)
// router.delete('/:id', idParamValidationRule, validate, roomController.delete);

module.exports = router;
