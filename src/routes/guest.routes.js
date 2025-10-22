// src/routes/guest.routes.js
const express = require('express');
const { body, param } = require('express-validator'); // Para validação
const guestController = require('../controllers/guest.controller');
const validate = require('../middlewares/validation.middleware'); // Middleware de validação

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
 *           format: uuid
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
 */

// --- Regras de Validação ---
const guestValidationRules = [
    body('fullName').trim().notEmpty().withMessage('Nome completo é obrigatório.').isLength({ min: 3 }).withMessage('Nome completo deve ter pelo menos 3 caracteres.'),
    body('document').trim().notEmpty().withMessage('Documento é obrigatório.'),
    body('email').isEmail().withMessage('Formato de e-mail inválido.').normalizeEmail(),
    body('phone').optional({ checkFalsy: true }).trim().isLength({ min: 8 }).withMessage('Telefone deve ter pelo menos 8 dígitos, se informado.')
];

const guestUpdateValidationRules = [ // Permite atualizar sem reenviar tudo, valida o que vier
    body('fullName').optional().trim().notEmpty().withMessage('Nome completo não pode ser vazio.').isLength({ min: 3 }).withMessage('Nome completo deve ter pelo menos 3 caracteres.'),
    body('email').optional().isEmail().withMessage('Formato de e-mail inválido.').normalizeEmail(),
    body('phone').optional({ checkFalsy: true }).trim().isLength({ min: 8 }).withMessage('Telefone deve ter pelo menos 8 dígitos, se informado.')
    // Não valida 'document' na atualização
];

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
 *             $ref: '#/components/schemas/Guest'
 *     responses:
 *       201:
 *         description: Hóspede criado com sucesso.
 *       422:
 *         description: Erro de validação.
 */
router.post(
    '/',
    guestValidationRules, // Aplica regras de validação
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
    guestUpdateValidationRules, // Valida corpo (opcionalmente)
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
