#!/usr/bin/env node
/**
 * Safe Migration Runner
 * Verifica se a tabela de migrações está locked e desbloqueia se necessário
 * Também verifica se já existem migrações aplicadas
 */

const { exec } = require('child_process');
const path = require('path');

const knexfilePath = path.join(__dirname, 'knexfile.js');

function runCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        // Ignora erros de "No lock found" ou "Already at the latest migration"
        if (stdout.includes('No lock found') || 
            stdout.includes('Already at the latest migration') ||
            stderr.includes('Already at the latest migration')) {
          resolve(stdout || stderr);
          return;
        }
        reject({ error, stdout, stderr });
        return;
      }
      resolve(stdout);
    });
  });
}

async function safeMigrate() {
  try {
    console.log('🔍 Verificando lock da tabela de migrações...\n');
    
    // Tenta desbloquear (se não estiver locked, não faz nada)
    try {
      await runCommand(`npx knex migrate:unlock --knexfile ${knexfilePath}`);
      console.log('✅ Lock verificado/removido\n');
    } catch (unlockError) {
      // Se der erro, pode ser que não exista lock, continua normalmente
      console.log('ℹ️  Nenhum lock encontrado\n');
    }
    
    // Verifica o status das migrações
    console.log('📊 Verificando status das migrações...\n');
    try {
      const statusOutput = await runCommand(`npx knex migrate:status --knexfile ${knexfilePath}`);
      console.log(statusOutput);
    } catch (statusError) {
      // Se não conseguir verificar status, continua normalmente
    }
    
    // Executa as migrações
    console.log('🚀 Executando migrações pendentes...\n');
    const output = await runCommand(`npx knex migrate:latest --knexfile ${knexfilePath}`);
    console.log(output);
    
    if (output.includes('Already at the latest migration')) {
      console.log('✅ Banco de dados já está atualizado!\n');
    } else {
      console.log('✅ Migrações concluídas com sucesso!\n');
    }
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Erro ao executar migrações:');
    
    if (error.stdout) {
      console.error(error.stdout);
    }
    if (error.stderr) {
      console.error(error.stderr);
    }
    if (error.error) {
      console.error(error.error.message);
    }
    
    // Se o erro for que já existe objeto, não é crítico
    if (error.stderr && error.stderr.includes('ORA-00955')) {
      console.log('\n⚠️  Tabelas já existem. Verificando se migração foi registrada...\n');
      
      // Tenta marcar como migrado
      try {
        const config = require(knexfilePath);
        const knex = require('knex')(config);
        
        // Verifica se a migração está registrada
        const migrations = await knex('knex_migrations').select('*');
        console.log(`📋 Migrações registradas: ${migrations.length}`);
        
        if (migrations.length === 0) {
          console.log('\n⚠️  Nenhuma migração registrada mas tabelas existem.');
          console.log('💡 Execute manualmente: npm run migrate:unlock');
          console.log('   Ou delete as tabelas para recriar tudo.\n');
        }
        
        await knex.destroy();
      } catch (checkError) {
        console.log('⚠️  Não foi possível verificar registro de migrações');
      }
      
      process.exit(0); // Não falha se tabelas já existem
    }
    
    process.exit(1);
  }
}

safeMigrate();
