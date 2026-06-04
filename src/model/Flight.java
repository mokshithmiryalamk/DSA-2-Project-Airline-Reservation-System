package model;

public class Flight {
	private String flightId;
    private String flightName;
    private String source;
    private String destination;
    private double fare;

    public Flight(String flightId, String flightName, String source, String destination, double fare) {
        this.flightId = flightId;
        this.flightName = flightName;
        this.source = source;
        this.destination = destination;
        this.fare = fare;
    }

    public String getFlightId() {
        return flightId;
    }

    public String getFlightName() {
        return flightName;
    }

    public String getSource() {
        return source;
    }

    public String getDestination() {
        return destination;
    }

    public double getFare() {
        return fare;
    }
    
    public void setFare(double fare) {
        this.fare = fare;
    }

    public void displayFlight() {
        System.out.println("Flight ID: " + flightId);
        System.out.println("Flight Name: " + flightName);
        System.out.println("Source: " + source);
        System.out.println("Destination: " + destination);
        System.out.println("Fare: " + fare);
    }
}