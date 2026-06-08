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
        if(searchPassenger(passenger.getPassengerId()) != null) {
            System.out.println("Passenger ID already exists.");
            return;
        }

        passengers.add(passenger);
        passengerBST.insert(passenger);
        passengerAVL.insert(passenger);
        passengerBTree.insert(passenger.getPassengerId());
        passengerBPlusTree.insert(passenger.getPassengerId());

        System.out.println("Passenger added successfully.");
    }

    public void viewPassengers() {
        if(passengers.isEmpty()) {
            System.out.println("No passengers found.");
            return;
        }

        for(Passenger passenger : passengers) {
            passenger.displayPassenger();
            System.out.println("-------------------");
        }
    }

    public Passenger searchPassenger(int passengerId) {
        for(Passenger passenger : passengers) {
            if(passenger.getPassengerId() == passengerId) {
                return passenger;
            }
        }
        return null;
    }

    public void deletePassenger(int passengerId) {
        for(int i = 0; i < passengers.size(); i++) {
            if(passengers.get(i).getPassengerId() == passengerId) {
                passengers.remove(i);
                rebuildTrees();
                System.out.println("Passenger deleted successfully.");
                return;
            }
        }
        System.out.println("Passenger not found.");
    }

    private void rebuildTrees() {
        passengerBST = new BST();
        passengerAVL = new AVLTree();
        passengerBTree = new BTree(3);
        passengerBPlusTree = new BPlusTree(3);

        for(Passenger passenger : passengers) {
            passengerBST.insert(passenger);
            passengerAVL.insert(passenger);
            passengerBTree.insert(passenger.getPassengerId());
            passengerBPlusTree.insert(passenger.getPassengerId());
        }
    }

    public void viewPassengersUsingBST() {
        passengerBST.inorder();
    }

    public Passenger searchPassengerUsingBST(int passengerId) {
        return passengerBST.search(passengerId);
    }

    public void viewPassengersUsingAVL() {
        passengerAVL.inorder();
    }

    public Passenger searchPassengerUsingAVL(int passengerId) {
        return passengerAVL.search(passengerId);
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