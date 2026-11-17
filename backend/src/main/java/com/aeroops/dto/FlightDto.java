package com.aeroops.dto;

import com.aeroops.entity.Flight;

public record FlightDto(
    String flightId,
    String flightName,
    String sourceCode,
    String sourceCity,
    String destinationCode,
    String destinationCity,
    Double fare,
    Integer capacity,
    Integer bookedSeats,
    Integer availableSeats,
    String status,
    String departureTime,
    String arrivalTime
) {
    public static FlightDto fromEntity(Flight flight, int bookedSeats) {
        int capacity = flight.getCapacity() != null ? flight.getCapacity() : 180;
        int available = Math.max(0, capacity - bookedSeats);
        return new FlightDto(
            flight.getFlightId(),
            flight.getFlightName(),
            flight.getSourceAirport().getAirportCode(),
            flight.getSourceAirport().getCity(),
            flight.getDestinationAirport().getAirportCode(),
            flight.getDestinationAirport().getCity(),
            flight.getFare(),
            capacity,
            bookedSeats,
            available,
            flight.getStatus(),
            flight.getDepartureTime(),
            flight.getArrivalTime()
        );
    }
}
