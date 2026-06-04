package model;

public class Airport {
    private int airportId;
    private String airportName;
    private String city;

    public Airport(int airportId, String airportName, String city) {
        this.airportId = airportId;
        this.airportName = airportName;
        this.city = city;
    }

    public int getAirportId() {
        return airportId;
    }

    public String getAirportName() {
        return airportName;
    }

    public String getCity() {
        return city;
    }

    public void displayAirport() {
        System.out.println("Airport ID: " + airportId);
        System.out.println("Airport Name: " + airportName);
        System.out.println("City: " + city);
    }
}