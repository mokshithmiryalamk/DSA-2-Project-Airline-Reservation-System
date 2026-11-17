package com.aeroops.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "airports")
public class Airport {

    @Id
    @Column(name = "airport_code", length = 10, nullable = false)
    private String airportCode;

    @Column(name = "airport_name", length = 100, nullable = false)
    private String airportName;

    @Column(name = "city", length = 50, nullable = false)
    private String city;

    @Column(name = "state", length = 50, nullable = false)
    private String state;

    public Airport() {}

    public Airport(String airportCode, String airportName, String city, String state) {
        this.airportCode = airportCode;
        this.airportName = airportName;
        this.city = city;
        this.state = state;
    }

    public String getAirportCode() {
        return airportCode;
    }

    public void setAirportCode(String airportCode) {
        this.airportCode = airportCode;
    }

    public String getAirportName() {
        return airportName;
    }

    public void setAirportName(String airportName) {
        this.airportName = airportName;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }
}
