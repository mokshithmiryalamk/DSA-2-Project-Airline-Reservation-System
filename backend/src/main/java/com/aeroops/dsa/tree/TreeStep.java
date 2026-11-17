package com.aeroops.dsa.tree;

import java.util.List;

public record TreeStep(
    int stepNumber,
    String action,
    Integer activeKey,
    String description,
    List<Integer> currentPath
) {}
