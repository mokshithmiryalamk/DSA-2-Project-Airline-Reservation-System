package com.aeroops.service;

import com.aeroops.dto.AirportDto;
import com.aeroops.entity.Airport;
import com.aeroops.exception.ResourceNotFoundException;
import com.aeroops.repository.AirportRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class AirportService {

    private final AirportRepository airportRepository;

    public AirportService(AirportRepository airportRepository) {
        this.airportRepository = airportRepository;
    }

    public List<AirportDto> getAllAirports() {
        return airportRepository.findAll().stream()
            .map(AirportDto::fromEntity)
            .toList();
    }

    public AirportDto getAirportByCode(String code) {
        Airport airport = airportRepository.findByAirportCodeIgnoreCase(code)
            .orElseThrow(() -> new ResourceNotFoundException("Airport with code '" + code + "' not found."));
        return AirportDto.fromEntity(airport);
    }
}
