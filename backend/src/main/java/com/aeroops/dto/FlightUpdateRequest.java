package com.aeroops.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Positive;

public record FlightUpdateRequest(
    String flightName,
    String source,
    String destination,

    @Positive(message = "Fare must be greater than 0")
    Double fare,

    @Min(value = 1, message = "Capacity must be at least 1")
    Integer capacity,

    String status,
    String departureTime,
    String arrivalTime
) {}
