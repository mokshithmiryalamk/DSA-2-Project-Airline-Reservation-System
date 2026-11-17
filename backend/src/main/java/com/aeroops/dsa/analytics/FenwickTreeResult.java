package com.aeroops.dsa.analytics;

import java.util.List;

public record FenwickTreeResult(
    String treeType,
    int arraySize,
    List<Double> currentFares,
    List<Double> treeArray,
    int queryLeft,
    int queryRight,
    double resultSum,
    List<AnalyticsStep> steps
) {}
