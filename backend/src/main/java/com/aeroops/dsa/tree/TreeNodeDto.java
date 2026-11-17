package com.aeroops.dsa.tree;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record TreeNodeDto(
    Integer key,
    Integer height,
    Integer balanceFactor,
    TreeNodeDto left,
    TreeNodeDto right,
    List<Integer> keys,
    List<TreeNodeDto> children,
    Boolean isLeaf,
    Integer nextLeafKey
) {}
