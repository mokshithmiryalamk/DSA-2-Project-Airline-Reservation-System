package service;

import java.util.ArrayList;
import tree.SegmentTree;
import tree.FenwickTree;
import model.Flight;
import sorting.MergeSort;
import sorting.QuickSort;
import sorting.HeapSort;

public class FlightService {

    private ArrayList<Flight> flights = new ArrayList<>();
    private SegmentTree segmentTree;
    private FenwickTree fenwickTree;

    public void addFlight(Flight flight) {
        flights.add(flight);
        System.out.println("Flight added successfully.");
    }

    public void viewFlights() {
        if(flights.isEmpty()) {
            System.out.println("No flights available.");
            return;
        }

        for(int i = 0; i < flights.size(); i++) {
            System.out.println("Index: " + i);
            flights.get(i).displayFlight();
            System.out.println("-------------------");
        }
    }

    public Flight searchFlight(String flightId) {
        for(int i = 0; i < flights.size(); i++) {
            if(flights.get(i).getFlightId().equals(flightId)) {
                return flights.get(i);
            }
        }
        return null;
    }

    public void deleteFlight(String flightId) {
        for(int i = 0; i < flights.size(); i++) {
            if(flights.get(i).getFlightId().equals(flightId)) {
                flights.remove(i);
                segmentTree = null;
                System.out.println("Flight deleted successfully.");
                return;
            }
        }
        System.out.println("Flight not found.");
    }

    public void buildSegmentTree() {
        if(flights.isEmpty()) {
            System.out.println("No flights available.");
            return;
        }

        double[] fares = new double[flights.size()];

        for(int i = 0; i < flights.size(); i++) {
            fares[i] = flights.get(i).getFare();
        }

        segmentTree = new SegmentTree(fares);

        System.out.println("Segment Tree built successfully.");
    }

    public void findMinimumFare(int startIndex, int endIndex) {
        if(segmentTree == null) {
            System.out.println("Build Segment Tree first.");
            return;
        }

        if(startIndex < 0 || endIndex >= flights.size() || startIndex > endIndex) {
            System.out.println("Invalid range.");
            return;
        }

        double minFare = segmentTree.rangeMinimumQuery(startIndex, endIndex);

        System.out.println("Minimum Fare: " + minFare);
    }
    
    public void updateFlightFare(int index, double newFare) {

        if(index < 0 || index >= flights.size()) {
            System.out.println("Invalid flight index.");
            return;
        }

        flights.get(index).setFare(newFare);

        if(segmentTree != null) {
            segmentTree.updateFare(index, newFare);
        }

        System.out.println("Fare updated successfully.");
    }
    
    public void buildFenwickTree() {

        if(flights.isEmpty()) {
            System.out.println("No flights available.");
            return;
        }

        fenwickTree = new FenwickTree(flights.size());

        for(int i = 0; i < flights.size(); i++) {
            fenwickTree.update(i, flights.get(i).getFare());
        }

        System.out.println("Fenwick Tree built successfully.");
    }
    
    public void findTotalFareInRange(int startIndex, int endIndex) {

        if(fenwickTree == null) {
            System.out.println("Build Fenwick Tree first.");
            return;
        }

        if(startIndex < 0 || endIndex >= flights.size() || startIndex > endIndex) {
            System.out.println("Invalid range.");
            return;
        }

        double totalFare = fenwickTree.getRangeSum(startIndex, endIndex);

        System.out.println("Total Fare in Range: " + totalFare);
    }
    
    public void updateFareUsingFenwick(int index, double newFare) {

        if(index < 0 || index >= flights.size()) {
            System.out.println("Invalid flight index.");
            return;
        }

        double oldFare = flights.get(index).getFare();
        double difference = newFare - oldFare;

        flights.get(index).setFare(newFare);

        if(fenwickTree != null) {
            fenwickTree.update(index, difference);
        }

        System.out.println("Fare updated successfully.");
    }
    
    private double[] getFareArray() {

        double[] fares = new double[flights.size()];

        for(int i = 0; i < flights.size(); i++) {
            fares[i] = flights.get(i).getFare();
        }

        return fares;
    }
    
    private void displaySortedFares(double[] fares) {

        for(int i = 0; i < fares.length; i++) {
            System.out.println(fares[i]);
        }
    }
    
    public void sortFaresUsingMergeSort() {

        double[] fares = getFareArray();

        MergeSort mergeSort = new MergeSort();
        mergeSort.sortByFare(fares);

        System.out.println("Fares sorted using Merge Sort:");
        displaySortedFares(fares);
    }
    
    public void sortFaresUsingQuickSort() {

        double[] fares = getFareArray();

        QuickSort quickSort = new QuickSort();
        quickSort.sortByFare(fares);

        System.out.println("Fares sorted using Quick Sort:");
        displaySortedFares(fares);
    }
    
    public void sortFaresUsingHeapSort() {

        double[] fares = getFareArray();

        HeapSort heapSort = new HeapSort();
        heapSort.sortByFare(fares);

        System.out.println("Fares sorted using Heap Sort:");
        displaySortedFares(fares);
    }
}