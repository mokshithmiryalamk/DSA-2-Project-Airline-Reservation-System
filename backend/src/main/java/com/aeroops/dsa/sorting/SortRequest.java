package com.aeroops.dsa.sorting;

import java.util.List;

public record SortRequest(
    String algorithm,
    List<Double> fares,
    Boolean syncWithFlights
) {}
