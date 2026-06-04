package model;

public class Ticket {
    private int ticketId;
    private Passenger passenger;
    private Flight flight;

    public Ticket(int ticketId, Passenger passenger, Flight flight) {
        this.ticketId = ticketId;
        this.passenger = passenger;
        this.flight = flight;
    }

    public int getTicketId() {
        return ticketId;
    }

    public Passenger getPassenger() {
        return passenger;
    }

    public Flight getFlight() {
        return flight;
    }

    public void displayTicket() {
        System.out.println("Ticket ID: " + ticketId);
        System.out.println("Passenger: " + passenger.getPassengerName());
        System.out.println("Flight: " + flight.getFlightName());
        System.out.println("Route: " + flight.getSource() + " -> " + flight.getDestination());
        System.out.println("Fare: " + flight.getFare());
    }
}