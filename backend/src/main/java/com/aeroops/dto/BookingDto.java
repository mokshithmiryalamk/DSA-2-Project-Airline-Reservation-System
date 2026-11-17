package com.aeroops.dto;

import com.aeroops.entity.Booking;
import java.time.Instant;

public record BookingDto(
    Long ticketId,
    String bookingReference,
    Long passengerId,
    String passengerName,
    String flightId,
    String flightName,
    String sourceCode,
    String sourceCity,
    String destinationCode,
    String destinationCity,
    String seatNumber,
    Instant bookedAt,
    String status,
    Double fare
) {
    public static BookingDto fromEntity(Booking booking) {
        return new BookingDto(
            booking.getTicketId(),
            booking.getBookingReference(),
            booking.getPassenger().getPassengerId(),
            booking.getPassenger().getPassengerName(),
            booking.getFlight().getFlightId(),
            booking.getFlight().getFlightName(),
            booking.getFlight().getSourceAirport().getAirportCode(),
            booking.getFlight().getSourceAirport().getCity(),
            booking.getFlight().getDestinationAirport().getAirportCode(),
            booking.getFlight().getDestinationAirport().getCity(),
            booking.getSeatNumber(),
            booking.getBookedAt(),
            booking.getStatus(),
            booking.getFare()
        );
    }
}
