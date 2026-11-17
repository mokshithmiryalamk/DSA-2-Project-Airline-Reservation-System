package com.aeroops;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class AeroopsApplicationTests {

    @Autowired
    private MockMvc mvc;

    @Autowired
    private ObjectMapper mapper;

    @Test
    @DisplayName("Health endpoint returns status UP and service metadata")
    void testHealthEndpoint() throws Exception {
        mvc.perform(get("/api/v1/health"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("UP"))
            .andExpect(jsonPath("$.dsaPreserved").value(true));
    }

    @Test
    @DisplayName("Verify seed data loaded via Flyway migrations")
    void testSeedDataPresence() throws Exception {
        mvc.perform(get("/api/v1/airports"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(10)))
            .andExpect(jsonPath("$[0].airportCode").isNotEmpty());

        mvc.perform(get("/api/v1/flights"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(8))));

        mvc.perform(get("/api/v1/passengers"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(6))));

        mvc.perform(get("/api/v1/bookings"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(4))));
    }

    @Test
    @DisplayName("Flight CRUD, filtering, and validation")
    void testFlightOperations() throws Exception {
        var newFlight = Map.of(
            "flightId", "TEST-901",
            "flightName", "Test Skyways",
            "source", "DEL",
            "destination", "BOM",
            "fare", 4999.0,
            "capacity", 2,
            "status", "Scheduled",
            "departureTime", "10:00 UTC",
            "arrivalTime", "12:00 UTC"
        );

        mvc.perform(post("/api/v1/flights")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(newFlight)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.flightId").value("TEST-901"))
            .andExpect(jsonPath("$.availableSeats").value(2));

        // Filter search
        mvc.perform(get("/api/v1/flights?source=DEL&destination=BOM"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(2))));

        // Reject invalid fare
        var invalidFlight = Map.of(
            "flightId", "TEST-FAIL",
            "flightName", "Fail Air",
            "source", "DEL",
            "destination", "BLR",
            "fare", -100.0
        );
        mvc.perform(post("/api/v1/flights")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(invalidFlight)))
            .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Passenger CRUD and age validation")
    void testPassengerOperations() throws Exception {
        var passenger = Map.of(
            "passengerName", "Dev Tester",
            "age", 30,
            "gender", "Male"
        );

        var res = mvc.perform(post("/api/v1/passengers")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(passenger)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.passengerName").value("Dev Tester"))
            .andReturn();

        String body = res.getResponse().getContentAsString();
        Number id = mapper.readTree(body).get("passengerId").numberValue();

        // Retrieve
        mvc.perform(get("/api/v1/passengers/" + id))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.age").value(30));

        // Reject invalid age
        var badPassenger = Map.of("passengerName", "Baby", "age", 0, "gender", "Other");
        mvc.perform(post("/api/v1/passengers")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(badPassenger)))
            .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Transactional booking, capacity limit, duplicate seat prevention, and cancellation")
    void testBookingLifecycle() throws Exception {
        // Setup flight with capacity 1
        var flight = Map.of(
            "flightId", "CAP-100",
            "flightName", "Capacity Express",
            "source", "HYD",
            "destination", "MAA",
            "fare", 3200.0,
            "capacity", 1
        );
        mvc.perform(post("/api/v1/flights")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(flight)))
            .andExpect(status().isCreated());

        // Book 1st passenger with specific seat 1A
        var booking1 = Map.of(
            "passengerId", 101,
            "flightId", "CAP-100",
            "seatNumber", "1A"
        );
        var res1 = mvc.perform(post("/api/v1/bookings")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(booking1)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.seatNumber").value("1A"))
            .andExpect(jsonPath("$.status").value("CONFIRMED"))
            .andReturn();

        Number ticketId = mapper.readTree(res1.getResponse().getContentAsString()).get("ticketId").numberValue();

        // Attempt duplicate seat on same flight
        var bookingDuplicateSeat = Map.of(
            "passengerId", 102,
            "flightId", "CAP-100",
            "seatNumber", "1A"
        );
        mvc.perform(post("/api/v1/bookings")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(bookingDuplicateSeat)))
            .andExpect(status().isConflict());

        // Attempt overbooking beyond capacity
        var bookingOverCapacity = Map.of(
            "passengerId", 102,
            "flightId", "CAP-100",
            "seatNumber", "1B"
        );
        mvc.perform(post("/api/v1/bookings")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(bookingOverCapacity)))
            .andExpect(status().isConflict());

        // Referential integrity check: cannot delete flight with active ticket
        mvc.perform(delete("/api/v1/flights/CAP-100"))
            .andExpect(status().isConflict());

        // Cancel the booking
        mvc.perform(post("/api/v1/bookings/" + ticketId + "/cancel"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("CANCELLED"));

        // Seat is now released: rebooking 1A succeeds
        var bookingAfterCancel = Map.of(
            "passengerId", 102,
            "flightId", "CAP-100",
            "seatNumber", "1A"
        );
        mvc.perform(post("/api/v1/bookings")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(bookingAfterCancel)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.passengerId").value(102));
    }
}
