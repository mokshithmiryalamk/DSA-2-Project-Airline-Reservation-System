package com.aeroops.controller;

import com.aeroops.dto.FlightCreateRequest;
import com.aeroops.dto.FlightDto;
import com.aeroops.dto.FlightUpdateRequest;
import com.aeroops.service.FlightService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/flights")
public class FlightController {

    private final FlightService flightService;

    public FlightController(FlightService flightService) {
        this.flightService = flightService;
    }

    @GetMapping
    public ResponseEntity<List<FlightDto>> getFlights(
            @RequestParam(required = false) String source,
            @RequestParam(required = false) String destination,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String query) {
        return ResponseEntity.ok(flightService.getFlights(source, destination, status, query));
    }

    @GetMapping("/{flightId}")
    public ResponseEntity<FlightDto> getFlightById(@PathVariable String flightId) {
        return ResponseEntity.ok(flightService.getFlightById(flightId));
    }

    @PostMapping
    public ResponseEntity<FlightDto> createFlight(@Valid @RequestBody FlightCreateRequest request) {
        FlightDto created = flightService.createFlight(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{flightId}")
    public ResponseEntity<FlightDto> updateFlight(
            @PathVariable String flightId,
            @Valid @RequestBody FlightUpdateRequest request) {
        return ResponseEntity.ok(flightService.updateFlight(flightId, request));
    }

    @DeleteMapping("/{flightId}")
    public ResponseEntity<Void> deleteFlight(@PathVariable String flightId) {
        flightService.deleteFlight(flightId);
        return ResponseEntity.noContent().build();
    }
}
