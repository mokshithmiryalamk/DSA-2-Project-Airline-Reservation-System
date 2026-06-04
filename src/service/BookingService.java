package service;

import java.util.ArrayList;

import model.Flight;
import model.Passenger;
import model.Ticket;

public class BookingService {

    private ArrayList<Ticket> tickets = new ArrayList<>();

    public void bookTicket(int ticketId, Passenger passenger, Flight flight) {
        Ticket ticket = new Ticket(ticketId, passenger, flight);
        tickets.add(ticket);

        System.out.println("Ticket booked successfully.");
    }

    public void viewTickets() {
        if (tickets.isEmpty()) {
            System.out.println("No tickets booked.");
            return;
        }

        for (int i = 0; i < tickets.size(); i++) {
            tickets.get(i).displayTicket();
            System.out.println("-------------------");
        }
    }

    public Ticket searchTicket(int ticketId) {
        for (int i = 0; i < tickets.size(); i++) {
            if (tickets.get(i).getTicketId() == ticketId) {
                return tickets.get(i);
            }
        }
        return null;
    }
    
    public void cancelTicket(int ticketId) {
        for(int i = 0; i < tickets.size(); i++) {
            if(tickets.get(i).getTicketId() == ticketId) {
                tickets.remove(i);
                System.out.println("Ticket cancelled successfully.");
                return;
            }
        }
        System.out.println("Ticket not found.");
    }
}