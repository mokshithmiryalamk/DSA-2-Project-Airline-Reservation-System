package com.aeroops.dsa.sorting;

import java.util.List;

public record BenchmarkRequest(
    Integer datasetSize,
    String distribution,
    List<Double> customFares,
    Boolean syncWithFlights
) {}
