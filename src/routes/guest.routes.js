// src/routes/guest.routes.js
const express = require('express');
const { param } = require('express-validator'); // Para validação
const guestController = require('../controllers/guest.controller');
const validate = require('../middlewares/validation.middleware'); // Middleware de validação
const { GuestRequestDTO } = require('../dtos/guest.dto'); // Importa o DTO

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Guest:
 *       type: object
 *       required:
 *         - fullName
 *         - document
 *         - email
 *       properties:
 *         id:
 *           type: string
 *           description: O ID do hóspede.
 *         fullName:
 *           type: string
 *           description: O nome completo do hóspede.
 *         document:
 *           type: string
 *           description: O documento do hóspede.
 *         email:
 *           type: string
 *           format: email
 *           description: O email do hóspede.
 *         phone:
 *           type: string
 *           description: O telefone do hóspede.
 *       example:
 *         id: "a1b2c3d4-e5f6-7890-1234-567890abcdef"
 *         fullName: "John Doe"
 *         document: "12345678900"
 *         email: "john.doe@example.com"
 *         phone: "11987654321"
 *     NewGuest:
 *       type: object
 *       required:
 *         - fullName
 *         - document
 *         - email
 *       properties:
 *         fullName:
 *           type: string
 *           description: O nome completo do hóspede.
 *         document:
 *           type: string
 *           description: O documento do hóspede.
 *         email:
 *           type: string
 *           format: email
 *           description: O email do hóspede.
 *         phone:
 *           type: string
 *           description: O telefone do hóspede.
 *       example:
 *         fullName: "Jane Doe"
 *         document: "09876543211"
 *         email: "jane.doe@example.com"
 *         phone: "11912345678"
 */

// --- Regras de Validação ---
const idParamValidationRule = [
    param('id').isUUID(4).withMessage('ID de Hóspede inválido (deve ser UUID v4).')
];

// --- Rotas ---

/**
 * @swagger
 * /api/guests:
 *   post:
 *     summary: Cria um novo hóspede.
 *     tags: [Guests]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NewGuest'
 *     responses:
 *       201:
 *         description: Hóspede criado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Guest'
 *       422:
 *         description: Erro de validação.
 */
router.post(
    '/',
    GuestRequestDTO.validate(), // Aplica regras de validação do DTO
    validate, // Verifica os resultados da validação
    guestController.create
);

/**
 * @swagger
 * /api/guests:
 *   get:
 *     summary: Retorna a lista de todos os hóspedes.
 *     tags: [Guests]
 *     responses:
 *       200:
 *         description: A lista de hóspedes.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Guest'
 */
router.get('/', guestController.findAll);

/**
 * @swagger
 * /api/guests/{id}:
 *   get:
 *     summary: Retorna um hóspede pelo ID.
 *     tags: [Guests]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: O ID do hóspede.
 *     responses:
 *       200:
 *         description: O hóspede encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Guest'
 *       404:
 *         description: Hóspede não encontrado.
 */
router.get(
    '/:id',
    idParamValidationRule, // Valida o parâmetro ID
    validate,
    guestController.findById
);

/**
 * @swagger
 * /api/guests/{id}:
 *   put:
 *     summary: Atualiza um hóspede pelo ID.
 *     tags: [Guests]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: O ID do hóspede.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Guest'
 *     responses:
 *       200:
 *         description: Hóspede atualizado com sucesso.
 *       404:
 *         description: Hóspede não encontrado.
 *       422:
 *         description: Erro de validação.
 */
router.put(
    '/:id',
    idParamValidationRule, // Valida ID
    GuestRequestDTO.validateUpdate(), // Valida corpo (opcionalmente)
    validate,
    guestController.update
);

/**
 * @swagger
 * /api/guests/{id}:
 *   delete:
 *     summary: Deleta um hóspede pelo ID.
 *     tags: [Guests]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: O ID do hóspede.
 *     responses:
 *       204:
 *         description: Hóspede deletado com sucesso.
 *       404:
 *         description: Hóspede não encontrado.
 */
router.delete(
    '/:id',
    idParamValidationRule, // Valida ID
    validate,
    guestController.delete
);

module.exports = router;
