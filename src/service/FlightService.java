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
        if(searchFlight(flight.getFlightId()) != null) {
            System.out.println("Flight ID already exists.");
            return;
        }

        flights.add(flight);
        segmentTree = null;
        fenwickTree = null;

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
        for(Flight flight : flights) {
            if(flight.getFlightId().equalsIgnoreCase(flightId)) {
                return flight;
            }
        }
        return null;
    }

    public void deleteFlight(String flightId) {
        for(int i = 0; i < flights.size(); i++) {
            if(flights.get(i).getFlightId().equalsIgnoreCase(flightId)) {
                flights.remove(i);
                segmentTree = null;
                fenwickTree = null;
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

        segmentTree = new SegmentTree(getFareArray());
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

        System.out.println("Minimum Fare: " + segmentTree.rangeMinimumQuery(startIndex, endIndex));
    }

    public void updateFlightFare(int index, double newFare) {
        if(index < 0 || index >= flights.size()) {
            System.out.println("Invalid flight index.");
            return;
        }

        if(newFare <= 0) {
            System.out.println("Fare must be greater than 0.");
            return;
        }

        flights.get(index).setFare(newFare);
        segmentTree = null;
        fenwickTree = null;

        System.out.println("Fare updated successfully. Rebuild trees for analytics.");
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

        System.out.println("Total Fare in Range: " + fenwickTree.getRangeSum(startIndex, endIndex));
    }

    public void updateFareUsingFenwick(int index, double newFare) {
        updateFlightFare(index, newFare);
    }

    private double[] getFareArray() {
        double[] fares = new double[flights.size()];

        for(int i = 0; i < flights.size(); i++) {
            fares[i] = flights.get(i).getFare();
        }

        return fares;
    }

    private void displaySortedFares(double[] fares) {
        for(double fare : fares) {
            System.out.println(fare);
        }
    }

    public void sortFaresUsingMergeSort() {
        if(flights.isEmpty()) {
            System.out.println("No flights available.");
            return;
        }

        double[] fares = getFareArray();
        new MergeSort().sortByFare(fares);

        System.out.println("Fares sorted using Merge Sort:");
        displaySortedFares(fares);
    }

    public void sortFaresUsingQuickSort() {
        if(flights.isEmpty()) {
            System.out.println("No flights available.");
            return;
        }

        double[] fares = getFareArray();
        new QuickSort().sortByFare(fares);

        System.out.println("Fares sorted using Quick Sort:");
        displaySortedFares(fares);
    }

    public void sortFaresUsingHeapSort() {
        if(flights.isEmpty()) {
            System.out.println("No flights available.");
            return;
        }

        double[] fares = getFareArray();
        new HeapSort().sortByFare(fares);

        System.out.println("Fares sorted using Heap Sort:");
        displaySortedFares(fares);
    }
}