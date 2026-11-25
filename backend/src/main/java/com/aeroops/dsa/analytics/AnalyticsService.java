package com.aeroops.dsa.analytics;

import com.aeroops.entity.Flight;
import com.aeroops.repository.FlightRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class AnalyticsService {

    private final FlightRepository flightRepository;

    public static final List<Double> DEFAULT_FARES = List.of(
        5200.0, 4800.0, 6100.0, 3900.0, 5400.0, 7200.0, 4300.0, 5800.0
    );

    public AnalyticsService(FlightRepository flightRepository) {
        this.flightRepository = flightRepository;
    }

    public List<Double> getActiveFlightFares() {
        List<Flight> flights = flightRepository.findAll();
        if (flights.isEmpty()) return DEFAULT_FARES;
        return flights.stream()
            .map(Flight::getFare)
            .toList();
    }

    public SegmentTreeResult querySegmentTree(AnalyticsRequest req) {
        double[] fares = resolveFares(req);
        SegmentTree tree = new SegmentTree(fares);
        List<AnalyticsStep> steps = new ArrayList<>();

        if (req != null && req.updateIndex() != null && req.updateValue() != null) {
            validateUpdate(req.updateIndex(), req.updateValue(), tree.getSize());
            tree.updateFare(req.updateIndex(), req.updateValue(), steps);
        }

        int qL = req != null && req.queryLeft() != null ? req.queryLeft() : 0;
        int qR = req != null && req.queryRight() != null ? req.queryRight() : tree.getSize() - 1;
        validateRange(qL, qR, tree.getSize());

        double min = tree.rangeMinimumQueryWithTrace(qL, qR, steps);

        return new SegmentTreeResult(
            "Segment Tree (RMQ)", tree.getSize(),
            tree.getFares(), tree.getTreeArray(),
            qL, qR, min, steps
        );
    }

    public FenwickTreeResult queryFenwickTree(AnalyticsRequest req) {
        double[] fares = resolveFares(req);
        FenwickTree tree = new FenwickTree(fares);
        List<AnalyticsStep> steps = new ArrayList<>();

        if (req != null && req.updateIndex() != null && req.updateValue() != null) {
            validateUpdate(req.updateIndex(), req.updateValue(), tree.getSize());
            tree.setFare(req.updateIndex(), req.updateValue(), steps);
        }

        int qL = req != null && req.queryLeft() != null ? req.queryLeft() : 0;
        int qR = req != null && req.queryRight() != null ? req.queryRight() : tree.getSize() - 1;
        validateRange(qL, qR, tree.getSize());

        double sum = tree.rangeSumWithTrace(qL, qR, steps);

        return new FenwickTreeResult(
            "Fenwick Tree (BIT)", tree.getSize(),
            tree.getFares(), tree.getTreeArray(),
            qL, qR, sum, steps
        );
    }

    private void validateRange(int qL, int qR, int size) {
        if (qL < 0 || qR >= size || qL > qR) {
            throw new IllegalArgumentException(
                "Query range [" + qL + ", " + qR + "] is out of bounds for dataset of size " + size + " (valid 0.." + (size - 1) + ")."
            );
        }
    }

    private void validateUpdate(int idx, double val, int size) {
        if (idx < 0 || idx >= size) {
            throw new IllegalArgumentException("Update index " + idx + " is out of bounds (valid 0.." + (size - 1) + ").");
        }
        if (!Double.isFinite(val) || val < 0) {
            throw new IllegalArgumentException("Update fare value must be a finite non-negative number.");
        }
    }

    private double[] resolveFares(AnalyticsRequest req) {
        List<Double> list;
        if (req != null && Boolean.TRUE.equals(req.syncWithFlights())) {
            list = getActiveFlightFares();
        } else if (req != null && req.fares() != null) {
            if (req.fares().isEmpty()) {
                throw new IllegalArgumentException("Fare dataset cannot be empty.");
            }
            if (req.fares().size() > 32) {
                throw new IllegalArgumentException("Maximum 32 fare entries allowed for analytics visualization.");
            }
            list = req.fares();
        } else {
            list = DEFAULT_FARES;
        }
        double[] arr = new double[list.size()];
        for (int i = 0; i < list.size(); i++) {
            Double v = list.get(i);
            if (v == null || !Double.isFinite(v) || v < 0) {
                throw new IllegalArgumentException("All fare values must be finite non-negative numbers.");
            }
            arr[i] = v;
        }
        return arr;
    }
}
