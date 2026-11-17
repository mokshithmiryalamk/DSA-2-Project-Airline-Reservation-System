package com.aeroops.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record FlightCreateRequest(
    @NotBlank(message = "Flight ID is required")
    String flightId,

    @NotBlank(message = "Flight name is required")
    String flightName,

    @NotBlank(message = "Origin source airport code is required")
    String source,

    @NotBlank(message = "Destination airport code is required")
    String destination,

    @NotNull(message = "Fare is required")
    @Positive(message = "Fare must be greater than 0")
    Double fare,

    @Min(value = 1, message = "Capacity must be at least 1")
    Integer capacity,

    String status,
    String departureTime,
    String arrivalTime
) {}
