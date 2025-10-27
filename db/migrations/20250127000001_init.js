exports.up = async function(knex) {
  console.log('Criando tabelas...');
  
  try { await knex.raw('DROP TABLE RESERVAS_RESERVATIONS CASCADE CONSTRAINTS'); } catch (e) {}
  try { await knex.raw('DROP TABLE RESERVAS_ROOMS CASCADE CONSTRAINTS'); } catch (e) {}
  try { await knex.raw('DROP TABLE RESERVAS_GUESTS CASCADE CONSTRAINTS'); } catch (e) {}
  
  await knex.schema.createTable('RESERVAS_GUESTS', (table) => {
    table.string('id', 36).primary();
    table.string('full_name', 120).notNullable();
    table.string('document', 30).notNullable().unique();
    table.string('email', 120).notNullable().unique();
    table.string('phone', 30);
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('RESERVAS_ROOMS', (table) => {
    table.string('id', 36).primary();
    table.integer('NUMBER').notNullable().unique();
    table.string('TYPE', 20).notNullable();
    table.integer('capacity').notNullable();
    table.decimal('price_per_night', 10, 2).notNullable();
    table.string('status', 20).notNullable();
    table.check('"TYPE" IN (\'STANDARD\', \'DELUXE\', \'SUITE\')', [], 'chk_reservas_rooms_type');
    table.check('"status" IN (\'ATIVO\', \'INATIVO\')', [], 'chk_reservas_rooms_status');
  });

  await knex.schema.createTable('RESERVAS_RESERVATIONS', (table) => {
    table.string('id', 36).primary();
    table.string('guest_id', 36).notNullable();
    table.string('room_id', 36).notNullable();
    table.date('checkin_expected').notNullable();
    table.date('checkout_expected').notNullable();
    table.timestamp('checkin_at');
    table.timestamp('checkout_at');
    table.string('status', 20).notNullable();
    table.decimal('price_per_night_at_booking', 10, 2).notNullable();
    table.decimal('estimated_amount', 10, 2);
    table.decimal('final_amount', 10, 2);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at');
    table.foreign('guest_id').references('id').inTable('RESERVAS_GUESTS');
    table.foreign('room_id').references('id').inTable('RESERVAS_ROOMS');
    table.check('"status" IN (\'CREATED\', \'CHECKED_IN\', \'CHECKED_OUT\', \'CANCELED\')', [], 'chk_reservas_reservations_status');
  });

  await knex.schema.table('RESERVAS_ROOMS', (table) => {
    table.index('status', 'idx_reservas_rooms_status');
  });
  
  await knex.schema.table('RESERVAS_RESERVATIONS', (table) => {
    table.index('room_id', 'idx_reservas_reservations_room');
    table.index('status', 'idx_reservas_reservations_status');
    table.index(['checkin_expected', 'checkout_expected'], 'idx_reservas_res_date_range');
  });

  console.log('OK!');
};

exports.down = async function(knex) {
  try { await knex.raw('DROP TABLE RESERVAS_RESERVATIONS CASCADE CONSTRAINTS'); } catch (e) {}
  try { await knex.raw('DROP TABLE RESERVAS_ROOMS CASCADE CONSTRAINTS'); } catch (e) {}
  try { await knex.raw('DROP TABLE RESERVAS_GUESTS CASCADE CONSTRAINTS'); } catch (e) {}
};
