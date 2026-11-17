package com.aeroops.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record BookingCreateRequest(
    Long ticketId,

    @NotNull(message = "Passenger ID is required")
    Long passengerId,

    @NotBlank(message = "Flight ID is required")
    String flightId,

    String seatNumber
) {}
