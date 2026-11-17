package com.aeroops.dsa.tree;

import java.util.List;

public record TreeRangeResult(
    String treeType,
    int low,
    int high,
    List<Integer> matchedKeys,
    List<Integer> leafSequence,
    List<TreeStep> steps
) {}
