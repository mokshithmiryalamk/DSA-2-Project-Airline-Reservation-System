package com.aeroops.repository;

import com.aeroops.entity.Passenger;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PassengerRepository extends JpaRepository<Passenger, Long> {

    @Query("SELECT p FROM Passenger p WHERE (:query IS NULL OR " +
           "UPPER(p.passengerName) LIKE UPPER(CONCAT('%', :query, '%')) OR " +
           "CAST(p.passengerId AS string) LIKE CONCAT('%', :query, '%'))")
    List<Passenger> searchPassengers(@Param("query") String query);

    @Query("SELECT COALESCE(MAX(p.passengerId), 100) FROM Passenger p")
    Long findMaxPassengerId();

    @Query(value = "SELECT nextval('passenger_id_seq')", nativeQuery = true)
    Long getNextPassengerId();
}
