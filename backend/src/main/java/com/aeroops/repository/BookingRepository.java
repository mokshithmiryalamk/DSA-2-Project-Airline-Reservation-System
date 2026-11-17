package com.aeroops.repository;

import com.aeroops.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    Optional<Booking> findByBookingReference(String bookingReference);

    @Query("SELECT b FROM Booking b " +
           "JOIN FETCH b.passenger " +
           "JOIN FETCH b.flight f " +
           "JOIN FETCH f.sourceAirport " +
           "JOIN FETCH f.destinationAirport " +
           "WHERE b.ticketId = :ticketId")
    Optional<Booking> findByIdWithDetails(@Param("ticketId") Long ticketId);

    @Query("SELECT b FROM Booking b " +
           "JOIN FETCH b.passenger " +
           "JOIN FETCH b.flight f " +
           "JOIN FETCH f.sourceAirport " +
           "JOIN FETCH f.destinationAirport " +
           "ORDER BY b.bookedAt DESC")
    List<Booking> findAllWithDetails();

    long countByFlight_FlightIdIgnoreCaseAndStatus(String flightId, String status);

    @Query("SELECT b.seatNumber FROM Booking b " +
           "WHERE UPPER(b.flight.flightId) = UPPER(:flightId) AND b.status = 'CONFIRMED'")
    List<String> findOccupiedSeatsByFlight(@Param("flightId") String flightId);

    boolean existsByFlight_FlightIdIgnoreCaseAndSeatNumberIgnoreCaseAndStatus(
            String flightId, String seatNumber, String status);

    boolean existsByPassenger_PassengerIdAndStatus(Long passengerId, String status);

    boolean existsByFlight_FlightIdIgnoreCaseAndStatus(String flightId, String status);

    @Query("SELECT COALESCE(MAX(b.ticketId), 1000) FROM Booking b")
    Long findMaxTicketId();

    @Query(value = "SELECT nextval('ticket_id_seq')", nativeQuery = true)
    Long getNextTicketId();

    boolean existsByFlight_FlightIdIgnoreCase(String flightId);

    boolean existsByPassenger_PassengerId(Long passengerId);
}
