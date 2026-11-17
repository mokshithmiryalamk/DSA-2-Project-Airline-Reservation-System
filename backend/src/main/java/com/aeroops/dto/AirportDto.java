package com.aeroops.dto;

import com.aeroops.entity.Airport;

public record AirportDto(
    String airportCode,
    String airportName,
    String city,
    String state
) {
    public static AirportDto fromEntity(Airport airport) {
        return new AirportDto(
            airport.getAirportCode(),
            airport.getAirportName(),
            airport.getCity(),
            airport.getState()
        );
    }
}
