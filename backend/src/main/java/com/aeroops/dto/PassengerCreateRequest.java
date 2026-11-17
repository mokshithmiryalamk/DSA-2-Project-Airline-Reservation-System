package com.aeroops.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record PassengerCreateRequest(
    Long passengerId,

    @NotBlank(message = "Passenger name is required")
    String passengerName,

    @NotNull(message = "Age is required")
    @Min(value = 1, message = "Age must be at least 1")
    @Max(value = 120, message = "Age must be at most 120")
    Integer age,

    @NotBlank(message = "Gender is required")
    String gender
) {}
