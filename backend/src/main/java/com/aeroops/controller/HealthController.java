package com.aeroops.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1")
public class HealthController {

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> getHealth() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("service", "AEROOPS Airline Reservation & Operations System");
        response.put("stage", "STAGE 1 - Full-Stack Foundation");
        response.put("javaVersion", System.getProperty("java.version"));
        response.put("timestamp", Instant.now().toString());
        response.put("dsaPreserved", true);
        return ResponseEntity.ok(response);
    }
}
