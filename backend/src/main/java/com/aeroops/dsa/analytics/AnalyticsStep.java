package com.aeroops.dsa.analytics;

public record AnalyticsStep(
    int stepNumber,
    String operation,
    int nodeIndex,
    int rangeLeft,
    int rangeRight,
    String overlapState,
    double value,
    String binaryRepresentation,
    String logMessage
) {}
