// Knex Configuration for Oracle Database Migrations
const path = require('path');

// Load .env from the root directory
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

module.exports = {
  client: 'oracledb',
  connection: {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    connectString: process.env.DB_URL,
  },
  migrations: {
    directory: './migrations',
    tableName: 'knex_migrations',
    extension: 'js',
    loadExtensions: ['.js']
  },
  pool: {
    min: 2,
    max: 10
  }
};
