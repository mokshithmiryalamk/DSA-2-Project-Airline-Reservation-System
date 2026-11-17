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
            tree.updateFare(req.updateIndex(), req.updateValue(), steps);
        }

        int qL = req != null && req.queryLeft() != null ? req.queryLeft() : 0;
        int qR = req != null && req.queryRight() != null ? req.queryRight() : tree.getSize() - 1;

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
            tree.setFare(req.updateIndex(), req.updateValue(), steps);
        }

        int qL = req != null && req.queryLeft() != null ? req.queryLeft() : 0;
        int qR = req != null && req.queryRight() != null ? req.queryRight() : tree.getSize() - 1;

        double sum = tree.rangeSumWithTrace(qL, qR, steps);

        return new FenwickTreeResult(
            "Fenwick Tree (BIT)", tree.getSize(),
            tree.getFares(), tree.getTreeArray(),
            qL, qR, sum, steps
        );
    }

    private double[] resolveFares(AnalyticsRequest req) {
        List<Double> list;
        if (req != null && Boolean.TRUE.equals(req.syncWithFlights())) {
            list = getActiveFlightFares();
        } else if (req != null && req.fares() != null && !req.fares().isEmpty()) {
            list = req.fares();
        } else {
            list = DEFAULT_FARES;
        }
        double[] arr = new double[list.size()];
        for (int i = 0; i < list.size(); i++) {
            arr[i] = list.get(i);
        }
        return arr;
    }
}
