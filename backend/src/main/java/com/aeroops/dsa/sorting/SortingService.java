package com.aeroops.dsa.sorting;

import com.aeroops.entity.Flight;
import com.aeroops.repository.FlightRepository;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class SortingService {

    private final FlightRepository flightRepository;

    public static final List<Double> DEFAULT_FARES = List.of(
        5200.0, 4800.0, 6100.0, 3900.0, 5400.0, 7200.0, 4300.0, 5800.0
    );

    public SortingService(FlightRepository flightRepository) {
        this.flightRepository = flightRepository;
    }

    public List<Double> getActiveFlightFares() {
        List<Flight> flights = flightRepository.findAll();
        if (flights.isEmpty()) return DEFAULT_FARES;
        return flights.stream()
            .map(Flight::getFare)
            .toList();
    }

    public SortResult sort(SortRequest req) {
        double[] input = resolveFares(req != null ? req.fares() : null, req != null && Boolean.TRUE.equals(req.syncWithFlights()));
        String algo = req != null && req.algorithm() != null ? req.algorithm().trim().toUpperCase() : "MERGE";

        List<Double> originalList = toList(input);
        switch (algo) {
            case "QUICK": {
                var outcome = QuickSortEngine.sort(input, true);
                return new SortResult("Quick Sort", input.length, originalList, toList(outcome.sorted), outcome.comparisons, outcome.swaps, outcome.nanos, outcome.steps);
            }
            case "HEAP": {
                var outcome = HeapSortEngine.sort(input, true);
                return new SortResult("Heap Sort", input.length, originalList, toList(outcome.sorted), outcome.comparisons, outcome.swaps, outcome.nanos, outcome.steps);
            }
            case "MERGE": {
                var outcome = MergeSortEngine.sort(input, true);
                return new SortResult("Merge Sort", input.length, originalList, toList(outcome.sorted), outcome.comparisons, outcome.moves, outcome.nanos, outcome.steps);
            }
            default:
                throw new IllegalArgumentException("Unsupported sorting algorithm '" + algo + "'. Supported: MERGE, QUICK, HEAP.");
        }
    }

    public BenchmarkResult benchmark(BenchmarkRequest req) {
        double[] dataset = generateDataset(req);
        int n = dataset.length;

        // Warm up JIT
        MergeSortEngine.sort(dataset, false);
        QuickSortEngine.sort(dataset, false);
        HeapSortEngine.sort(dataset, false);

        // Run Merge Sort
        var mergeRes = MergeSortEngine.sort(dataset, false);
        // Run Quick Sort
        var quickRes = QuickSortEngine.sort(dataset, false);
        // Run Heap Sort
        var heapRes = HeapSortEngine.sort(dataset, false);

        Map<String, AlgorithmMetrics> metrics = new LinkedHashMap<>();
        metrics.put("Merge Sort", toMetrics("Merge Sort", mergeRes.comparisons, mergeRes.moves, mergeRes.nanos));
        metrics.put("Quick Sort", toMetrics("Quick Sort", quickRes.comparisons, quickRes.swaps, quickRes.nanos));
        metrics.put("Heap Sort", toMetrics("Heap Sort", heapRes.comparisons, heapRes.swaps, heapRes.nanos));

        String winner = "Quick Sort";
        long minTime = Long.MAX_VALUE;
        for (var entry : metrics.entrySet()) {
            if (entry.getValue().timeNanos() < minTime) {
                minTime = entry.getValue().timeNanos();
                winner = entry.getKey();
            }
        }

        List<Double> sample = new ArrayList<>();
        int sampleSize = Math.min(10, n);
        for (int i = 0; i < sampleSize; i++) {
            sample.add(dataset[i]);
        }

        String dist = req != null && req.distribution() != null ? req.distribution() : "random";
        return new BenchmarkResult(n, dist, sample, metrics, winner);
    }

    private AlgorithmMetrics toMetrics(String algo, int comp, int moves, long nanos) {
        double micros = nanos / 1000.0;
        String formatted = String.format(Locale.US, "%.2f µs", micros);
        return new AlgorithmMetrics(algo, comp, moves, nanos, micros, formatted);
    }

    private double[] resolveFares(List<Double> customFares, boolean syncWithFlights) {
        List<Double> list;
        if (syncWithFlights) {
            list = getActiveFlightFares();
        } else if (customFares != null) {
            if (customFares.isEmpty()) {
                throw new IllegalArgumentException("Fare dataset cannot be empty.");
            }
            if (customFares.size() > 64) {
                throw new IllegalArgumentException("Maximum 64 fare entries allowed for sorting visualization.");
            }
            list = customFares;
        } else {
            list = DEFAULT_FARES;
        }
        double[] arr = new double[list.size()];
        for (int i = 0; i < list.size(); i++) {
            Double v = list.get(i);
            if (v == null || !Double.isFinite(v) || v < 0) {
                throw new IllegalArgumentException("All fare values must be finite non-negative numbers.");
            }
            arr[i] = v;
        }
        return arr;
    }

    private double[] generateDataset(BenchmarkRequest req) {
        if (req != null && Boolean.TRUE.equals(req.syncWithFlights())) {
            return resolveFares(null, true);
        }
        if (req != null && req.customFares() != null && !req.customFares().isEmpty()) {
            return resolveFares(req.customFares(), false);
        }

        int size = 100;
        if (req != null && req.datasetSize() != null) {
            if (req.datasetSize() < 10 || req.datasetSize() > 10000) {
                throw new IllegalArgumentException("Benchmark dataset size must be between 10 and 10,000.");
            }
            size = req.datasetSize();
        }
        String dist = req != null && req.distribution() != null ? req.distribution().toLowerCase() : "random";
        double[] arr = new double[size];
        Random rnd = new Random(42);

        switch (dist) {
            case "sorted":
                for (int i = 0; i < size; i++) arr[i] = 1000.0 + i * 50.0;
                break;
            case "reverse":
                for (int i = 0; i < size; i++) arr[i] = 1000.0 + (size - i) * 50.0;
                break;
            case "duplicates":
                for (int i = 0; i < size; i++) arr[i] = 2500.0 + (rnd.nextInt(5) * 500.0);
                break;
            case "random":
            default:
                for (int i = 0; i < size; i++) arr[i] = 2000.0 + rnd.nextInt(8000);
                break;
        }
        return arr;
    }

    private static List<Double> toList(double[] arr) {
        List<Double> list = new ArrayList<>(arr.length);
        for (double d : arr) list.add(d);
        return list;
    }
}
