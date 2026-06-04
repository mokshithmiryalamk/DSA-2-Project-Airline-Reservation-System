package service;

import java.util.ArrayList;
import model.Passenger;
import tree.BST;
import tree.AVLTree;
import tree.BTree;
import tree.BPlusTree;

public class PassengerService {

	private ArrayList<Passenger> passengers = new ArrayList<>();
	private BST passengerBST = new BST();
	private AVLTree passengerAVL = new AVLTree();
	private BTree passengerBTree = new BTree(3);
	private BPlusTree passengerBPlusTree = new BPlusTree(3);

	public void addPassenger(Passenger passenger) {
	    passengers.add(passenger);
	    passengerBST.insert(passenger);
	    passengerAVL.insert(passenger);
	    passengerBTree.insert(passenger.getPassengerId());
	    passengerBPlusTree.insert(passenger.getPassengerId());
	    System.out.println("Passenger added successfully.");
	}

    public void viewPassengers() {
        if (passengers.isEmpty()) {
            System.out.println("No passengers found.");
            return;
        }

        for (int i = 0; i < passengers.size(); i++) {
            passengers.get(i).displayPassenger();
            System.out.println("-------------------");
        }
    }
    
    public void viewPassengersUsingAVL() {
        passengerAVL.inorder();
    }

    public Passenger searchPassenger(int passengerId) {
        for (int i = 0; i < passengers.size(); i++) {
            if (passengers.get(i).getPassengerId() == passengerId) {
                return passengers.get(i);
            }
        }
        return null;
    }
    
    public Passenger searchPassengerUsingAVL(int passengerId) {
        return passengerAVL.search(passengerId);
    }
    
    public void deletePassenger(int passengerId) {
        for(int i = 0; i < passengers.size(); i++) {
            if(passengers.get(i).getPassengerId() == passengerId) {
                passengers.remove(i);
                System.out.println("Passenger deleted successfully.");
                return;
            }
        }
        System.out.println("Passenger not found.");
    }
    
    public void viewPassengersUsingBST() {
        passengerBST.inorder();
    }
    
    public Passenger searchPassengerUsingBST(int passengerId) {
        return passengerBST.search(passengerId);
    }
    
    public void viewPassengersUsingBTree() {

        passengerBTree.traverse();
        System.out.println();
    }
    
    public boolean searchPassengerUsingBTree(int passengerId) {

        return passengerBTree.search(passengerId) != null;
    }
    
    public void viewPassengersUsingBPlusTree() {
        passengerBPlusTree.display();
    }

    public boolean searchPassengerUsingBPlusTree(int passengerId) {
        return passengerBPlusTree.search(passengerId);
    }
}