package com.aeroops.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "passengers")
public class Passenger {

    @Id
    @Column(name = "passenger_id", nullable = false)
    private Long passengerId;

    @Column(name = "passenger_name", length = 100, nullable = false)
    private String passengerName;

    @Column(name = "age", nullable = false)
    private Integer age;

    @Column(name = "gender", length = 20, nullable = false)
    private String gender;

    public Passenger() {}

    public Passenger(Long passengerId, String passengerName, Integer age, String gender) {
        this.passengerId = passengerId;
        this.passengerName = passengerName;
        this.age = age;
        this.gender = gender;
    }

    public Long getPassengerId() {
        return passengerId;
    }

    public void setPassengerId(Long passengerId) {
        this.passengerId = passengerId;
    }

    public String getPassengerName() {
        return passengerName;
    }

    public void setPassengerName(String passengerName) {
        this.passengerName = passengerName;
    }

    public Integer getAge() {
        return age;
    }

    public void setAge(Integer age) {
        this.age = age;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }
}
