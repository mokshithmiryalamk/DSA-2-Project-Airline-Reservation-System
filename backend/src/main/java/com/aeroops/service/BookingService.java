package com.aeroops.service;

import com.aeroops.dto.BookingCreateRequest;
import com.aeroops.dto.BookingDto;
import com.aeroops.entity.Booking;
import com.aeroops.entity.Flight;
import com.aeroops.entity.Passenger;
import com.aeroops.exception.ConflictException;
import com.aeroops.exception.ResourceNotFoundException;
import com.aeroops.exception.ValidationException;
import com.aeroops.repository.BookingRepository;
import com.aeroops.repository.FlightRepository;
import com.aeroops.repository.PassengerRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@Transactional
public class BookingService {

    private final BookingRepository bookingRepository;
    private final FlightRepository flightRepository;
    private final PassengerRepository passengerRepository;

    public BookingService(BookingRepository bookingRepository,
                          FlightRepository flightRepository,
                          PassengerRepository passengerRepository) {
        this.bookingRepository = bookingRepository;
        this.flightRepository = flightRepository;
        this.passengerRepository = passengerRepository;
    }

    @Transactional(readOnly = true)
    public List<BookingDto> getAllBookings() {
        return bookingRepository.findAllWithDetails().stream()
            .map(BookingDto::fromEntity)
            .toList();
    }

    @Transactional(readOnly = true)
    public BookingDto getBookingById(Long ticketId) {
        Booking booking = bookingRepository.findByIdWithDetails(ticketId)
            .orElseThrow(() -> new ResourceNotFoundException("Booking ticket #" + ticketId + " not found."));
        return BookingDto.fromEntity(booking);
    }

    @Transactional(readOnly = true)
    public BookingDto getBookingByReference(String reference) {
        Booking booking = bookingRepository.findByBookingReference(reference)
            .orElseThrow(() -> new ResourceNotFoundException("Booking reference '" + reference + "' not found."));
        return BookingDto.fromEntity(booking);
    }

    @Transactional(isolation = Isolation.READ_COMMITTED)
    public BookingDto bookTicket(BookingCreateRequest request) {
        // 1. Lock flight record to prevent concurrent overbooking
        Flight flight = flightRepository.findByIdForUpdate(request.flightId().trim())
            .orElseThrow(() -> new ResourceNotFoundException("Flight '" + request.flightId() + "' not found."));

        // 2. Validate passenger exists
        Passenger passenger = passengerRepository.findById(request.passengerId())
            .orElseThrow(() -> new ResourceNotFoundException("Passenger ID " + request.passengerId() + " not found."));

        // 3. Verify capacity
        long activeBookings = bookingRepository.countByFlight_FlightIdIgnoreCaseAndStatus(flight.getFlightId(), "CONFIRMED");
        if (activeBookings >= flight.getCapacity()) {
            throw new ConflictException("Cannot book ticket: Flight '" + flight.getFlightId() +
                "' is fully booked (capacity " + flight.getCapacity() + " reached).");
        }

        // 4. Determine seat allocation
        String seatNumber;
        List<String> occupiedSeats = bookingRepository.findOccupiedSeatsByFlight(flight.getFlightId());
        Set<String> occupiedSet = new HashSet<>();
        for (String s : occupiedSeats) {
            occupiedSet.add(s.trim().toUpperCase());
        }

        if (request.seatNumber() != null && !request.seatNumber().isBlank()) {
            seatNumber = validateExplicitSeat(request.seatNumber(), flight.getCapacity());
            if (occupiedSet.contains(seatNumber)) {
                throw new ConflictException("Seat '" + seatNumber + "' is already occupied on flight '" + flight.getFlightId() + "'.");
            }
        } else {
            seatNumber = autoAllocateSeat(flight.getCapacity(), occupiedSet);
        }

        // 5. Determine ticket ID via concurrency-safe sequence
        Long ticketId = request.ticketId();
        if (ticketId != null) {
            if (bookingRepository.findById(ticketId).isPresent()) {
                throw new ConflictException("Ticket ID #" + ticketId + " already exists in the system.");
            }
        } else {
            ticketId = bookingRepository.getNextTicketId();
        }

        // 6. Generate deterministic booking reference
        String suffix = UUID.randomUUID().toString().substring(0, 4).toUpperCase();
        String bookingRef = "AERO-" + flight.getFlightId() + "-" + ticketId + "-" + suffix;

        Booking booking = new Booking(
            ticketId,
            bookingRef,
            passenger,
            flight,
            seatNumber,
            Instant.now(),
            "CONFIRMED",
            flight.getFare()
        );

        Booking saved = bookingRepository.save(booking);
        return BookingDto.fromEntity(saved);
    }

    public BookingDto cancelBooking(Long ticketId) {
        Booking booking = bookingRepository.findByIdWithDetails(ticketId)
            .orElseThrow(() -> new ResourceNotFoundException("Booking ticket #" + ticketId + " not found."));

        if ("CANCELLED".equalsIgnoreCase(booking.getStatus())) {
            throw new ValidationException("Booking ticket #" + ticketId + " is already cancelled.");
        }

        booking.setStatus("CANCELLED");
        Booking updated = bookingRepository.save(booking);
        return BookingDto.fromEntity(updated);
    }

    private String validateExplicitSeat(String seatInput, int capacity) {
        String clean = seatInput.trim().toUpperCase();
        java.util.regex.Matcher matcher = java.util.regex.Pattern.compile("^([1-9][0-9]*)([A-F])$").matcher(clean);
        if (!matcher.matches()) {
            throw new ValidationException("Invalid seat format '" + seatInput + "'. Expected format like '1A', '12F' (columns A-F).");
        }

        int row = Integer.parseInt(matcher.group(1));
        char col = matcher.group(2).charAt(0);
        int colIndex = col - 'A';
        int seatIndex = (row - 1) * 6 + colIndex;

        if (seatIndex >= capacity) {
            throw new ValidationException("Seat '" + clean + "' exceeds aircraft capacity of " + capacity + " seats.");
        }

        return clean;
    }

    private String autoAllocateSeat(int capacity, Set<String> occupiedSeats) {
        char[] columns = {'A', 'B', 'C', 'D', 'E', 'F'};
        int seatIndex = 0;
        int row = 1;

        while (seatIndex < capacity) {
            for (char c : columns) {
                if (seatIndex >= capacity) {
                    break;
                }
                String candidate = "" + row + c;
                if (!occupiedSeats.contains(candidate)) {
                    return candidate;
                }
                seatIndex++;
            }
            row++;
        }
        throw new ConflictException("Unable to auto-allocate seat: flight is full.");
    }
}
