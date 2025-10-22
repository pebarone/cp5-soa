// app.js - Ponto de entrada da aplicação
require('dotenv').config(); // Carrega variáveis de ambiente do arquivo .env
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');
const path = require('path');

const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Reserva de Hotel',
      version: '1.0.0',
      description: 'Documentação da API de Reserva de Hotel',
    },
  },
  apis: ['./src/routes/*.js'], // Caminho para os arquivos de rotas
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

// const rateLimit = require('express-rate-limit'); // Descomentar se quiser usar rate limiting

const database = require('./src/config/database'); // Configuração do banco de dados Oracle
const apiRoutes = require('./src/routes'); // Roteador principal da API (src/routes/index.js)
const errorHandler = require('./src/middlewares/errorHandler'); // Middleware global de erro

// Carrega o arquivo de definição do Swagger/OpenAPI



// --- Inicia a conexão com o banco de dados ANTES de iniciar o servidor ---
database.startup()
    .then(() => {
        // --- Configuração do Express ---
        const app = express();

        // Middlewares essenciais
    
        app.use(express.json()); // Habilita o parsing de JSON no corpo das requisições
        app.use(express.urlencoded({ extended: true })); // Habilita parsing de dados de formulário

        // --- Rota da Documentação Swagger ---
        // Servir a UI do Swagger no endpoint /api-docs
        app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

        // --- Rota Principal da API ---
        // Monta todas as rotas definidas em src/routes/index.js sob o prefixo /api
        app.use('/api', apiRoutes);

        // --- Rota Raiz (Opcional) ---
        app.use('/', express.static(path.join(__dirname, 'static')));

        // --- Rota Catch-All para 404 (Não encontrado) ---
        // Deve vir DEPOIS de todas as outras rotas da API
        app.use((req, res, next) => {
            res.status(404).json({
                status: 'error',
                statusCode: 404,
                message: `Endpoint não encontrado: ${req.method} ${req.originalUrl}`,
                timestamp: new Date().toISOString()
            });
        });


        // --- Middleware Global de Tratamento de Erros ---
        // Deve ser o ÚLTIMO middleware a ser adicionado
        app.use(errorHandler);

        // --- Inicialização do Servidor ---
        const PORT = process.env.PORT || 3000; // Usa a porta do .env ou 3000 como padrão
        app.listen(PORT, () => {
            console.log(`Servidor rodando na porta ${PORT}`);
            console.log(`Documentação Swagger disponível em http://localhost:${PORT}/api-docs`);
        });

    })
    .catch(err => {
        // Erro grave ao conectar ao banco, a aplicação não pode iniciar.
        console.error("Erro CRÍTICO ao iniciar a conexão com o banco de dados:", err);
        process.exit(1); // Termina a aplicação com código de erro
    });


// --- Graceful Shutdown (Opcional, mas boa prática) ---
// Garante que o pool de conexões do Oracle seja fechado corretamente ao terminar
process.on('SIGINT', async () => {
    console.log('Recebido SIGINT. Fechando servidor e pool de conexões...');
    await database.shutdown();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('Recebido SIGTERM. Fechando servidor e pool de conexões...');
    await database.shutdown();
    process.exit(0);
});