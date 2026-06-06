package main;

import java.util.Scanner;
import model.Flight;
import model.Passenger;
import model.Ticket;
import service.BookingService;
import service.FlightService;
import service.PassengerService;
import graphs.GraphAlgorithms;

public class AirlineReservationSystem {

    static Scanner sc = new Scanner(System.in);
    static PassengerService passengerService = new PassengerService();
    static FlightService flightService = new FlightService();
    static BookingService bookingService = new BookingService();
    static GraphAlgorithms graphService = new GraphAlgorithms();

    public static void main(String[] args) {
        int choice;

        do {
            System.out.println("\n===== AIRLINE RESERVATION SYSTEM =====");
            System.out.println("\n1. Passenger Management");
            System.out.println("2. Flight Management");
            System.out.println("3. Booking Management");

            System.out.println("4. \nTree Algorithms");
            System.out.println("5. Fare Analytics");
            System.out.println("6. Sorting Algorithms");
            System.out.println("7. Graph Algorithms");

            System.out.println("8. \nExit");
            System.out.print("Enter your choice: ");
            choice = sc.nextInt();

            switch(choice) {
                case 1:
                    passengerMenu();
                    break;
                case 2:
                    flightMenu();
                    break;
                case 3:
                    bookingMenu();
                    break;
                case 4:
                    treeMenu();
                    break;
                case 5:
                    fareAnalyticsMenu();
                    break;
                case 6:
                    sortingMenu();
                    break;
                case 7:
                    graphMenu();
                    break;
                case 8:
                    System.out.println("Thank You!");
                    break;
                default:
                    System.out.println("Invalid choice.");
            }

        } while(choice != 8);

        sc.close();
    }

 // =========================
 // PASSENGER MANAGEMENT
 // =========================
 
    public static void passengerMenu() {
        int choice;

        do {
            System.out.println("\n===== PASSENGER MANAGEMENT =====");
            System.out.println("1. Add Passenger");
            System.out.println("2. View Passengers");
            System.out.println("3. Search Passenger");
            System.out.println("4. Delete Passenger");
            System.out.println("5. Back");
            System.out.print("Enter your choice: ");
            choice = sc.nextInt();

            switch(choice) {
                case 1:
                    System.out.print("Enter Passenger ID: ");
                    int pid = sc.nextInt();
                    sc.nextLine();

                    System.out.print("Enter Passenger Name: ");
                    String pname = sc.nextLine();

                    System.out.print("Enter Age: ");
                    int age = sc.nextInt();
                    sc.nextLine();

                    System.out.print("Enter Gender: ");
                    String gender = sc.nextLine();

                    Passenger passenger = new Passenger(pid, pname, age, gender);
                    passengerService.addPassenger(passenger);
                    break;

                case 2:
                    passengerService.viewPassengers();
                    break;

                case 3:
                    System.out.print("Enter Passenger ID: ");
                    int searchPid = sc.nextInt();

                    Passenger foundPassenger = passengerService.searchPassenger(searchPid);

                    if(foundPassenger != null) {
                        foundPassenger.displayPassenger();
                    } else {
                        System.out.println("Passenger not found.");
                    }
                    break;

                case 4:
                    System.out.print("Enter Passenger ID: ");
                    int deletePid = sc.nextInt();
                    passengerService.deletePassenger(deletePid);
                    break;

                case 5:
                    break;

                default:
                    System.out.println("Invalid choice.");
            }

        } while(choice != 5);
    }
    
 // =========================
 // FLIGHT MANAGEMENT
 // =========================

    public static void flightMenu() {
        int choice;

        do {
            System.out.println("\n===== FLIGHT MANAGEMENT =====");
            System.out.println("1. Add Flight");
            System.out.println("2. View Flights");
            System.out.println("3. Search Flight");
            System.out.println("4. Delete Flight");
            System.out.println("5. Back");
            System.out.print("Enter your choice: ");
            choice = sc.nextInt();

            switch(choice) {
                case 1:
                    sc.nextLine();

                    System.out.print("Enter Flight ID: ");
                    String fid = sc.nextLine();

                    System.out.print("Enter Flight Name: ");
                    String fname = sc.nextLine();

                    System.out.print("Enter Source: ");
                    String source = sc.nextLine();

                    System.out.print("Enter Destination: ");
                    String destination = sc.nextLine();

                    System.out.print("Enter Fare: ");
                    double fare = sc.nextDouble();

                    Flight flight = new Flight(fid, fname, source, destination, fare);
                    flightService.addFlight(flight);
                    break;

                case 2:
                    flightService.viewFlights();
                    break;

                case 3:
                    sc.nextLine();

                    System.out.print("Enter Flight ID: ");
                    String searchFid = sc.nextLine();

                    Flight foundFlight = flightService.searchFlight(searchFid);

                    if(foundFlight != null) {
                        foundFlight.displayFlight();
                    } else {
                        System.out.println("Flight not found.");
                    }
                    break;

                case 4:
                    sc.nextLine();

                    System.out.print("Enter Flight ID: ");
                    String deleteFid = sc.nextLine();

                    flightService.deleteFlight(deleteFid);
                    break;

                case 5:
                    break;

                default:
                    System.out.println("Invalid choice.");
            }

        } while(choice != 5);
    }

 // =========================
 // BOOKING MANAGEMENT
 // =========================
    
    public static void bookingMenu() {
        int choice;

        do {
            System.out.println("\n===== BOOKING MANAGEMENT =====");
            System.out.println("1. Book Ticket");
            System.out.println("2. View Tickets");
            System.out.println("3. Search Ticket");
            System.out.println("4. Cancel Ticket");
            System.out.println("5. Back");
            System.out.print("Enter your choice: ");
            choice = sc.nextInt();

            switch(choice) {
                case 1:
                    System.out.print("Enter Ticket ID: ");
                    int ticketId = sc.nextInt();

                    System.out.print("Enter Passenger ID: ");
                    int passengerId = sc.nextInt();
                    sc.nextLine();

                    System.out.print("Enter Flight ID: ");
                    String flightId = sc.nextLine();

                    Passenger passengerObj = passengerService.searchPassenger(passengerId);
                    Flight flightObj = flightService.searchFlight(flightId);

                    if(passengerObj != null && flightObj != null) {
                        bookingService.bookTicket(ticketId, passengerObj, flightObj);
                    } else {
                        System.out.println("Passenger or Flight not found.");
                    }
                    break;

                case 2:
                    bookingService.viewTickets();
                    break;

                case 3:
                    System.out.print("Enter Ticket ID: ");
                    int searchTicketId = sc.nextInt();

                    Ticket foundTicket = bookingService.searchTicket(searchTicketId);

                    if(foundTicket != null) {
                        foundTicket.displayTicket();
                    } else {
                        System.out.println("Ticket not found.");
                    }
                    break;

                case 4:
                    System.out.print("Enter Ticket ID to Cancel: ");
                    int cancelTicketId = sc.nextInt();
                    bookingService.cancelTicket(cancelTicketId);
                    break;

                case 5:
                    break;

                default:
                    System.out.println("Invalid choice.");
            }

        } while(choice != 5);
    }
    
 // =========================
 // TREE ALGORITHMS
 // =========================

    public static void treeMenu() {
        int choice;

        do {
            System.out.println("\n===== TREE ALGORITHMS =====");
            System.out.println("1. View Passengers Using BST");
            System.out.println("2. Search Passenger Using BST");
            System.out.println("3. View Passengers Using AVL");
            System.out.println("4. Search Passenger Using AVL");
            System.out.println("5. View Passengers Using B-Tree");
            System.out.println("6. Search Passenger Using B-Tree");
            System.out.println("7. View Passengers Using B+ Tree");
            System.out.println("8. Search Passenger Using B+ Tree");
            System.out.println("9. Back");
            System.out.print("Enter your choice: ");
            choice = sc.nextInt();

            switch(choice) {
                case 1:
                    passengerService.viewPassengersUsingBST();
                    break;

                case 2:
                    System.out.print("Enter Passenger ID: ");
                    int bstId = sc.nextInt();

                    Passenger bstPassenger = passengerService.searchPassengerUsingBST(bstId);

                    if(bstPassenger != null) {
                        bstPassenger.displayPassenger();
                    } else {
                        System.out.println("Passenger not found.");
                    }
                    break;

                case 3:
                    passengerService.viewPassengersUsingAVL();
                    break;

                case 4:
                    System.out.print("Enter Passenger ID: ");
                    int avlId = sc.nextInt();

                    Passenger avlPassenger = passengerService.searchPassengerUsingAVL(avlId);

                    if(avlPassenger != null) {
                        avlPassenger.displayPassenger();
                    } else {
                        System.out.println("Passenger not found.");
                    }
                    break;

                case 5:
                    passengerService.viewPassengersUsingBTree();
                    break;

                case 6:
                    System.out.print("Enter Passenger ID: ");
                    int btreeId = sc.nextInt();

                    if(passengerService.searchPassengerUsingBTree(btreeId)) {
                        System.out.println("Passenger found in B-Tree.");
                    } else {
                        System.out.println("Passenger not found in B-Tree.");
                    }
                    break;

                case 7:
                    passengerService.viewPassengersUsingBPlusTree();
                    break;

                case 8:
                    System.out.print("Enter Passenger ID: ");
                    int bPlusId = sc.nextInt();

                    if(passengerService.searchPassengerUsingBPlusTree(bPlusId)) {
                        System.out.println("Passenger found in B+ Tree.");
                    } else {
                        System.out.println("Passenger not found in B+ Tree.");
                    }
                    break;

                case 9:
                    break;

                default:
                    System.out.println("Invalid choice.");
            }

        } while(choice != 9);
    }

 // =========================
 // FARE ANALYTICS
 // =========================
    
    public static void fareAnalyticsMenu() {
        int choice;

        do {
            System.out.println("\n===== FARE ANALYTICS =====");
            System.out.println("1. Build Segment Tree");
            System.out.println("2. Find Minimum Fare in Range");
            System.out.println("3. Update Fare Using Segment Tree");
            System.out.println("4. Build Fenwick Tree");
            System.out.println("5. Find Total Fare in Range");
            System.out.println("6. Update Fare Using Fenwick Tree");
            System.out.println("7. Back");
            System.out.print("Enter your choice: ");
            choice = sc.nextInt();

            switch(choice) {
                case 1:
                    flightService.buildSegmentTree();
                    break;

                case 2:
                    System.out.print("Enter Start Index: ");
                    int s1 = sc.nextInt();

                    System.out.print("Enter End Index: ");
                    int e1 = sc.nextInt();

                    flightService.findMinimumFare(s1, e1);
                    break;

                case 3:
                    System.out.print("Enter Flight Index: ");
                    int index1 = sc.nextInt();

                    System.out.print("Enter New Fare: ");
                    double newFare1 = sc.nextDouble();

                    flightService.updateFlightFare(index1, newFare1);
                    break;

                case 4:
                    flightService.buildFenwickTree();
                    break;

                case 5:
                    System.out.print("Enter Start Index: ");
                    int s2 = sc.nextInt();

                    System.out.print("Enter End Index: ");
                    int e2 = sc.nextInt();

                    flightService.findTotalFareInRange(s2, e2);
                    break;

                case 6:
                    System.out.print("Enter Flight Index: ");
                    int index2 = sc.nextInt();

                    System.out.print("Enter New Fare: ");
                    double newFare2 = sc.nextDouble();

                    flightService.updateFareUsingFenwick(index2, newFare2);
                    break;

                case 7:
                    break;

                default:
                    System.out.println("Invalid choice.");
            }

        } while(choice != 7);
    }
    
 // =========================
 // SORTING ALGORITHMS
 // =========================

    public static void sortingMenu() {
        int choice;

        do {
            System.out.println("\n===== SORTING ALGORITHMS =====");
            System.out.println("1. Sort Fares Using Merge Sort");
            System.out.println("2. Sort Fares Using Quick Sort");
            System.out.println("3. Sort Fares Using Heap Sort");
            System.out.println("4. Back");
            System.out.print("Enter your choice: ");
            choice = sc.nextInt();

            switch(choice) {
                case 1:
                    flightService.sortFaresUsingMergeSort();
                    break;

                case 2:
                    flightService.sortFaresUsingQuickSort();
                    break;

                case 3:
                    flightService.sortFaresUsingHeapSort();
                    break;

                case 4:
                    break;

                default:
                    System.out.println("Invalid choice.");
            }

        } while(choice != 4);
    }
    
 // =========================
 // GRAPH ALGORITHMS
 // =========================
    
    public static void graphMenu() {
        int choice;
        do {
            System.out.println("\n===== GRAPH ALGORITHMS =====");
            System.out.println("1. Add Route");
            System.out.println("2. View Routes");
            System.out.println("3. BFS Traversal");
            System.out.println("4. DFS Traversal");
            System.out.println("5. Prim's MST");
            System.out.println("6. Kruskal's MST");
            System.out.println("7. Dijkstra Shortest Path");
            System.out.println("8. Bellman-Ford Shortest Path");
            System.out.println("9. Floyd-Warshall");
            System.out.println("10. Back");
            System.out.print("Enter your choice: ");
            choice = sc.nextInt();

            switch(choice) {
                case 1:
                    sc.nextLine();
                    System.out.print("Enter Source City: ");
                    String source = sc.nextLine();
                    System.out.print("Enter Destination City: ");
                    String destination = sc.nextLine();
                    System.out.print("Enter Distance/Fare: ");
                    int weight = sc.nextInt();
                    graphService.addRoute(source, destination, weight);
                    break;

                case 2:
                    graphService.viewRoutes();
                    break;

                case 3:
                    sc.nextLine();
                    System.out.print("Enter Starting City: ");
                    graphService.bfs(sc.nextLine());
                    break;

                case 4:
                    sc.nextLine();
                    System.out.print("Enter Starting City: ");
                    graphService.dfs(sc.nextLine());
                    break;

                case 5:
                    sc.nextLine();
                    System.out.print("Enter Starting City: ");
                    graphService.primMST(sc.nextLine());
                    break;

                case 6:
                    graphService.kruskalMST();
                    break;

                case 7:
                    sc.nextLine();
                    System.out.print("Enter Starting City: ");
                    graphService.dijkstra(sc.nextLine());
                    break;

                case 8:
                    sc.nextLine();
                    System.out.print("Enter Starting City: ");
                    graphService.bellmanFord(sc.nextLine());
                    break;

                case 9:
                    graphService.floydWarshall();
                    break;

                case 10:
                    break;

                default:
                    System.out.println("Invalid choice.");
            }
        } while(choice != 10);
    }
}