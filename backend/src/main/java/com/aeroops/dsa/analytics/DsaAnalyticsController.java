package com.aeroops.dsa.analytics;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/dsa/analytics")
public class DsaAnalyticsController {

    private final AnalyticsService analyticsService;

    public DsaAnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/fares")
    public ResponseEntity<List<Double>> getActiveFares() {
        return ResponseEntity.ok(analyticsService.getActiveFlightFares());
    }

    @PostMapping("/segment-tree")
    public ResponseEntity<SegmentTreeResult> querySegmentTree(@RequestBody(required = false) AnalyticsRequest req) {
        return ResponseEntity.ok(analyticsService.querySegmentTree(req));
    }

    @PostMapping("/fenwick-tree")
    public ResponseEntity<FenwickTreeResult> queryFenwickTree(@RequestBody(required = false) AnalyticsRequest req) {
        return ResponseEntity.ok(analyticsService.queryFenwickTree(req));
    }
}
