package com.aeroops.dto;

import com.aeroops.entity.Passenger;

public record PassengerDto(
    Long passengerId,
    String passengerName,
    Integer age,
    String gender
) {
    public static PassengerDto fromEntity(Passenger passenger) {
        return new PassengerDto(
            passenger.getPassengerId(),
            passenger.getPassengerName(),
            passenger.getAge(),
            passenger.getGender()
        );
    }
}
