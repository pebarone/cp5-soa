-- Apagando dados existentes para evitar duplicatas
DELETE FROM RESERVAS_RESERVATIONS;
DELETE FROM RESERVAS_GUESTS;
DELETE FROM RESERVAS_ROOMS;

-- Inserindo 10 Hóspedes (GUESTS) com UUID v4
INSERT INTO RESERVAS_GUESTS (id, full_name, document, email, phone) VALUES ('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'Ana Silva', '12345678901', 'ana.silva@example.com', '+55-11-99999-1111');
INSERT INTO RESERVAS_GUESTS (id, full_name, document, email, phone) VALUES ('b2c3d4e5-f6a7-4b6c-9d0e-1f2a3b4c5d6e', 'Bruno Souza', '98765432100', 'bruno.souza@example.com', '+55-21-98888-2222');
INSERT INTO RESERVAS_GUESTS (id, full_name, document, email, phone) VALUES ('c3d4e5f6-a7b8-4c7d-a0e1-f2a3b4c5d6e7', 'Carlos Pereira', '11122233344', 'carlos.pereira@example.com', '+55-31-97777-3333');
INSERT INTO RESERVAS_GUESTS (id, full_name, document, email, phone) VALUES ('d4e5f6a7-b8c9-4d8e-b1f2-a3b4c5d6e7f8', 'Daniela Almeida', '55566677788', 'daniela.almeida@example.com', '+55-41-96666-4444');
INSERT INTO RESERVAS_GUESTS (id, full_name, document, email, phone) VALUES ('e5f6a7b8-c9d0-4e9f-c2a3-b4c5d6e7f8g9', 'Eduardo Lima', '99988877766', 'eduardo.lima@example.com', '+55-51-95555-5555');
INSERT INTO RESERVAS_GUESTS (id, full_name, document, email, phone) VALUES ('f6a7b8c9-d0e1-4fa0-d3b4-c5d6e7f8g9h0', 'Fernanda Costa', '12312312312', 'fernanda.costa@example.com', '+55-61-94444-6666');
INSERT INTO RESERVAS_GUESTS (id, full_name, document, email, phone) VALUES ('a7b8c9d0-e1f2-4ab1-e4c5-d6e7f8g9h0i1', 'Gabriel Martins', '45645645645', 'gabriel.martins@example.com', '+55-71-93333-7777');
INSERT INTO RESERVAS_GUESTS (id, full_name, document, email, phone) VALUES ('b8c9d0e1-f2a3-4bc2-f5d6-e7f8g9h0i1j2', 'Heloisa Ribeiro', '78978978978', 'heloisa.ribeiro@example.com', '+55-81-92222-8888');
INSERT INTO RESERVAS_GUESTS (id, full_name, document, email, phone) VALUES ('c9d0e1f2-a3b4-4cd3-a6e7-f8g9h0i1j2k3', 'Igor Santos', '14725836985', 'igor.santos@example.com', '+55-91-91111-9999');
INSERT INTO RESERVAS_GUESTS (id, full_name, document, email, phone) VALUES ('d0e1f2a3-b4c5-4de4-b7f8-g9h0i1j2k3l4', 'Juliana Oliveira', '36925814752', 'juliana.oliveira@example.com', '+55-11-99876-5432');

-- Inserindo 10 Quartos (ROOMS) com UUID v4
INSERT INTO RESERVAS_ROOMS (id, "NUMBER", type, capacity, price_per_night, status) VALUES ('r1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 101, 'STANDARD', 2, 250.00, 'ATIVO');
INSERT INTO RESERVAS_ROOMS (id, "NUMBER", type, capacity, price_per_night, status) VALUES ('r2c3d4e5-f6a7-4b6c-9d0e-1f2a3b4c5d6e', 102, 'STANDARD', 2, 260.00, 'ATIVO');
INSERT INTO RESERVAS_ROOMS (id, "NUMBER", type, capacity, price_per_night, status) VALUES ('r3d4e5f6-a7b8-4c7d-a0e1-f2a3b4c5d6e7', 201, 'DELUXE', 3, 380.00, 'ATIVO');
INSERT INTO RESERVAS_ROOMS (id, "NUMBER", type, capacity, price_per_night, status) VALUES ('r4e5f6a7-b8c9-4d8e-b1f2-a3b4c5d6e7f8', 202, 'DELUXE', 3, 390.00, 'ATIVO');
INSERT INTO RESERVAS_ROOMS (id, "NUMBER", type, capacity, price_per_night, status) VALUES ('r5f6a7b8-c9d0-4e9f-c2a3-b4c5d6e7f8g9', 301, 'SUITE', 4, 520.00, 'ATIVO');
INSERT INTO RESERVAS_ROOMS (id, "NUMBER", type, capacity, price_per_night, status) VALUES ('r6a7b8c9-d0e1-4fa0-d3b4-c5d6e7f8g9h0', 302, 'SUITE', 4, 530.00, 'INATIVO');
INSERT INTO RESERVAS_ROOMS (id, "NUMBER", type, capacity, price_per_night, status) VALUES ('r7b8c9d0-e1f2-4ab1-e4c5-d6e7f8g9h0i1', 103, 'STANDARD', 1, 200.00, 'ATIVO');
INSERT INTO RESERVAS_ROOMS (id, "NUMBER", type, capacity, price_per_night, status) VALUES ('r8c9d0e1-f2a3-4bc2-f5d6-e7f8g9h0i1j2', 203, 'DELUXE', 2, 350.00, 'ATIVO');
INSERT INTO RESERVAS_ROOMS (id, "NUMBER", type, capacity, price_per_night, status) VALUES ('r9d0e1f2-a3b4-4cd3-a6e7-f8g9h0i1j2k3', 401, 'SUITE', 5, 600.00, 'ATIVO');
INSERT INTO RESERVAS_ROOMS (id, "NUMBER", type, capacity, price_per_night, status) VALUES ('s0e1f2a3-b4c5-4de4-b7f8-g9h0i1j2k3l4', 104, 'STANDARD', 2, 255.00, 'INATIVO');

-- Inserindo 10 Reservas (RESERVATIONS) com UUID v4
INSERT INTO RESERVAS_RESERVATIONS (id, guest_id, room_id, checkin_expected, checkout_expected, status, estimated_amount) VALUES ('z1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'r1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', TO_DATE('2025-11-10', 'YYYY-MM-DD'), TO_DATE('2025-11-15', 'YYYY-MM-DD'), 'CREATED', 1250.00);
INSERT INTO RESERVAS_RESERVATIONS (id, guest_id, room_id, checkin_expected, checkout_expected, status, estimated_amount) VALUES ('z2c3d4e5-f6a7-4b6c-9d0e-1f2a3b4c5d6e', 'b2c3d4e5-f6a7-4b6c-9d0e-1f2a3b4c5d6e', 'r3d4e5f6-a7b8-4c7d-a0e1-f2a3b4c5d6e7', TO_DATE('2025-12-01', 'YYYY-MM-DD'), TO_DATE('2025-12-05', 'YYYY-MM-DD'), 'CREATED', 1520.00);
INSERT INTO RESERVAS_RESERVATIONS (id, guest_id, room_id, checkin_expected, checkout_expected, status, estimated_amount) VALUES ('z3d4e5f6-a7b8-4c7d-a0e1-f2a3b4c5d6e7', 'c3d4e5f6-a7b8-4c7d-a0e1-f2a3b4c5d6e7', 'r5f6a7b8-c9d0-4e9f-c2a3-b4c5d6e7f8g9', TO_DATE('2026-01-20', 'YYYY-MM-DD'), TO_DATE('2026-01-22', 'YYYY-MM-DD'), 'CREATED', 1040.00);
INSERT INTO RESERVAS_RESERVATIONS (id, guest_id, room_id, checkin_expected, checkout_expected, status, estimated_amount) VALUES ('z4e5f6a7-b8c9-4d8e-b1f2-a3b4c5d6e7f8', 'd4e5f6a7-b8c9-4d8e-b1f2-a3b4c5d6e7f8', 'r2c3d4e5-f6a7-4b6c-9d0e-1f2a3b4c5d6e', TO_DATE('2026-02-10', 'YYYY-MM-DD'), TO_DATE('2026-02-18', 'YYYY-MM-DD'), 'CANCELED', 2080.00);
INSERT INTO RESERVAS_RESERVATIONS (id, guest_id, room_id, checkin_expected, checkout_expected, status, estimated_amount) VALUES ('z5f6a7b8-c9d0-4e9f-c2a3-b4c5d6e7f8g9', 'e5f6a7b8-c9d0-4e9f-c2a3-b4c5d6e7f8g9', 'r8c9d0e1-f2a3-4bc2-f5d6-e7f8g9h0i1j2', TO_DATE('2026-03-05', 'YYYY-MM-DD'), TO_DATE('2026-03-10', 'YYYY-MM-DD'), 'CREATED', 1750.00);
INSERT INTO RESERVAS_RESERVATIONS (id, guest_id, room_id, checkin_expected, checkout_expected, status, estimated_amount) VALUES ('z6a7b8c9-d0e1-4fa0-d3b4-c5d6e7f8g9h0', 'f6a7b8c9-d0e1-4fa0-d3b4-c5d6e7f8g9h0', 'r7b8c9d0-e1f2-4ab1-e4c5-d6e7f8g9h0i1', TO_DATE('2026-04-01', 'YYYY-MM-DD'), TO_DATE('2026-04-07', 'YYYY-MM-DD'), 'CREATED', 1200.00);
INSERT INTO RESERVAS_RESERVATIONS (id, guest_id, room_id, checkin_expected, checkout_expected, status, estimated_amount) VALUES ('z7b8c9d0-e1f2-4ab1-e4c5-d6e7f8g9h0i1', 'a7b8c9d0-e1f2-4ab1-e4c5-d6e7f8g9h0i1', 'r9d0e1f2-a3b4-4cd3-a6e7-f8g9h0i1j2k3', TO_DATE('2026-05-15', 'YYYY-MM-DD'), TO_DATE('2026-05-20', 'YYYY-MM-DD'), 'CREATED', 3000.00);
INSERT INTO RESERVAS_RESERVATIONS (id, guest_id, room_id, checkin_expected, checkout_expected, status, estimated_amount) VALUES ('z8c9d0e1-f2a3-4bc2-f5d6-e7f8g9h0i1j2', 'b8c9d0e1-f2a3-4bc2-f5d6-e7f8g9h0i1j2', 'r4e5f6a7-b8c9-4d8e-b1f2-a3b4c5d6e7f8', TO_DATE('2026-06-20', 'YYYY-MM-DD'), TO_DATE('2026-06-25', 'YYYY-MM-DD'), 'CHECKED_IN', 1950.00);
INSERT INTO RESERVAS_RESERVATIONS (id, guest_id, room_id, checkin_expected, checkout_expected, status, estimated_amount) VALUES ('z9d0e1f2-a3b4-4cd3-a6e7-f8g9h0i1j2k3', 'c9d0e1f2-a3b4-4cd3-a6e7-f8g9h0i1j2k3', 'r1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', TO_DATE('2026-07-01', 'YYYY-MM-DD'), TO_DATE('2026-07-03', 'YYYY-MM-DD'), 'CHECKED_OUT', 500.00);
INSERT INTO RESERVAS_RESERVATIONS (id, guest_id, room_id, checkin_expected, checkout_expected, status, estimated_amount) VALUES ('x0e1f2a3-b4c5-4de4-b7f8-g9h0i1j2k3l4', 'd0e1f2a3-b4c5-4de4-b7f8-g9h0i1j2k3l4', 'r3d4e5f6-a7b8-4c7d-a0e1-f2a3b4c5d6e7', TO_DATE('2026-08-10', 'YYYY-MM-DD'), TO_DATE('2026-08-12', 'YYYY-MM-DD'), 'CREATED', 760.00);

COMMIT;