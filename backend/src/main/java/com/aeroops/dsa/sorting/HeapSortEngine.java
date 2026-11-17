package com.aeroops.dsa.sorting;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class HeapSortEngine {

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
        int n = arr.length;

        // Build max heap
        for (int i = n / 2 - 1; i >= 0; i--) {
            heapify(arr, n, i, counters, steps);
        }

        // Extract elements from heap
        for (int i = n - 1; i > 0; i--) {
            swap(arr, 0, i);
            counters[1]++; // swap
            if (steps != null && steps.size() < 150) {
                steps.add(new SortStep(
                    steps.size() + 1, "extract_max", 0, i,
                    toList(arr), "Extracted maximum element " + arr[i] + " to index " + i + "."
                ));
            }
            heapify(arr, i, 0, counters, steps);
        }
        long nanos = System.nanoTime() - t0;

        return new Outcome(arr, counters[0], counters[1], nanos, steps != null ? steps : List.of());
    }

    private static void heapify(double[] arr, int n, int i, int[] counters, List<SortStep> steps) {
        int largest = i;
        int left = 2 * i + 1;
        int right = 2 * i + 2;

        if (left < n) {
            counters[0]++;
            if (arr[left] > arr[largest]) {
                largest = left;
            }
        }

        if (right < n) {
            counters[0]++;
            if (arr[right] > arr[largest]) {
                largest = right;
            }
        }

        if (largest != i) {
            swap(arr, i, largest);
            counters[1]++;
            heapify(arr, n, largest, counters, steps);
        }
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
