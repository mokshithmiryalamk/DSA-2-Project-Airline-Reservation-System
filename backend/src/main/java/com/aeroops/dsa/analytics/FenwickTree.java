package com.aeroops.dsa.analytics;

import java.util.*;

public class FenwickTree {

    private final int size;
    private final double[] tree;
    private final double[] fares;

    public FenwickTree(double[] faresArray) {
        if (faresArray == null || faresArray.length == 0) {
            this.size = 1;
            this.tree = new double[2];
            this.fares = new double[]{0.0};
        } else {
            this.size = faresArray.length;
            this.tree = new double[this.size + 1];
            this.fares = Arrays.copyOf(faresArray, faresArray.length);
            for (int i = 0; i < this.size; i++) {
                addDelta(i, this.fares[i]);
            }
        }
    }

    public void addDelta(int index, double delta) {
        if (index < 0 || index >= size) return;
        int idx = index + 1;
        while (idx <= size) {
            tree[idx] += delta;
            idx += idx & (-idx);
        }
    }

    public void setFare(int index, double newFare, List<AnalyticsStep> steps) {
        if (index < 0 || index >= size) return;
        double oldFare = fares[index];
        double delta = newFare - oldFare;
        fares[index] = newFare;

        int idx = index + 1;
        while (idx <= size) {
            tree[idx] += delta;
            if (steps != null) {
                steps.add(new AnalyticsStep(
                    steps.size() + 1, "bit_update_hop", idx, index, index,
                    "UPDATE", tree[idx], Integer.toBinaryString(idx),
                    "Updated BIT index " + idx + " (binary: " + Integer.toBinaryString(idx) + ") with delta " + delta + " -> new cumulative = " + tree[idx] + "."
                ));
            }
            idx += idx & (-idx);
        }
    }

    public double queryPrefix(int index) {
        if (index < 0) return 0.0;
        int idx = Math.min(index + 1, size);
        double sum = 0.0;
        while (idx > 0) {
            sum += tree[idx];
            idx -= idx & (-idx);
        }
        return sum;
    }

    public double queryPrefixWithTrace(int index, List<AnalyticsStep> steps) {
        if (index < 0) return 0.0;
        int idx = Math.min(index + 1, size);
        double sum = 0.0;
        while (idx > 0) {
            sum += tree[idx];
            if (steps != null) {
                steps.add(new AnalyticsStep(
                    steps.size() + 1, "bit_prefix_hop", idx, 0, index,
                    "PREFIX", sum, Integer.toBinaryString(idx),
                    "BIT query at index " + idx + " (binary: " + Integer.toBinaryString(idx) + "): added " + tree[idx] + ", cumulative sum = " + sum + "."
                ));
            }
            idx -= idx & (-idx);
        }
        return sum;
    }

    public double rangeSumWithTrace(int left, int right, List<AnalyticsStep> steps) {
        if (left < 0 || right >= size || left > right) {
            if (steps != null) {
                steps.add(new AnalyticsStep(
                    steps.size() + 1, "range_error", 0, left, right,
                    "DISJOINT", 0.0, "",
                    "Range [" + left + ", " + right + "] is invalid for Fenwick tree of size " + size + "."
                ));
            }
            return 0.0;
        }

        if (steps != null) {
            steps.add(new AnalyticsStep(
                steps.size() + 1, "range_split", 0, left, right,
                "RANGE", 0.0, "",
                "Evaluating Range Sum [" + left + ", " + right + "] = PrefixSum(" + right + ") - PrefixSum(" + (left - 1) + ")."
            ));
        }

        double rightSum = queryPrefixWithTrace(right, steps);
        double leftSum = left > 0 ? queryPrefixWithTrace(left - 1, steps) : 0.0;
        double rangeSum = rightSum - leftSum;

        if (steps != null) {
            steps.add(new AnalyticsStep(
                steps.size() + 1, "range_result", 0, left, right,
                "RESULT", rangeSum, "",
                "Range Sum [" + left + ", " + right + "] = " + rightSum + " - " + leftSum + " = " + rangeSum + "."
            ));
        }

        return rangeSum;
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
        return size;
    }
}
