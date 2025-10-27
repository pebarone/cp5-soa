#!/usr/bin/env node
/**
 * Database Migration Script using Flyway
 * 
 * Este script gerencia as migrações versionadas do banco de dados usando Flyway.
 * 
 * Comandos disponíveis:
 * - migrate: Executa todas as migrações pendentes (padrão)
 * - info: Mostra o status de todas as migrações
 * - validate: Valida as migrações aplicadas contra as disponíveis
 * - clean: Remove todos os objetos do schema (CUIDADO: apenas desenvolvimento)
 * - baseline: Cria uma linha base para o versionamento em banco existente
 * 
 * Uso:
 *   node db/migrate.js [comando]
 *   npm run migrate
 *   npm run migrate:info
 *   npm run migrate:validate
 */

const { Flyway } = require('node-flywaydb');
const path = require('path');

// Load configuration
const flywayConfig = require('../flyway.config');

// Parse command from arguments
const command = process.argv[2] || 'migrate';

async function runMigration() {
  console.log('🔄 Flyway Database Migration Tool');
  console.log('==================================\n');
  
  try {
    // Initialize Flyway
    console.log('📋 Configuration:');
    console.log(`   Database: ${flywayConfig.flywayArgs.url}`);
    console.log(`   User: ${flywayConfig.flywayArgs.user}`);
    console.log(`   Migrations: ${flywayConfig.flywayArgs.locations}`);
    console.log(`   History Table: ${flywayConfig.flywayArgs.table}\n`);
    
    const flyway = new Flyway(flywayConfig);
    
    // Execute command
    switch (command.toLowerCase()) {
      case 'migrate':
        console.log('🚀 Running migrations...\n');
        const migrateResult = await flyway.migrate();
        console.log('\n✅ Migration completed successfully!');
        console.log(`   Migrations executed: ${migrateResult.migrationsExecuted}`);
        if (migrateResult.warnings && migrateResult.warnings.length > 0) {
          console.log('\n⚠️  Warnings:');
          migrateResult.warnings.forEach(w => console.log(`   - ${w}`));
        }
        break;
        
      case 'info':
        console.log('📊 Migration status:\n');
        const infoResult = await flyway.info();
        console.log('\n✅ Info retrieved successfully!');
        if (infoResult.migrations && infoResult.migrations.length > 0) {
          console.log('\n📝 Migrations:');
          infoResult.migrations.forEach(m => {
            const status = m.state === 'Success' ? '✅' : 
                          m.state === 'Pending' ? '⏳' : 
                          m.state === 'Baseline' ? '📍' : '❓';
            console.log(`   ${status} ${m.version} - ${m.description} (${m.state})`);
            console.log(`      Installed: ${m.installedOn || 'Not installed'}`);
          });
        }
        break;
        
      case 'validate':
        console.log('🔍 Validating migrations...\n');
        const validateResult = await flyway.validate();
        console.log('\n✅ Validation completed!');
        console.log(`   Valid: ${validateResult.validationSuccessful}`);
        if (!validateResult.validationSuccessful && validateResult.invalidMigrations) {
          console.log('\n❌ Invalid migrations found:');
          validateResult.invalidMigrations.forEach(m => {
            console.log(`   - ${m.version}: ${m.description}`);
            console.log(`     Error: ${m.errorMessage}`);
          });
          process.exit(1);
        }
        break;
        
      case 'clean':
        console.log('⚠️  WARNING: CLEAN will remove all objects from the schema!');
        console.log('This should ONLY be used in development environments.\n');
        
        if (process.env.NODE_ENV === 'production') {
          console.error('❌ CLEAN is disabled in production for safety!');
          process.exit(1);
        }
        
        console.log('🧹 Cleaning database schema...\n');
        await flyway.clean();
        console.log('\n✅ Database cleaned successfully!');
        break;
        
      case 'baseline':
        console.log('📍 Creating baseline...\n');
        await flyway.baseline();
        console.log('\n✅ Baseline created successfully!');
        console.log('   Future migrations will be applied on top of this baseline.');
        break;
        
      default:
        console.error(`❌ Unknown command: ${command}`);
        console.log('\nAvailable commands:');
        console.log('   migrate   - Execute pending migrations (default)');
        console.log('   info      - Show migration status');
        console.log('   validate  - Validate applied migrations');
        console.log('   clean     - Clean database schema (dev only)');
        console.log('   baseline  - Create baseline version');
        process.exit(1);
    }
    
    console.log('\n✨ Done!\n');
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Migration failed!');
    console.error('Error:', error.message);
    
    if (error.stderr) {
      console.error('\nDetails:');
      console.error(error.stderr);
    }
    
    process.exit(1);
  }
}

// Run migration
runMigration();
