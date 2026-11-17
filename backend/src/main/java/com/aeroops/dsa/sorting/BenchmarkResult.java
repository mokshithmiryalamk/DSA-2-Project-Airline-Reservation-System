package com.aeroops.dsa.sorting;

import java.util.List;
import java.util.Map;

public record BenchmarkResult(
    int datasetSize,
    String distribution,
    List<Double> sampleOriginal,
    Map<String, AlgorithmMetrics> metrics,
    String winner
) {}
