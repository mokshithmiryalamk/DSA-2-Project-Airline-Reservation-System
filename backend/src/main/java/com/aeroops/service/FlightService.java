package com.aeroops.service;

import com.aeroops.dto.FlightCreateRequest;
import com.aeroops.dto.FlightDto;
import com.aeroops.dto.FlightUpdateRequest;
import com.aeroops.entity.Airport;
import com.aeroops.entity.Flight;
import com.aeroops.exception.ConflictException;
import com.aeroops.exception.ResourceNotFoundException;
import com.aeroops.exception.ValidationException;
import com.aeroops.repository.AirportRepository;
import com.aeroops.repository.BookingRepository;
import com.aeroops.repository.FlightRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class FlightService {

    private final FlightRepository flightRepository;
    private final AirportRepository airportRepository;
    private final BookingRepository bookingRepository;

    public FlightService(FlightRepository flightRepository,
                         AirportRepository airportRepository,
                         BookingRepository bookingRepository) {
        this.flightRepository = flightRepository;
        this.airportRepository = airportRepository;
        this.bookingRepository = bookingRepository;
    }

    @Transactional(readOnly = true)
    public List<FlightDto> getFlights(String source, String dest, String status, String query) {
        String cleanSource = (source != null && !source.isBlank()) ? source.trim().toUpperCase() : null;
        String cleanDest = (dest != null && !dest.isBlank()) ? dest.trim().toUpperCase() : null;
        String cleanStatus = (status != null && !status.isBlank()) ? status.trim() : null;
        String cleanQuery = (query != null && !query.isBlank()) ? query.trim() : null;

        List<Flight> flights = flightRepository.searchFlights(cleanSource, cleanDest, cleanStatus, cleanQuery);
        return flights.stream().map(flight -> {
            int bookedSeats = (int) bookingRepository.countByFlight_FlightIdIgnoreCaseAndStatus(flight.getFlightId(), "CONFIRMED");
            return FlightDto.fromEntity(flight, bookedSeats);
        }).toList();
    }

    @Transactional(readOnly = true)
    public FlightDto getFlightById(String flightId) {
        Flight flight = flightRepository.findByFlightIdIgnoreCase(flightId)
            .orElseThrow(() -> new ResourceNotFoundException("Flight '" + flightId + "' not found."));
        int bookedSeats = (int) bookingRepository.countByFlight_FlightIdIgnoreCaseAndStatus(flight.getFlightId(), "CONFIRMED");
        return FlightDto.fromEntity(flight, bookedSeats);
    }

    public FlightDto createFlight(FlightCreateRequest request) {
        String cleanFlightId = request.flightId().trim().toUpperCase();
        if (flightRepository.findByFlightIdIgnoreCase(cleanFlightId).isPresent()) {
            throw new ConflictException("Flight ID '" + cleanFlightId + "' already exists.");
        }

        String sourceCode = request.source().trim().toUpperCase();
        String destCode = request.destination().trim().toUpperCase();

        if (sourceCode.equalsIgnoreCase(destCode)) {
            throw new ValidationException("Source and destination airport codes cannot be identical.");
        }

        Airport sourceAirport = airportRepository.findByAirportCodeIgnoreCase(sourceCode)
            .orElseThrow(() -> new ResourceNotFoundException("Source airport '" + sourceCode + "' not found."));
        Airport destAirport = airportRepository.findByAirportCodeIgnoreCase(destCode)
            .orElseThrow(() -> new ResourceNotFoundException("Destination airport '" + destCode + "' not found."));

        int capacity = (request.capacity() != null && request.capacity() > 0) ? request.capacity() : 180;
        String status = (request.status() != null && !request.status().isBlank()) ? request.status().trim() : "Scheduled";
        String depTime = (request.departureTime() != null && !request.departureTime().isBlank()) ? request.departureTime().trim() : "TBD";
        String arrTime = (request.arrivalTime() != null && !request.arrivalTime().isBlank()) ? request.arrivalTime().trim() : "TBD";

        Flight flight = new Flight(
            cleanFlightId,
            request.flightName().trim(),
            sourceAirport,
            destAirport,
            request.fare(),
            capacity,
            status,
            depTime,
            arrTime
        );

        Flight saved = flightRepository.save(flight);
        return FlightDto.fromEntity(saved, 0);
    }

    public FlightDto updateFlight(String flightId, FlightUpdateRequest request) {
        Flight flight = flightRepository.findByIdForUpdate(flightId.trim())
            .orElseThrow(() -> new ResourceNotFoundException("Flight '" + flightId + "' not found."));

        if (request.flightName() != null && !request.flightName().isBlank()) {
            flight.setFlightName(request.flightName().trim());
        }

        if (request.fare() != null) {
            if (request.fare() <= 0) {
                throw new ValidationException("Fare must be greater than 0.");
            }
            flight.setFare(request.fare());
        }

        if (request.status() != null && !request.status().isBlank()) {
            flight.setStatus(request.status().trim());
        }

        if (request.departureTime() != null && !request.departureTime().isBlank()) {
            flight.setDepartureTime(request.departureTime().trim());
        }

        if (request.arrivalTime() != null && !request.arrivalTime().isBlank()) {
            flight.setArrivalTime(request.arrivalTime().trim());
        }

        if (request.capacity() != null) {
            int bookedSeats = (int) bookingRepository.countByFlight_FlightIdIgnoreCaseAndStatus(flight.getFlightId(), "CONFIRMED");
            if (request.capacity() < bookedSeats) {
                throw new ConflictException("Cannot reduce capacity to " + request.capacity() +
                    ": " + bookedSeats + " confirmed bookings already exist.");
            }
            List<String> occupiedSeats = bookingRepository.findOccupiedSeatsByFlight(flight.getFlightId());
            for (String seat : occupiedSeats) {
                if (seatToIndex(seat) >= request.capacity()) {
                    throw new ConflictException("Cannot reduce capacity to " + request.capacity() +
                        ": confirmed booking occupies seat '" + seat + "' outside proposed capacity.");
                }
            }
            flight.setCapacity(request.capacity());
        }

        if (request.source() != null && !request.source().isBlank()) {
            Airport newSource = airportRepository.findByAirportCodeIgnoreCase(request.source().trim())
                .orElseThrow(() -> new ResourceNotFoundException("Source airport '" + request.source() + "' not found."));
            flight.setSourceAirport(newSource);
        }

        if (request.destination() != null && !request.destination().isBlank()) {
            Airport newDest = airportRepository.findByAirportCodeIgnoreCase(request.destination().trim())
                .orElseThrow(() -> new ResourceNotFoundException("Destination airport '" + request.destination() + "' not found."));
            flight.setDestinationAirport(newDest);
        }

        if (flight.getSourceAirport().getAirportCode().equalsIgnoreCase(flight.getDestinationAirport().getAirportCode())) {
            throw new ValidationException("Source and destination airport codes cannot be identical.");
        }

        Flight updated = flightRepository.save(flight);
        int currentBooked = (int) bookingRepository.countByFlight_FlightIdIgnoreCaseAndStatus(updated.getFlightId(), "CONFIRMED");
        return FlightDto.fromEntity(updated, currentBooked);
    }

    public void deleteFlight(String flightId) {
        Flight flight = flightRepository.findByFlightIdIgnoreCase(flightId)
            .orElseThrow(() -> new ResourceNotFoundException("Flight '" + flightId + "' not found."));

        boolean hasBookings = bookingRepository.existsByFlight_FlightIdIgnoreCase(flight.getFlightId());
        if (hasBookings) {
            throw new ConflictException("Cannot delete flight '" + flightId + "': booking history exists. Retain flight records for historical audit.");
        }

        flightRepository.delete(flight);
    }

    private static int seatToIndex(String seatNumber) {
        try {
            var matcher = java.util.regex.Pattern.compile("^([1-9][0-9]*)([A-F])$")
                .matcher(seatNumber.trim().toUpperCase());
            if (!matcher.matches()) return Integer.MAX_VALUE;
            int row = Integer.parseInt(matcher.group(1));
            char col = matcher.group(2).charAt(0);
            return (row - 1) * 6 + (col - 'A');
        } catch (NumberFormatException e) {
            return Integer.MAX_VALUE;
        }
    }
}
