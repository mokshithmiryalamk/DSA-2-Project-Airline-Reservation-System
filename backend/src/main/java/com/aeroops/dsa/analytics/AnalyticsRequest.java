package com.aeroops.dsa.analytics;

import java.util.List;

public record AnalyticsRequest(
    List<Double> fares,
    Integer queryLeft,
    Integer queryRight,
    Integer updateIndex,
    Double updateValue,
    Boolean syncWithFlights
) {}
