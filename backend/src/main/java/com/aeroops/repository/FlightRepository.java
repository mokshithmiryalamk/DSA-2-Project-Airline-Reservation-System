package com.aeroops.repository;

import com.aeroops.entity.Flight;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FlightRepository extends JpaRepository<Flight, String> {

    Optional<Flight> findByFlightIdIgnoreCase(String flightId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT f FROM Flight f WHERE UPPER(f.flightId) = UPPER(:flightId)")
    Optional<Flight> findByIdForUpdate(@Param("flightId") String flightId);

    @Query("SELECT f FROM Flight f JOIN FETCH f.sourceAirport JOIN FETCH f.destinationAirport " +
           "WHERE (:source IS NULL OR UPPER(f.sourceAirport.airportCode) = UPPER(:source)) " +
           "AND (:dest IS NULL OR UPPER(f.destinationAirport.airportCode) = UPPER(:dest)) " +
           "AND (:status IS NULL OR UPPER(f.status) = UPPER(:status)) " +
           "AND (:query IS NULL OR (UPPER(f.flightId) LIKE UPPER(CONCAT('%', :query, '%')) " +
           "OR UPPER(f.flightName) LIKE UPPER(CONCAT('%', :query, '%'))))")
    List<Flight> searchFlights(@Param("source") String source,
                               @Param("dest") String dest,
                               @Param("status") String status,
                               @Param("query") String query);

    @Query("SELECT f FROM Flight f JOIN FETCH f.sourceAirport JOIN FETCH f.destinationAirport")
    List<Flight> findAllWithAirports();
}
