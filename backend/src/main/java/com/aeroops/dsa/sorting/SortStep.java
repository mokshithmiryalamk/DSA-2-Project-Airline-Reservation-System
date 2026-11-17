package com.aeroops.dsa.sorting;

import java.util.List;

public record SortStep(
    int stepNumber,
    String action,
    int index1,
    int index2,
    List<Double> currentArray,
    String description
) {}
