package com.aeroops.controller;

import com.aeroops.dto.AirportDto;
import com.aeroops.service.AirportService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/airports")
public class AirportController {

    private final AirportService airportService;

    public AirportController(AirportService airportService) {
        this.airportService = airportService;
    }

    @GetMapping
    public ResponseEntity<List<AirportDto>> getAllAirports() {
        return ResponseEntity.ok(airportService.getAllAirports());
    }

    @GetMapping("/{code}")
    public ResponseEntity<AirportDto> getAirportByCode(@PathVariable String code) {
        return ResponseEntity.ok(airportService.getAirportByCode(code));
    }
}
