package com.aeroops.dsa.sorting;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/dsa/sorting")
@CrossOrigin(origins = "*")
public class DsaSortingController {

    private final SortingService sortingService;

    public DsaSortingController(SortingService sortingService) {
        this.sortingService = sortingService;
    }

    @PostMapping("/sort")
    public ResponseEntity<SortResult> runSort(@RequestBody(required = false) SortRequest req) {
        return ResponseEntity.ok(sortingService.sort(req));
    }

    @PostMapping("/benchmark")
    public ResponseEntity<BenchmarkResult> runBenchmark(@RequestBody(required = false) BenchmarkRequest req) {
        return ResponseEntity.ok(sortingService.benchmark(req));
    }
}
