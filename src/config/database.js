// src/config/database.js
require('dotenv').config();
const oracledb = require('oracledb');

// Resultados em formato objeto
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

// Validação das variáveis de ambiente
['DB_USER', 'DB_PASSWORD', 'DB_URL'].forEach(v => {
  if (!process.env[v]) {
    console.error(`Variável de ambiente ${v} não definida`);
    process.exit(1);
  }
});

// Configuração do pool
const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  connectString: process.env.DB_URL,
  poolMin: 2,
  poolMax: 4,
  poolIncrement: 1
};

let pool;

async function startup() {
  console.log("Iniciando pool de conexões com o Oracle...");
  try {
    pool = await oracledb.createPool(dbConfig);
    console.log("Pool de conexões iniciado com sucesso.");
  } catch (err) {
    console.error("Erro fatal ao iniciar o pool de conexões:", err);
    process.exit(1);
  }
}

async function shutdown() {
  console.log("Fechando pool de conexões...");
  try {
    if (pool) {
      await pool.close(10); // espera até 10s para conexões fecharem
      console.log("Pool de conexões fechado.");
    }
  } catch (err) {
    console.error("Erro ao fechar o pool de conexões:", err);
  }
}

async function execute(sql, binds = [], options = {}) {
  let connection;
  try {
    connection = await pool.getConnection();
    
    // Configura o timezone da sessão para America/Sao_Paulo (GMT-3)
    await connection.execute(`ALTER SESSION SET TIME_ZONE = 'America/Sao_Paulo'`);
    
    const result = await connection.execute(sql, binds, { autoCommit: true, ...options });
    return result;
  } catch (err) {
    console.error("Erro ao executar query:", err);
    throw err;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Erro ao devolver a conexão ao pool:", err);
      }
    }
  }
}

module.exports = {
  startup,
  shutdown,
  execute
};
