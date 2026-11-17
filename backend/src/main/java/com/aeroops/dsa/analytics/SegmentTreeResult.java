package com.aeroops.dsa.analytics;

import java.util.List;

public record SegmentTreeResult(
    String treeType,
    int arraySize,
    List<Double> currentFares,
    List<Double> treeArray,
    int queryLeft,
    int queryRight,
    double resultMinimum,
    List<AnalyticsStep> steps
) {}
