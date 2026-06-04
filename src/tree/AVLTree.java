package tree;

import model.Passenger;

public class AVLTree {

    AVLNode root;

    public AVLTree() {
        root = null;
    }

    int height(AVLNode node) {
        if(node == null) {
            return 0;
        }
        return node.height;
    }

    int getBalance(AVLNode node) {
        if(node == null) {
            return 0;
        }
        return height(node.left) - height(node.right);
    }
    
    AVLNode rightRotate(AVLNode y) {

        AVLNode x = y.left;
        AVLNode temp = x.right;

        x.right = y;
        y.left = temp;

        y.height = Math.max(height(y.left), height(y.right)) + 1;
        x.height = Math.max(height(x.left), height(x.right)) + 1;

        return x;
    }

    AVLNode leftRotate(AVLNode x) {

        AVLNode y = x.right;
        AVLNode temp = y.left;

        y.left = x;
        x.right = temp;

        x.height = Math.max(height(x.left), height(x.right)) + 1;
        y.height = Math.max(height(y.left), height(y.right)) + 1;

        return y;
    }
    
    public void insert(Passenger passenger) {
        root = insertRec(root, passenger);
    }

    private AVLNode insertRec(AVLNode node, Passenger passenger) {

        if(node == null) {
            return new AVLNode(passenger);
        }

        if(passenger.getPassengerId() < node.passenger.getPassengerId()) {
            node.left = insertRec(node.left, passenger);
        }
        else if(passenger.getPassengerId() > node.passenger.getPassengerId()) {
            node.right = insertRec(node.right, passenger);
        }
        else {
            return node;
        }

        node.height = 1 + Math.max(height(node.left), height(node.right));

        int balance = getBalance(node);

        if(balance > 1 && passenger.getPassengerId() < node.left.passenger.getPassengerId()) {
            return rightRotate(node);
        }

        if(balance < -1 && passenger.getPassengerId() > node.right.passenger.getPassengerId()) {
            return leftRotate(node);
        }

        if(balance > 1 && passenger.getPassengerId() > node.left.passenger.getPassengerId()) {
            node.left = leftRotate(node.left);
            return rightRotate(node);
        }

        if(balance < -1 && passenger.getPassengerId() < node.right.passenger.getPassengerId()) {
            node.right = rightRotate(node.right);
            return leftRotate(node);
        }

        return node;
    }
    
    public Passenger search(int passengerId) {

        AVLNode current = root;

        while(current != null) {

            if(passengerId == current.passenger.getPassengerId()) {
                return current.passenger;
            }

            if(passengerId < current.passenger.getPassengerId()) {
                current = current.left;
            }
            else {
                current = current.right;
            }
        }

        return null;
    }
    
    public void inorder() {
        inorderRec(root);
    }

    private void inorderRec(AVLNode node) {

        if(node != null) {

            inorderRec(node.left);

            node.passenger.displayPassenger();
            System.out.println("-------------------");

            inorderRec(node.right);
        }
    }
}