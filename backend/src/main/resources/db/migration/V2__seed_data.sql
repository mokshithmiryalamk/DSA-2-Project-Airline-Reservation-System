-- =============================================================================
-- AEROOPS — V2 Seed Data Migration
-- Seeds 10 commercial Indian airport hubs, 8 fleet flights, 6 passengers, 4 bookings
-- =============================================================================

-- 1. Airports
INSERT INTO airports (airport_code, airport_name, city, state) VALUES
('DEL', 'Indira Gandhi International Airport', 'Delhi', 'Delhi NCR'),
('BOM', 'Chhatrapati Shivaji Maharaj International', 'Mumbai', 'Maharashtra'),
('BLR', 'Kempegowda International Airport', 'Bengaluru', 'Karnataka'),
('HYD', 'Rajiv Gandhi International Airport', 'Hyderabad', 'Telangana'),
('MAA', 'Chennai International Airport', 'Chennai', 'Tamil Nadu'),
('CCU', 'Netaji Subhash Chandra Bose International', 'Kolkata', 'West Bengal'),
('GOI', 'Dabolim Airport', 'Goa', 'Goa'),
('JAI', 'Jaipur International Airport', 'Jaipur', 'Rajasthan'),
('PNQ', 'Pune Airport', 'Pune', 'Maharashtra'),
('AMD', 'Sardar Vallabhbhai Patel International', 'Ahmedabad', 'Gujarat');

-- 2. Flights
INSERT INTO flights (flight_id, flight_name, source_code, destination_code, fare, capacity, status, departure_time, arrival_time) VALUES
('AI-101', 'Air India Dreamliner', 'DEL', 'BOM', 5400.00, 180, 'On Time', '06:00 UTC', '08:15 UTC'),
('6E-204', 'IndiGo Express', 'BOM', 'BLR', 4200.00, 180, 'On Time', '09:30 UTC', '11:15 UTC'),
('UK-812', 'Vistara Prime', 'DEL', 'BLR', 6800.00, 160, 'Boarding', '11:00 UTC', '13:45 UTC'),
('SG-415', 'SpiceJet Shuttle', 'HYD', 'MAA', 3900.00, 189, 'On Time', '14:20 UTC', '15:35 UTC'),
('QP-133', 'Akasa Air Citylink', 'BOM', 'GOI', 3500.00, 189, 'On Time', '16:00 UTC', '17:15 UTC'),
('AI-509', 'Air India Regional', 'CCU', 'DEL', 5900.00, 140, 'On Time', '17:45 UTC', '20:10 UTC'),
('6E-651', 'IndiGo Connector', 'DEL', 'HYD', 4600.00, 180, 'Scheduled', '19:15 UTC', '21:30 UTC'),
('UK-993', 'Vistara Business Wing', 'BLR', 'DEL', 7100.00, 160, 'Scheduled', '21:00 UTC', '23:40 UTC');

-- 3. Passengers
INSERT INTO passengers (passenger_id, passenger_name, age, gender) VALUES
(101, 'Aarav Sharma', 29, 'Male'),
(102, 'Ananya Iyer', 34, 'Female'),
(103, 'Vikram Malhotra', 45, 'Male'),
(104, 'Pooja Hegde', 27, 'Female'),
(105, 'Rohan Verma', 22, 'Male'),
(106, 'Kavita Nair', 51, 'Female');

-- 4. Initial Confirmed Bookings
INSERT INTO bookings (ticket_id, booking_reference, passenger_id, flight_id, seat_number, booked_at, status, fare) VALUES
(1001, 'AERO-101-1001-BOM', 101, 'AI-101', '12A', TIMESTAMP '2026-11-10 08:30:00', 'CONFIRMED', 5400.00),
(1002, 'AERO-204-1002-BLR', 102, '6E-204', '14B', TIMESTAMP '2026-11-10 09:15:00', 'CONFIRMED', 4200.00),
(1003, 'AERO-812-1003-BLR', 103, 'UK-812', '3F',  TIMESTAMP '2026-11-11 12:00:00', 'CONFIRMED', 6800.00),
(1004, 'AERO-415-1004-MAA', 104, 'SG-415', '18C', TIMESTAMP '2026-11-11 14:45:00', 'CONFIRMED', 3900.00);
