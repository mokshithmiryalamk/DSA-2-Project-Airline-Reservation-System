-- =============================================================================
-- AEROOPS — V1 Schema Migration
-- Compatible with both H2 (PostgreSQL mode) and PostgreSQL (Neon)
-- =============================================================================

CREATE TABLE airports (
    airport_code VARCHAR(10) PRIMARY KEY,
    airport_name VARCHAR(100) NOT NULL,
    city VARCHAR(50) NOT NULL,
    state VARCHAR(50) NOT NULL
);

CREATE TABLE flights (
    flight_id VARCHAR(20) PRIMARY KEY,
    flight_name VARCHAR(100) NOT NULL,
    source_code VARCHAR(10) NOT NULL,
    destination_code VARCHAR(10) NOT NULL,
    fare DOUBLE PRECISION NOT NULL,
    capacity INT NOT NULL DEFAULT 180,
    status VARCHAR(20) NOT NULL DEFAULT 'Scheduled',
    departure_time VARCHAR(30) NOT NULL,
    arrival_time VARCHAR(30) NOT NULL,
    CONSTRAINT fk_flight_source FOREIGN KEY (source_code) REFERENCES airports(airport_code),
    CONSTRAINT fk_flight_dest FOREIGN KEY (destination_code) REFERENCES airports(airport_code),
    CONSTRAINT chk_flight_fare CHECK (fare > 0),
    CONSTRAINT chk_flight_capacity CHECK (capacity > 0)
);

CREATE TABLE passengers (
    passenger_id BIGINT PRIMARY KEY,
    passenger_name VARCHAR(100) NOT NULL,
    age INT NOT NULL,
    gender VARCHAR(20) NOT NULL,
    CONSTRAINT chk_passenger_age CHECK (age >= 1 AND age <= 120)
);

CREATE TABLE bookings (
    ticket_id BIGINT PRIMARY KEY,
    booking_reference VARCHAR(36) NOT NULL UNIQUE,
    passenger_id BIGINT NOT NULL,
    flight_id VARCHAR(20) NOT NULL,
    seat_number VARCHAR(10) NOT NULL,
    booked_at TIMESTAMP NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'CONFIRMED',
    fare DOUBLE PRECISION NOT NULL,
    CONSTRAINT fk_booking_passenger FOREIGN KEY (passenger_id) REFERENCES passengers(passenger_id),
    CONSTRAINT fk_booking_flight FOREIGN KEY (flight_id) REFERENCES flights(flight_id)
);

CREATE SEQUENCE passenger_id_seq START WITH 200 INCREMENT BY 1;
CREATE SEQUENCE ticket_id_seq START WITH 2000 INCREMENT BY 1;
