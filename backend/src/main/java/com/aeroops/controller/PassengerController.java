package com.aeroops.controller;

import com.aeroops.dto.PassengerCreateRequest;
import com.aeroops.dto.PassengerDto;
import com.aeroops.dto.PassengerUpdateRequest;
import com.aeroops.service.PassengerService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/passengers")
public class PassengerController {

    private final PassengerService passengerService;

    public PassengerController(PassengerService passengerService) {
        this.passengerService = passengerService;
    }

    @GetMapping
    public ResponseEntity<List<PassengerDto>> getAllPassengers(@RequestParam(required = false) String query) {
        return ResponseEntity.ok(passengerService.getAllPassengers(query));
    }

    @GetMapping("/{passengerId}")
    public ResponseEntity<PassengerDto> getPassengerById(@PathVariable Long passengerId) {
        return ResponseEntity.ok(passengerService.getPassengerById(passengerId));
    }

    @PostMapping
    public ResponseEntity<PassengerDto> createPassenger(@Valid @RequestBody PassengerCreateRequest request) {
        PassengerDto created = passengerService.createPassenger(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{passengerId}")
    public ResponseEntity<PassengerDto> updatePassenger(
            @PathVariable Long passengerId,
            @Valid @RequestBody PassengerUpdateRequest request) {
        return ResponseEntity.ok(passengerService.updatePassenger(passengerId, request));
    }

    @DeleteMapping("/{passengerId}")
    public ResponseEntity<Void> deletePassenger(@PathVariable Long passengerId) {
        passengerService.deletePassenger(passengerId);
        return ResponseEntity.noContent().build();
    }
}
