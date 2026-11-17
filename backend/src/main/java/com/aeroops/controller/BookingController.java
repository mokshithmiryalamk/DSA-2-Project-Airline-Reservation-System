package com.aeroops.controller;

import com.aeroops.dto.BookingCreateRequest;
import com.aeroops.dto.BookingDto;
import com.aeroops.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @GetMapping
    public ResponseEntity<List<BookingDto>> getAllBookings() {
        return ResponseEntity.ok(bookingService.getAllBookings());
    }

    @GetMapping("/{ticketId}")
    public ResponseEntity<BookingDto> getBookingById(@PathVariable Long ticketId) {
        return ResponseEntity.ok(bookingService.getBookingById(ticketId));
    }

    @GetMapping("/reference/{reference}")
    public ResponseEntity<BookingDto> getBookingByReference(@PathVariable String reference) {
        return ResponseEntity.ok(bookingService.getBookingByReference(reference));
    }

    @PostMapping
    public ResponseEntity<BookingDto> bookTicket(@Valid @RequestBody BookingCreateRequest request) {
        BookingDto created = bookingService.bookTicket(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PostMapping("/{ticketId}/cancel")
    public ResponseEntity<BookingDto> cancelBooking(@PathVariable Long ticketId) {
        return ResponseEntity.ok(bookingService.cancelBooking(ticketId));
    }
}
