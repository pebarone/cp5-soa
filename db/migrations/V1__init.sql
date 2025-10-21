-- ========= SCRIPT DE CRIAÇÃO DE TABELAS PARA ORACLE - SISTEMA DE RESERVAS (v2) ==========

-- --- LIMPEZA (Apaga tabelas existentes na ordem correta para FKs) ---
BEGIN
    EXECUTE IMMEDIATE 'DROP TABLE RESERVAS_RESERVATIONS CASCADE CONSTRAINTS';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE != -942 THEN RAISE; END IF;
END;
/

BEGIN
    EXECUTE IMMEDIATE 'DROP TABLE RESERVAS_ROOMS CASCADE CONSTRAINTS';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE != -942 THEN RAISE; END IF;
END;
/

BEGIN
    EXECUTE IMMEDIATE 'DROP TABLE RESERVAS_GUESTS CASCADE CONSTRAINTS';
EXCEPTION
    WHEN OTHERS THEN
        IF SQLCODE != -942 THEN RAISE; END IF;
END;
/


-- --- CRIAÇÃO DAS TABELAS ---

-- Tabela de Hóspedes
CREATE TABLE RESERVAS_GUESTS (
    id                VARCHAR2(36) NOT NULL,
    full_name         VARCHAR2(120) NOT NULL,
    document          VARCHAR2(30) NOT NULL,
    email             VARCHAR2(120) NOT NULL,
    phone             VARCHAR2(30),
    created_at        TIMESTAMP DEFAULT SYSTIMESTAMP,
    CONSTRAINT pk_reservas_guests PRIMARY KEY (id),
    CONSTRAINT uq_reservas_guests_document UNIQUE (document),
    CONSTRAINT uq_reservas_guests_email UNIQUE (email)
);
COMMENT ON TABLE RESERVAS_GUESTS IS 'Tabela para armazenar informações dos hóspedes.';
COMMENT ON COLUMN RESERVAS_GUESTS.id IS 'Identificador único do hóspede (UUID em string).';
COMMENT ON COLUMN RESERVAS_GUESTS.full_name IS 'Nome completo do hóspede.';
COMMENT ON COLUMN RESERVAS_GUESTS.document IS 'Documento do hóspede (CPF, Passaporte, etc.). Deve ser único.';
COMMENT ON COLUMN RESERVAS_GUESTS.email IS 'Endereço de e-mail do hóspede. Deve ser único.';
COMMENT ON COLUMN RESERVAS_GUESTS.phone IS 'Número de telefone do hóspede.';
COMMENT ON COLUMN RESERVAS_GUESTS.created_at IS 'Timestamp de quando o registro do hóspede foi criado.';


-- Tabela de Quartos
CREATE TABLE RESERVAS_ROOMS (
    id                VARCHAR2(36) NOT NULL,
    "NUMBER"          NUMBER NOT NULL, -- Quoted because NUMBER is a keyword
    type              VARCHAR2(20) NOT NULL,
    capacity          NUMBER NOT NULL,
    price_per_night   NUMBER(10,2) NOT NULL,
    status            VARCHAR2(20) NOT NULL,
    CONSTRAINT pk_reservas_rooms PRIMARY KEY (id),
    CONSTRAINT uq_reservas_rooms_number UNIQUE ("NUMBER"), -- Use quoted name here too
    CONSTRAINT chk_reservas_rooms_type CHECK (type IN ('STANDARD', 'DELUXE', 'SUITE')),
    CONSTRAINT chk_reservas_rooms_status CHECK (status IN ('ATIVO', 'INATIVO'))
);
COMMENT ON TABLE RESERVAS_ROOMS IS 'Tabela para armazenar informações dos quartos do hotel.';
COMMENT ON COLUMN RESERVAS_ROOMS.id IS 'Identificador único do quarto (UUID em string).';
COMMENT ON COLUMN RESERVAS_ROOMS."NUMBER" IS 'Número do quarto. Deve ser único.'; -- Use quoted name
COMMENT ON COLUMN RESERVAS_ROOMS.type IS 'Tipo do quarto (STANDARD, DELUXE, SUITE).';
COMMENT ON COLUMN RESERVAS_ROOMS.capacity IS 'Capacidade máxima de hóspedes do quarto.';
COMMENT ON COLUMN RESERVAS_ROOMS.price_per_night IS 'Preço base da diária do quarto.';
COMMENT ON COLUMN RESERVAS_ROOMS.status IS 'Status do quarto (ATIVO, INATIVO).';


-- Tabela de Reservas
CREATE TABLE RESERVAS_RESERVATIONS (
    id                VARCHAR2(36) NOT NULL,
    guest_id          VARCHAR2(36) NOT NULL,
    room_id           VARCHAR2(36) NOT NULL,
    checkin_expected  DATE NOT NULL,
    checkout_expected DATE NOT NULL,
    checkin_at        TIMESTAMP,
    checkout_at       TIMESTAMP,
    status            VARCHAR2(20) NOT NULL,
    estimated_amount  NUMBER(10,2),
    final_amount      NUMBER(10,2),
    created_at        TIMESTAMP DEFAULT SYSTIMESTAMP,
    updated_at        TIMESTAMP,
    CONSTRAINT pk_reservas_reservations PRIMARY KEY (id),
    CONSTRAINT fk_reservas_reservations_guest FOREIGN KEY (guest_id) REFERENCES RESERVAS_GUESTS(id),
    CONSTRAINT fk_reservas_reservations_room FOREIGN KEY (room_id) REFERENCES RESERVAS_ROOMS(id),
    CONSTRAINT chk_reservas_reservations_status CHECK (status IN ('CREATED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELED'))
);
COMMENT ON TABLE RESERVAS_RESERVATIONS IS 'Tabela para armazenar as reservas de quartos.';
COMMENT ON COLUMN RESERVAS_RESERVATIONS.id IS 'Identificador único da reserva (UUID em string).';
COMMENT ON COLUMN RESERVAS_RESERVATIONS.guest_id IS 'ID do hóspede que fez a reserva.';
COMMENT ON COLUMN RESERVAS_RESERVATIONS.room_id IS 'ID do quarto reservado.';
COMMENT ON COLUMN RESERVAS_RESERVATIONS.checkin_expected IS 'Data prevista para check-in.';
COMMENT ON COLUMN RESERVAS_RESERVATIONS.checkout_expected IS 'Data prevista para check-out.';
COMMENT ON COLUMN RESERVAS_RESERVATIONS.checkin_at IS 'Timestamp do check-in efetivo.';
COMMENT ON COLUMN RESERVAS_RESERVATIONS.checkout_at IS 'Timestamp do check-out efetivo.';
COMMENT ON COLUMN RESERVAS_RESERVATIONS.status IS 'Status atual da reserva (CREATED, CHECKED_IN, CHECKED_OUT, CANCELED).';
COMMENT ON COLUMN RESERVAS_RESERVATIONS.estimated_amount IS 'Valor estimado da reserva no momento da criação.';
COMMENT ON COLUMN RESERVAS_RESERVATIONS.final_amount IS 'Valor final calculado no check-out.';
COMMENT ON COLUMN RESERVAS_RESERVATIONS.created_at IS 'Timestamp de quando a reserva foi criada.';
COMMENT ON COLUMN RESERVAS_RESERVATIONS.updated_at IS 'Timestamp da última atualização da reserva.';


-- --- CRIAÇÃO DE ÍNDICES ÚTEIS ---
CREATE INDEX idx_reservas_rooms_status ON RESERVAS_ROOMS (status);
CREATE INDEX idx_reservas_reservations_room ON RESERVAS_RESERVATIONS (room_id);
CREATE INDEX idx_reservas_reservations_status ON RESERVAS_RESERVATIONS (status);
CREATE INDEX idx_reservas_res_date_range ON RESERVAS_RESERVATIONS (checkin_expected, checkout_expected);


-- --- SEED (exemplos) ---
INSERT INTO RESERVAS_GUESTS (id, full_name, document, email, phone) VALUES ('11111111-1111-1111-1111-111111111111', 'Ana Silva', '12345678901', 'ana@example.com', '+55-11-99999-1111');
INSERT INTO RESERVAS_GUESTS (id, full_name, document, email, phone) VALUES ('22222222-2222-2222-2222-222222222222', 'Bruno Souza', '98765432100', 'bruno@example.com', '+55-21-98888-2222');

INSERT INTO RESERVAS_ROOMS (id, "NUMBER", type, capacity, price_per_night, status) VALUES ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 101, 'STANDARD', 2, 250.00, 'ATIVO'); -- Use quoted name
INSERT INTO RESERVAS_ROOMS (id, "NUMBER", type, capacity, price_per_night, status) VALUES ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 201, 'DELUXE', 3, 380.00, 'ATIVO'); -- Use quoted name
INSERT INTO RESERVAS_ROOMS (id, "NUMBER", type, capacity, price_per_night, status) VALUES ('cccccccc-cccc-cccc-cccc-cccccccccccc', 301, 'SUITE', 4, 520.00, 'ATIVO'); -- Use quoted name

INSERT INTO RESERVAS_RESERVATIONS (id, guest_id, room_id, checkin_expected, checkout_expected, status, estimated_amount, created_at)
VALUES (
    '99999999-9999-9999-9999-999999999999',
    '11111111-1111-1111-1111-111111111111',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    TO_DATE('2025-11-05', 'YYYY-MM-DD'),
    TO_DATE('2025-11-07', 'YYYY-MM-DD'),
    'CREATED',
    500.00, -- 2 * 250.00
    SYSTIMESTAMP
);

COMMIT;

-- ========= FIM DO SCRIPT ==========