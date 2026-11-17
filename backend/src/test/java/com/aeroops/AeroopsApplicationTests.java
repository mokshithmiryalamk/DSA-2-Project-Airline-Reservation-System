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
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.assertEquals;
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
    @DisplayName("Fix 1: Concurrency-safe sequence ID allocation without collisions")
    void testSequenceIdAllocation() throws Exception {
        // Create 2 passengers without passing ID
        var p1 = Map.of("passengerName", "Seq Tester One", "age", 25, "gender", "Female");
        var res1 = mvc.perform(post("/api/v1/passengers")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(p1)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.passengerId", greaterThanOrEqualTo(200)))
            .andReturn();
        long id1 = mapper.readTree(res1.getResponse().getContentAsString()).get("passengerId").asLong();

        var p2 = Map.of("passengerName", "Seq Tester Two", "age", 28, "gender", "Male");
        var res2 = mvc.perform(post("/api/v1/passengers")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(p2)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.passengerId", greaterThanOrEqualTo(201)))
            .andReturn();
        long id2 = mapper.readTree(res2.getResponse().getContentAsString()).get("passengerId").asLong();

        assertEquals(id1 + 1, id2, "Passenger sequence should allocate monotonically without collisions");

        // Create bookings without passing ticketId
        var b1 = Map.of("passengerId", id1, "flightId", "AI-101");
        var bRes1 = mvc.perform(post("/api/v1/bookings")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(b1)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.ticketId", greaterThanOrEqualTo(2000)))
            .andReturn();
        long tId1 = mapper.readTree(bRes1.getResponse().getContentAsString()).get("ticketId").asLong();

        var b2 = Map.of("passengerId", id2, "flightId", "AI-101");
        var bRes2 = mvc.perform(post("/api/v1/bookings")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(b2)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.ticketId", greaterThanOrEqualTo(2001)))
            .andReturn();
        long tId2 = mapper.readTree(bRes2.getResponse().getContentAsString()).get("ticketId").asLong();

        assertEquals(tId1 + 1, tId2, "Ticket sequence should allocate monotonically without collisions");
    }

    @Test
    @DisplayName("Fix 2: Seat validation against layout A-F and flight capacity (including non-multiples of 6)")
    void testSeatValidationAndNonMultipleCapacity() throws Exception {
        // Flight with capacity 8 (Row 1: 1A-1F [idx 0-5], Row 2: 2A, 2B [idx 6-7])
        var flight = Map.of(
            "flightId", "SEAT-800",
            "flightName", "Commuter Eight",
            "source", "BOM",
            "destination", "PNQ",
            "fare", 2500.0,
            "capacity", 8
        );
        mvc.perform(post("/api/v1/flights")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(flight)))
            .andExpect(status().isCreated());

        // Reject invalid seat column outside A-F (e.g. 1G)
        var invalidCol = Map.of("passengerId", 101, "flightId", "SEAT-800", "seatNumber", "1G");
        mvc.perform(post("/api/v1/bookings")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(invalidCol)))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.message", containsString("Expected format like '1A', '12F'")));

        // Reject invalid row format (0A)
        var invalidRow = Map.of("passengerId", 101, "flightId", "SEAT-800", "seatNumber", "0A");
        mvc.perform(post("/api/v1/bookings")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(invalidRow)))
            .andExpect(status().isBadRequest());

        // Reject seat exceeding capacity 8 (2C has index 8 >= capacity 8)
        var outOfCapacitySeat = Map.of("passengerId", 101, "flightId", "SEAT-800", "seatNumber", "2C");
        mvc.perform(post("/api/v1/bookings")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(outOfCapacitySeat)))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.message", containsString("exceeds aircraft capacity")));

        // Valid explicit boundary seat 2B (index 7 < 8) succeeds
        var validBoundarySeat = Map.of("passengerId", 101, "flightId", "SEAT-800", "seatNumber", "2B");
        mvc.perform(post("/api/v1/bookings")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(validBoundarySeat)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.seatNumber").value("2B"));
    }

    @Test
    @DisplayName("Fix 3: Preserving historical cancelled bookings when attempting entity deletion")
    void testDeletionWithCancelledBookingsPreservesHistory() throws Exception {
        var flight = Map.of(
            "flightId", "HIST-101",
            "flightName", "History Air",
            "source", "DEL",
            "destination", "HYD",
            "fare", 4500.0,
            "capacity", 10
        );
        mvc.perform(post("/api/v1/flights")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(flight)))
            .andExpect(status().isCreated());

        var passenger = Map.of("passengerName", "Audit Passenger", "age", 40, "gender", "Female");
        var pRes = mvc.perform(post("/api/v1/passengers")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(passenger)))
            .andExpect(status().isCreated())
            .andReturn();
        long pId = mapper.readTree(pRes.getResponse().getContentAsString()).get("passengerId").asLong();

        // Book and cancel
        var booking = Map.of("passengerId", pId, "flightId", "HIST-101", "seatNumber", "1A");
        var bRes = mvc.perform(post("/api/v1/bookings")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(booking)))
            .andExpect(status().isCreated())
            .andReturn();
        long tId = mapper.readTree(bRes.getResponse().getContentAsString()).get("ticketId").asLong();

        mvc.perform(post("/api/v1/bookings/" + tId + "/cancel"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("CANCELLED"));

        // Deleting flight with cancelled booking history returns 409 Conflict (NOT 500)
        mvc.perform(delete("/api/v1/flights/HIST-101"))
            .andExpect(status().isConflict())
            .andExpect(jsonPath("$.message", containsString("booking history exists")));

        // Deleting passenger with cancelled booking history returns 409 Conflict (NOT 500)
        mvc.perform(delete("/api/v1/passengers/" + pId))
            .andExpect(status().isConflict())
            .andExpect(jsonPath("$.message", containsString("booking history exists")));
    }

    @Test
    @DisplayName("Fix 4: Concurrent capacity changes and booking synchronization")
    void testConcurrentCapacityAndBookings() throws Exception {
        var flight = Map.of(
            "flightId", "CONC-200",
            "flightName", "Concurrent Wing",
            "source", "BLR",
            "destination", "GOI",
            "fare", 3800.0,
            "capacity", 2
        );
        mvc.perform(post("/api/v1/flights")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(flight)))
            .andExpect(status().isCreated());

        // 5 concurrent booking requests competing for 2 seats
        int threads = 5;
        ExecutorService executor = Executors.newFixedThreadPool(threads);
        CountDownLatch startLatch = new CountDownLatch(1);
        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger conflictCount = new AtomicInteger(0);

        for (int i = 0; i < threads; i++) {
            executor.submit(() -> {
                try {
                    startLatch.await();
                    var req = Map.of("passengerId", 101, "flightId", "CONC-200");
                    var res = mvc.perform(post("/api/v1/bookings")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(mapper.writeValueAsString(req)))
                        .andReturn();
                    int code = res.getResponse().getStatus();
                    if (code == 201) successCount.incrementAndGet();
                    else if (code == 409) conflictCount.incrementAndGet();
                } catch (Exception e) {
                    // count conflict
                    conflictCount.incrementAndGet();
                }
            });
        }

        startLatch.countDown();
        executor.shutdown();
        executor.awaitTermination(10, TimeUnit.SECONDS);

        assertEquals(2, successCount.get(), "Exactly 2 concurrent bookings should succeed for capacity 2");
        assertEquals(3, conflictCount.get(), "Remaining 3 concurrent bookings must receive 409 Conflict");

        // Attempt reducing capacity to 1 when 2 confirmed bookings exist -> 409 Conflict
        var reduceReq = Map.of("capacity", 1);
        mvc.perform(put("/api/v1/flights/CONC-200")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(reduceReq)))
            .andExpect(status().isConflict())
            .andExpect(jsonPath("$.message", containsString("Cannot reduce capacity")));
    }
}
