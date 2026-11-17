package com.aeroops.dsa.sorting;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class MergeSortEngine {

    public static class Outcome {
        public final double[] sorted;
        public final int comparisons;
        public final int moves;
        public final long nanos;
        public final List<SortStep> steps;

        public Outcome(double[] sorted, int comparisons, int moves, long nanos, List<SortStep> steps) {
            this.sorted = sorted;
            this.comparisons = comparisons;
            this.moves = moves;
            this.nanos = nanos;
            this.steps = steps;
        }
    }

    public static Outcome sort(double[] input, boolean generateSteps) {
        if (input == null || input.length == 0) {
            return new Outcome(new double[0], 0, 0, 0, List.of());
        }

        double[] arr = Arrays.copyOf(input, input.length);
        int[] counters = new int[2]; // [0] = comparisons, [1] = moves
        List<SortStep> steps = generateSteps ? new ArrayList<>() : null;

        long t0 = System.nanoTime();
        mergeSort(arr, 0, arr.length - 1, counters, steps);
        long nanos = System.nanoTime() - t0;

        return new Outcome(arr, counters[0], counters[1], nanos, steps != null ? steps : List.of());
    }

    private static void mergeSort(double[] arr, int left, int right, int[] counters, List<SortStep> steps) {
        if (left < right) {
            int mid = (left + right) / 2;
            mergeSort(arr, left, mid, counters, steps);
            mergeSort(arr, mid + 1, right, counters, steps);
            merge(arr, left, mid, right, counters, steps);
        }
    }

    private static void merge(double[] arr, int left, int mid, int right, int[] counters, List<SortStep> steps) {
        int n1 = mid - left + 1;
        int n2 = right - mid;

        double[] L = new double[n1];
        double[] R = new double[n2];

        System.arraycopy(arr, left, L, 0, n1);
        System.arraycopy(arr, mid + 1, R, 0, n2);

        int i = 0, j = 0, k = left;
        while (i < n1 && j < n2) {
            counters[0]++; // comparison
            // Stable comparison <=
            if (L[i] <= R[j]) {
                arr[k] = L[i++];
            } else {
                arr[k] = R[j++];
            }
            counters[1]++; // move
            k++;
        }

        while (i < n1) {
            arr[k++] = L[i++];
            counters[1]++;
        }

        while (j < n2) {
            arr[k++] = R[j++];
            counters[1]++;
        }

        if (steps != null && steps.size() < 150) {
            steps.add(new SortStep(
                steps.size() + 1, "merge_subarrays", left, right,
                toList(arr), "Merged subarrays [" + left + ".." + mid + "] and [" + (mid + 1) + ".." + right + "]."
            ));
        }
    }

    private static List<Double> toList(double[] arr) {
        List<Double> list = new ArrayList<>(arr.length);
        for (double d : arr) list.add(d);
        return list;
    }
}
