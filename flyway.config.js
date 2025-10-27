// Flyway Configuration for Oracle Database
require('dotenv').config();

module.exports = {
  flywayArgs: {
    url: `jdbc:oracle:thin:@${process.env.DB_URL}`,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    locations: 'filesystem:db/migrations',
    sqlMigrationPrefix: 'V',
    sqlMigrationSeparator: '__',
    sqlMigrationSuffixes: '.sql',
    table: 'flyway_schema_history',
    baselineOnMigrate: true,
    baselineVersion: '0',
    outOfOrder: false,
    validateOnMigrate: true,
    cleanDisabled: true
  },
  // Downloads Flyway CLI if not present
  downloads: {
    storageDirectory: `${__dirname}/flyway-cli`,
    expirationTimeInMs: 86400000, // 24 hours
  },
};
