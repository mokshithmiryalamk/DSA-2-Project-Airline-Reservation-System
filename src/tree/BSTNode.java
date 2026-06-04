package tree;

import model.Passenger;

public class BSTNode {

    Passenger passenger;
    BSTNode left;
    BSTNode right;

    public BSTNode(Passenger passenger) {
        this.passenger = passenger;
        left = null;
        right = null;
    }
}