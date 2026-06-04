package model;

public class Passenger {
    private int passengerId;
    private String passengerName;
    private int age;
    private String gender;

    public Passenger(int passengerId, String passengerName, int age, String gender) {
        this.passengerId = passengerId;
        this.passengerName = passengerName;
        this.age = age;
        this.gender = gender;
    }

    public int getPassengerId() {
        return passengerId;
    }

    public String getPassengerName() {
        return passengerName;
    }

    public int getAge() {
        return age;
    }

    public String getGender() {
        return gender;
    }

    public void displayPassenger() {
        System.out.println("Passenger ID: " + passengerId);
        System.out.println("Passenger Name: " + passengerName);
        System.out.println("Age: " + age);
        System.out.println("Gender: " + gender);
    }
}