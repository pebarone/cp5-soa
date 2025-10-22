// src/middlewares/validation.middleware.js

// Importa as funções necessárias do express-validator
// Certifique-se de instalar: npm install express-validator
const { validationResult } = require('express-validator');

/**
 * Middleware para verificar os resultados da validação feita pelo express-validator.
 * Se houver erros, envia uma resposta 422. Caso contrário, passa para o próximo middleware/controller.
 */
const validate = (req, res, next) => {
    // Coleta os erros de validação desta requisição
    const errors = validationResult(req);

    // Se não houver erros, continua para a próxima função na cadeia (o controller)
    if (errors.isEmpty()) {
        return next();
    }

    // Se houver erros, extrai e formata as mensagens
    // Usamos map para criar um array de objetos mais simples, focando no campo (param/path) e mensagem
    const extractedErrors = errors.array().map(err => ({
        field: err.path, // Nome do campo que falhou na validação
        message: err.msg, // Mensagem de erro definida na regra de validação
        // value: err.value // Opcional: incluir o valor que falhou
    }));

    // Retorna o status 422 Unprocessable Entity com os detalhes dos erros
    // Este status é adequado para erros de validação semântica nos dados enviados
    return res.status(422).json({
        status: 'error',
        statusCode: 422,
        message: 'Erro de validação nos dados de entrada.',
        errors: extractedErrors,
        timestamp: new Date().toISOString()
    });
};

module.exports = validate;