package com.aeroops.dsa.analytics;

import java.util.*;

public class SegmentTree {

    private final double[] fares;
    private final double[] tree;
    private final int n;

    public SegmentTree(double[] faresArray) {
        if (faresArray == null || faresArray.length == 0) {
            this.fares = new double[]{0.0};
        } else {
            this.fares = Arrays.copyOf(faresArray, faresArray.length);
        }
        this.n = this.fares.length;
        this.tree = new double[4 * this.n];
        Arrays.fill(this.tree, Double.POSITIVE_INFINITY);
        buildTree(0, 0, this.n - 1);
    }

    private void buildTree(int node, int start, int end) {
        if (start == end) {
            tree[node] = fares[start];
        } else {
            int mid = (start + end) / 2;
            int leftNode = 2 * node + 1;
            int rightNode = 2 * node + 2;

            buildTree(leftNode, start, mid);
            buildTree(rightNode, mid + 1, end);

            tree[node] = Math.min(tree[leftNode], tree[rightNode]);
        }
    }

    public double rangeMinimumQuery(int left, int right) {
        if (left < 0 || right >= n || left > right) {
            return Double.POSITIVE_INFINITY;
        }
        return queryHelper(0, 0, n - 1, left, right, null);
    }

    public double rangeMinimumQueryWithTrace(int left, int right, List<AnalyticsStep> steps) {
        if (left < 0 || right >= n || left > right) {
            if (steps != null) {
                steps.add(new AnalyticsStep(
                    steps.size() + 1, "boundary_error", 0, left, right,
                    "DISJOINT", Double.POSITIVE_INFINITY, "",
                    "Range [" + left + ", " + right + "] is out of bounds for array size " + n + "."
                ));
            }
            return Double.POSITIVE_INFINITY;
        }
        return queryHelper(0, 0, n - 1, left, right, steps);
    }

    private double queryHelper(int node, int start, int end, int qL, int qR, List<AnalyticsStep> steps) {
        // Disjoint
        if (end < qL || start > qR) {
            if (steps != null) {
                steps.add(new AnalyticsStep(
                    steps.size() + 1, "query_disjoint", node, start, end,
                    "DISJOINT", Double.POSITIVE_INFINITY, "",
                    "Segment [" + start + ", " + end + "] is disjoint from query interval [" + qL + ", " + qR + "]."
                ));
            }
            return Double.POSITIVE_INFINITY;
        }

        // Full overlap
        if (start >= qL && end <= qR) {
            if (steps != null) {
                steps.add(new AnalyticsStep(
                    steps.size() + 1, "query_full_overlap", node, start, end,
                    "FULL_OVERLAP", tree[node], "",
                    "Segment [" + start + ", " + end + "] has full overlap with query interval: local min = " + tree[node] + "."
                ));
            }
            return tree[node];
        }

        // Partial overlap
        int mid = (start + end) / 2;
        int leftNode = 2 * node + 1;
        int rightNode = 2 * node + 2;

        if (steps != null) {
            steps.add(new AnalyticsStep(
                steps.size() + 1, "query_partial_overlap", node, start, end,
                "PARTIAL_OVERLAP", tree[node], "",
                "Segment [" + start + ", " + end + "] partially overlaps query [" + qL + ", " + qR + "]. Branching into left [" + start + ", " + mid + "] and right [" + (mid + 1) + ", " + end + "]."
            ));
        }

        double leftMin = queryHelper(leftNode, start, mid, qL, qR, steps);
        double rightMin = queryHelper(rightNode, mid + 1, end, qL, qR, steps);
        return Math.min(leftMin, rightMin);
    }

    public void updateFare(int index, double newFare, List<AnalyticsStep> steps) {
        if (index < 0 || index >= n) return;
        fares[index] = newFare;
        updateHelper(0, 0, n - 1, index, newFare, steps);
    }

    private void updateHelper(int node, int start, int end, int index, double newFare, List<AnalyticsStep> steps) {
        if (start == end) {
            tree[node] = newFare;
            if (steps != null) {
                steps.add(new AnalyticsStep(
                    steps.size() + 1, "update_leaf", node, start, end,
                    "FULL_OVERLAP", newFare, "",
                    "Updated leaf index " + index + " to new fare value: " + newFare + "."
                ));
            }
            return;
        }

        int mid = (start + end) / 2;
        int leftNode = 2 * node + 1;
        int rightNode = 2 * node + 2;

        if (index <= mid) {
            updateHelper(leftNode, start, mid, index, newFare, steps);
        } else {
            updateHelper(rightNode, mid + 1, end, index, newFare, steps);
        }

        tree[node] = Math.min(tree[leftNode], tree[rightNode]);
        if (steps != null) {
            steps.add(new AnalyticsStep(
                steps.size() + 1, "update_propagate", node, start, end,
                "PARTIAL_OVERLAP", tree[node], "",
                "Propagated update up to node [" + start + ", " + end + "]: new subtree min = " + tree[node] + "."
            ));
        }
    }

    public List<Double> getFares() {
        List<Double> list = new ArrayList<>();
        for (double d : fares) list.add(d);
        return list;
    }

    public List<Double> getTreeArray() {
        List<Double> list = new ArrayList<>();
        for (double d : tree) list.add(d);
        return list;
    }

    public int getSize() {
        return n;
    }
}
