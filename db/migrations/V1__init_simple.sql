-- Tabela de Hóspedes
CREATE TABLE RESERVAS_GUESTS (
    id VARCHAR2(36) NOT NULL,
    full_name VARCHAR2(120) NOT NULL,
    document VARCHAR2(30) NOT NULL,
    email VARCHAR2(120) NOT NULL,
    phone VARCHAR2(30),
    created_at TIMESTAMP DEFAULT SYSTIMESTAMP,
    CONSTRAINT pk_reservas_guests PRIMARY KEY (id),
    CONSTRAINT uq_reservas_guests_document UNIQUE (document),
    CONSTRAINT uq_reservas_guests_email UNIQUE (email)
);

-- Tabela de Quartos
CREATE TABLE RESERVAS_ROOMS (
    id VARCHAR2(36) NOT NULL,
    "NUMBER" NUMBER NOT NULL,
    "TYPE" VARCHAR2(20) NOT NULL,
    capacity NUMBER NOT NULL,
    price_per_night NUMBER(10,2) NOT NULL,
    status VARCHAR2(20) NOT NULL,
    CONSTRAINT pk_reservas_rooms PRIMARY KEY (id),
    CONSTRAINT uq_reservas_rooms_number UNIQUE ("NUMBER"),
    CONSTRAINT chk_reservas_rooms_type CHECK ("TYPE" IN ('STANDARD', 'DELUXE', 'SUITE')),
    CONSTRAINT chk_reservas_rooms_status CHECK (status IN ('ATIVO', 'INATIVO'))
);

-- Tabela de Reservas
CREATE TABLE RESERVAS_RESERVATIONS (
    id VARCHAR2(36) NOT NULL,
    guest_id VARCHAR2(36) NOT NULL,
    room_id VARCHAR2(36) NOT NULL,
    checkin_expected DATE NOT NULL,
    checkout_expected DATE NOT NULL,
    checkin_at TIMESTAMP,
    checkout_at TIMESTAMP,
    status VARCHAR2(20) NOT NULL,
    price_per_night_at_booking NUMBER(10,2) NOT NULL,
    estimated_amount NUMBER(10,2),
    final_amount NUMBER(10,2),
    created_at TIMESTAMP DEFAULT SYSTIMESTAMP,
    updated_at TIMESTAMP,
    CONSTRAINT pk_reservas_reservations PRIMARY KEY (id),
    CONSTRAINT fk_reservas_reservations_guest FOREIGN KEY (guest_id) REFERENCES RESERVAS_GUESTS(id),
    CONSTRAINT fk_reservas_reservations_room FOREIGN KEY (room_id) REFERENCES RESERVAS_ROOMS(id),
    CONSTRAINT chk_reservas_reservations_status CHECK (status IN ('CREATED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELED'))
);

-- Índices
CREATE INDEX idx_reservas_rooms_status ON RESERVAS_ROOMS (status);
CREATE INDEX idx_reservas_reservations_room ON RESERVAS_RESERVATIONS (room_id);
CREATE INDEX idx_reservas_reservations_status ON RESERVAS_RESERVATIONS (status);
CREATE INDEX idx_reservas_res_date_range ON RESERVAS_RESERVATIONS (checkin_expected, checkout_expected);
