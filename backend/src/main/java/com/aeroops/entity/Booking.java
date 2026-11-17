package com.aeroops.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "bookings")
public class Booking {

    @Id
    @Column(name = "ticket_id", nullable = false)
    private Long ticketId;

    @Column(name = "booking_reference", length = 36, nullable = false, unique = true)
    private String bookingReference;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "passenger_id", nullable = false)
    private Passenger passenger;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "flight_id", nullable = false)
    private Flight flight;

    @Column(name = "seat_number", length = 10, nullable = false)
    private String seatNumber;

    @Column(name = "booked_at", nullable = false)
    private Instant bookedAt;

    @Column(name = "status", length = 20, nullable = false)
    private String status = "CONFIRMED";

    @Column(name = "fare", nullable = false)
    private Double fare;

    public Booking() {}

    public Booking(Long ticketId, String bookingReference, Passenger passenger, Flight flight,
                   String seatNumber, Instant bookedAt, String status, Double fare) {
        this.ticketId = ticketId;
        this.bookingReference = bookingReference;
        this.passenger = passenger;
        this.flight = flight;
        this.seatNumber = seatNumber;
        this.bookedAt = bookedAt;
        this.status = status != null ? status : "CONFIRMED";
        this.fare = fare;
    }

    public Long getTicketId() {
        return ticketId;
    }

    public void setTicketId(Long ticketId) {
        this.ticketId = ticketId;
    }

    public String getBookingReference() {
        return bookingReference;
    }

    public void setBookingReference(String bookingReference) {
        this.bookingReference = bookingReference;
    }

    public Passenger getPassenger() {
        return passenger;
    }

    public void setPassenger(Passenger passenger) {
        this.passenger = passenger;
    }

    public Flight getFlight() {
        return flight;
    }

    public void setFlight(Flight flight) {
        this.flight = flight;
    }

    public String getSeatNumber() {
        return seatNumber;
    }

    public void setSeatNumber(String seatNumber) {
        this.seatNumber = seatNumber;
    }

    public Instant getBookedAt() {
        return bookedAt;
    }

    public void setBookedAt(Instant bookedAt) {
        this.bookedAt = bookedAt;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Double getFare() {
        return fare;
    }

    public void setFare(Double fare) {
        this.fare = fare;
    }
}
