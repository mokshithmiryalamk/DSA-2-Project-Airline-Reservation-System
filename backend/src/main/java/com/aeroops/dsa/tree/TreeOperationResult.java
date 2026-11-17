package com.aeroops.dsa.tree;

import java.util.List;
import java.util.Map;

public record TreeOperationResult(
    String treeType,
    int nodeCount,
    int height,
    TreeNodeDto root,
    Map<String, List<Integer>> traversals,
    List<Integer> searchPath,
    Boolean found,
    String lastRotation,
    List<TreeStep> steps
) {}
