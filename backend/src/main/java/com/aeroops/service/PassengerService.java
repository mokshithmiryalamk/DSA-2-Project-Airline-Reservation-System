package com.aeroops.service;

import com.aeroops.dto.PassengerCreateRequest;
import com.aeroops.dto.PassengerDto;
import com.aeroops.dto.PassengerUpdateRequest;
import com.aeroops.entity.Passenger;
import com.aeroops.exception.ConflictException;
import com.aeroops.exception.ResourceNotFoundException;
import com.aeroops.exception.ValidationException;
import com.aeroops.repository.BookingRepository;
import com.aeroops.repository.PassengerRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class PassengerService {

    private final PassengerRepository passengerRepository;
    private final BookingRepository bookingRepository;

    public PassengerService(PassengerRepository passengerRepository, BookingRepository bookingRepository) {
        this.passengerRepository = passengerRepository;
        this.bookingRepository = bookingRepository;
    }

    @Transactional(readOnly = true)
    public List<PassengerDto> getAllPassengers(String query) {
        String cleanQuery = (query != null && !query.isBlank()) ? query.trim() : null;
        return passengerRepository.searchPassengers(cleanQuery).stream()
            .map(PassengerDto::fromEntity)
            .toList();
    }

    @Transactional(readOnly = true)
    public PassengerDto getPassengerById(Long passengerId) {
        Passenger passenger = passengerRepository.findById(passengerId)
            .orElseThrow(() -> new ResourceNotFoundException("Passenger ID " + passengerId + " not found."));
        return PassengerDto.fromEntity(passenger);
    }

    public PassengerDto createPassenger(PassengerCreateRequest request) {
        Long id = request.passengerId();
        if (id != null) {
            if (passengerRepository.findById(id).isPresent()) {
                throw new ConflictException("Passenger ID " + id + " already exists in the manifest.");
            }
        } else {
            id = passengerRepository.getNextPassengerId();
        }

        if (request.age() < 1 || request.age() > 120) {
            throw new ValidationException("Age must be between 1 and 120.");
        }

        Passenger passenger = new Passenger(
            id,
            request.passengerName().trim(),
            request.age(),
            request.gender().trim()
        );

        Passenger saved = passengerRepository.save(passenger);
        return PassengerDto.fromEntity(saved);
    }

    public PassengerDto updatePassenger(Long passengerId, PassengerUpdateRequest request) {
        Passenger passenger = passengerRepository.findById(passengerId)
            .orElseThrow(() -> new ResourceNotFoundException("Passenger ID " + passengerId + " not found."));

        if (request.age() < 1 || request.age() > 120) {
            throw new ValidationException("Age must be between 1 and 120.");
        }

        passenger.setPassengerName(request.passengerName().trim());
        passenger.setAge(request.age());
        passenger.setGender(request.gender().trim());

        Passenger updated = passengerRepository.save(passenger);
        return PassengerDto.fromEntity(updated);
    }

    public void deletePassenger(Long passengerId) {
        Passenger passenger = passengerRepository.findById(passengerId)
            .orElseThrow(() -> new ResourceNotFoundException("Passenger ID " + passengerId + " not found."));

        boolean hasBookings = bookingRepository.existsByPassenger_PassengerId(passengerId);
        if (hasBookings) {
            throw new ConflictException("Cannot delete passenger ID " + passengerId +
                ": booking history exists. Retain passenger records for historical audit.");
        }

        passengerRepository.delete(passenger);
    }
}
