package com.aeroops.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "flights")
public class Flight {

    @Id
    @Column(name = "flight_id", length = 20, nullable = false)
    private String flightId;

    @Column(name = "flight_name", length = 100, nullable = false)
    private String flightName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "source_code", nullable = false)
    private Airport sourceAirport;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "destination_code", nullable = false)
    private Airport destinationAirport;

    @Column(name = "fare", nullable = false)
    private Double fare;

    @Column(name = "capacity", nullable = false)
    private Integer capacity = 180;

    @Column(name = "status", length = 20, nullable = false)
    private String status = "Scheduled";

    @Column(name = "departure_time", length = 30, nullable = false)
    private String departureTime;

    @Column(name = "arrival_time", length = 30, nullable = false)
    private String arrivalTime;

    public Flight() {}

    public Flight(String flightId, String flightName, Airport sourceAirport, Airport destinationAirport,
                  Double fare, Integer capacity, String status, String departureTime, String arrivalTime) {
        this.flightId = flightId;
        this.flightName = flightName;
        this.sourceAirport = sourceAirport;
        this.destinationAirport = destinationAirport;
        this.fare = fare;
        this.capacity = capacity != null ? capacity : 180;
        this.status = status != null ? status : "Scheduled";
        this.departureTime = departureTime;
        this.arrivalTime = arrivalTime;
    }

    public String getFlightId() {
        return flightId;
    }

    public void setFlightId(String flightId) {
        this.flightId = flightId;
    }

    public String getFlightName() {
        return flightName;
    }

    public void setFlightName(String flightName) {
        this.flightName = flightName;
    }

    public Airport getSourceAirport() {
        return sourceAirport;
    }

    public void setSourceAirport(Airport sourceAirport) {
        this.sourceAirport = sourceAirport;
    }

    public Airport getDestinationAirport() {
        return destinationAirport;
    }

    public void setDestinationAirport(Airport destinationAirport) {
        this.destinationAirport = destinationAirport;
    }

    public Double getFare() {
        return fare;
    }

    public void setFare(Double fare) {
        this.fare = fare;
    }

    public Integer getCapacity() {
        return capacity;
    }

    public void setCapacity(Integer capacity) {
        this.capacity = capacity;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getDepartureTime() {
        return departureTime;
    }

    public void setDepartureTime(String departureTime) {
        this.departureTime = departureTime;
    }

    public String getArrivalTime() {
        return arrivalTime;
    }

    public void setArrivalTime(String arrivalTime) {
        this.arrivalTime = arrivalTime;
    }
}
