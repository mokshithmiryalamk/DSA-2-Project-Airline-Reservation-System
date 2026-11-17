package com.aeroops.dsa.sorting;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class QuickSortEngine {

    public static class Outcome {
        public final double[] sorted;
        public final int comparisons;
        public final int swaps;
        public final long nanos;
        public final List<SortStep> steps;

        public Outcome(double[] sorted, int comparisons, int swaps, long nanos, List<SortStep> steps) {
            this.sorted = sorted;
            this.comparisons = comparisons;
            this.swaps = swaps;
            this.nanos = nanos;
            this.steps = steps;
        }
    }

    public static Outcome sort(double[] input, boolean generateSteps) {
        if (input == null || input.length == 0) {
            return new Outcome(new double[0], 0, 0, 0, List.of());
        }

        double[] arr = Arrays.copyOf(input, input.length);
        int[] counters = new int[2]; // [0] = comparisons, [1] = swaps
        List<SortStep> steps = generateSteps ? new ArrayList<>() : null;

        long t0 = System.nanoTime();
        quickSort(arr, 0, arr.length - 1, counters, steps);
        long nanos = System.nanoTime() - t0;

        return new Outcome(arr, counters[0], counters[1], nanos, steps != null ? steps : List.of());
    }

    private static void quickSort(double[] arr, int low, int high, int[] counters, List<SortStep> steps) {
        if (low < high) {
            int pIdx = partition(arr, low, high, counters, steps);
            quickSort(arr, low, pIdx - 1, counters, steps);
            quickSort(arr, pIdx + 1, high, counters, steps);
        }
    }

    private static int partition(double[] arr, int low, int high, int[] counters, List<SortStep> steps) {
        double pivot = arr[high]; // Strict Lomuto partition: fares[high] as pivot
        int i = low - 1;

        for (int j = low; j < high; j++) {
            counters[0]++; // comparison
            if (arr[j] <= pivot) {
                i++;
                if (i != j) {
                    swap(arr, i, j);
                    counters[1]++; // swap
                }
            }
        }

        swap(arr, i + 1, high);
        counters[1]++; // pivot swap

        if (steps != null && steps.size() < 150) {
            steps.add(new SortStep(
                steps.size() + 1, "lomuto_partition", i + 1, high,
                toList(arr), "Partitioned around pivot " + pivot + " placed at index " + (i + 1) + "."
            ));
        }

        return i + 1;
    }

    private static void swap(double[] arr, int i, int j) {
        double temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
    }

    private static List<Double> toList(double[] arr) {
        List<Double> list = new ArrayList<>(arr.length);
        for (double d : arr) list.add(d);
        return list;
    }
}
