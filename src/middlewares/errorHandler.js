// src/middlewares/errorHandler.js

/**
 * Middleware global para tratamento de erros.
 * Captura erros passados via next(error) e envia uma resposta JSON padronizada.
 */
function errorHandler(err, req, res, next) {
    // Log do erro completo no console para debugging (importante em desenvolvimento)
    console.error('------------------------------------');
    console.error(`Timestamp: ${new Date().toISOString()}`);
    console.error(`Request URL: ${req.originalUrl}`);
    console.error(`Request Method: ${req.method}`);
    console.error(err.stack || err); // Loga o stack trace ou o erro
    console.error('------------------------------------');

    // Determina o status code: usa o statusCode do erro (definido nos services)
    // ou assume 500 (Internal Server Error) como padrão.
    const statusCode = err.statusCode || 500;

    // Determina a mensagem: usa a mensagem do erro ou uma genérica.
    const message = err.message || 'Ocorreu um erro interno no servidor.';

    // Monta o payload de erro padronizado 
    const errorResponse = {
        status: 'error',
        statusCode: statusCode,
        message: message,
        timestamp: new Date().toISOString()
    };

    // Envia a resposta de erro
    res.status(statusCode).json(errorResponse);
}

module.exports = errorHandler;