package tree;

import model.Passenger;

public class BST {

    BSTNode root;

    public BST() {
        root = null;
    }

    // INSERT
    public void insert(Passenger passenger) {
        root = insertRec(root, passenger);
    }

    private BSTNode insertRec(BSTNode root, Passenger passenger) {

        if (root == null) {
            return new BSTNode(passenger);
        }

        if (passenger.getPassengerId() < root.passenger.getPassengerId()) {
            root.left = insertRec(root.left, passenger);
        }
        else if (passenger.getPassengerId() > root.passenger.getPassengerId()) {
            root.right = insertRec(root.right, passenger);
        }

        return root;
    }

    // SEARCH
    public Passenger search(int passengerId) {

        BSTNode current = root;

        while (current != null) {

            if (passengerId == current.passenger.getPassengerId()) {
                return current.passenger;
            }

            if (passengerId < current.passenger.getPassengerId()) {
                current = current.left;
            }
            else {
                current = current.right;
            }
        }

        return null;
    }

    // INORDER DISPLAY
    public void inorder() {
        inorderRec(root);
    }

    private void inorderRec(BSTNode root) {

        if (root != null) {

            inorderRec(root.left);

            root.passenger.displayPassenger();
            System.out.println("-------------------");

            inorderRec(root.right);
        }
    }
}