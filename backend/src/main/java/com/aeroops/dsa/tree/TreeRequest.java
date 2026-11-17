package com.aeroops.dsa.tree;

import java.util.List;

public record TreeRequest(
    List<Integer> initialKeys,
    Integer insertKey,
    Integer searchKey,
    Integer rangeLow,
    Integer rangeHigh,
    Boolean syncWithPassengers
) {}
