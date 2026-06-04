package tree;

import model.Passenger;

public class AVLNode {

    Passenger passenger;
    AVLNode left;
    AVLNode right;
    int height;

    public AVLNode(Passenger passenger) {
        this.passenger = passenger;
        left = null;
        right = null;
        height = 1;
    }
}