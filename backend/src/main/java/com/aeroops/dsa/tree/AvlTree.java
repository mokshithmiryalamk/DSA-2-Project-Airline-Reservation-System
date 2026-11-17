package com.aeroops.dsa.tree;

import java.util.*;

public class AvlTree {

    public static class Node {
        public int key;
        public int height;
        public Node left, right;

        public Node(int key) {
            this.key = key;
            this.height = 1;
        }
    }

    private Node root;
    private int size = 0;
    private String lastRotation = "None";

    public boolean insert(int key, List<TreeStep> steps) {
        int initialSize = size;
        root = insertRecursive(root, key, steps);
        return size > initialSize;
    }

    private Node insertRecursive(Node node, int key, List<TreeStep> steps) {
        if (node == null) {
            size++;
            if (steps != null) {
                steps.add(new TreeStep(steps.size() + 1, "insert_leaf", key, "Inserted " + key + " into AVL tree.", List.of(key)));
            }
            return new Node(key);
        }

        if (key < node.key) {
            node.left = insertRecursive(node.left, key, steps);
        } else if (key > node.key) {
            node.right = insertRecursive(node.right, key, steps);
        } else {
            return node; // Duplicate rejected
        }

        node.height = 1 + Math.max(getHeight(node.left), getHeight(node.right));
        int balance = getBalance(node);

        // LL Case
        if (balance > 1 && key < node.left.key) {
            lastRotation = "LL (Right Rotation)";
            if (steps != null) {
                steps.add(new TreeStep(steps.size() + 1, "rotate_ll", node.key, "AVL LL Imbalance at " + node.key + ": Executed Right Rotation.", List.of(node.key)));
            }
            return rightRotate(node);
        }

        // RR Case
        if (balance < -1 && key > node.right.key) {
            lastRotation = "RR (Left Rotation)";
            if (steps != null) {
                steps.add(new TreeStep(steps.size() + 1, "rotate_rr", node.key, "AVL RR Imbalance at " + node.key + ": Executed Left Rotation.", List.of(node.key)));
            }
            return leftRotate(node);
        }

        // LR Case
        if (balance > 1 && key > node.left.key) {
            lastRotation = "LR (Left-Right Double Rotation)";
            if (steps != null) {
                steps.add(new TreeStep(steps.size() + 1, "rotate_lr", node.key, "AVL LR Imbalance at " + node.key + ": Executed Left-Right Double Rotation.", List.of(node.key)));
            }
            node.left = leftRotate(node.left);
            return rightRotate(node);
        }

        // RL Case
        if (balance < -1 && key < node.right.key) {
            lastRotation = "RL (Right-Left Double Rotation)";
            if (steps != null) {
                steps.add(new TreeStep(steps.size() + 1, "rotate_rl", node.key, "AVL RL Imbalance at " + node.key + ": Executed Right-Left Double Rotation.", List.of(node.key)));
            }
            node.right = rightRotate(node.right);
            return leftRotate(node);
        }

        return node;
    }

    private Node rightRotate(Node y) {
        Node x = y.left;
        Node T2 = x.right;
        x.right = y;
        y.left = T2;
        y.height = Math.max(getHeight(y.left), getHeight(y.right)) + 1;
        x.height = Math.max(getHeight(x.left), getHeight(x.right)) + 1;
        return x;
    }

    private Node leftRotate(Node x) {
        Node y = x.right;
        Node T2 = y.left;
        y.left = x;
        x.right = T2;
        x.height = Math.max(getHeight(x.left), getHeight(x.right)) + 1;
        y.height = Math.max(getHeight(y.left), getHeight(y.right)) + 1;
        return y;
    }

    private int getHeight(Node n) {
        return n == null ? 0 : n.height;
    }

    private int getBalance(Node n) {
        return n == null ? 0 : getHeight(n.left) - getHeight(n.right);
    }

    public List<Integer> search(int key, List<TreeStep> steps) {
        List<Integer> path = new ArrayList<>();
        Node curr = root;
        while (curr != null) {
            path.add(curr.key);
            if (curr.key == key) {
                if (steps != null) {
                    steps.add(new TreeStep(steps.size() + 1, "search_found", key, "Found key " + key + " in AVL tree.", path));
                }
                return path;
            }
            curr = key < curr.key ? curr.left : curr.right;
        }
        if (steps != null) {
            steps.add(new TreeStep(steps.size() + 1, "search_not_found", key, "Key " + key + " not found in AVL tree.", path));
        }
        return path;
    }

    public List<Integer> inorder() {
        List<Integer> res = new ArrayList<>();
        inorderHelper(root, res);
        return res;
    }

    private void inorderHelper(Node n, List<Integer> res) {
        if (n == null) return;
        inorderHelper(n.left, res);
        res.add(n.key);
        inorderHelper(n.right, res);
    }

    public List<Integer> preorder() {
        List<Integer> res = new ArrayList<>();
        preorderHelper(root, res);
        return res;
    }

    private void preorderHelper(Node n, List<Integer> res) {
        if (n == null) return;
        res.add(n.key);
        preorderHelper(n.left, res);
        preorderHelper(n.right, res);
    }

    public List<Integer> postorder() {
        List<Integer> res = new ArrayList<>();
        postorderHelper(root, res);
        return res;
    }

    private void postorderHelper(Node n, List<Integer> res) {
        if (n == null) return;
        postorderHelper(n.left, res);
        postorderHelper(n.right, res);
        res.add(n.key);
    }

    public List<Integer> levelorder() {
        List<Integer> res = new ArrayList<>();
        if (root == null) return res;
        Queue<Node> q = new ArrayDeque<>();
        q.add(root);
        while (!q.isEmpty()) {
            Node curr = q.poll();
            res.add(curr.key);
            if (curr.left != null) q.add(curr.left);
            if (curr.right != null) q.add(curr.right);
        }
        return res;
    }

    public int getHeight() {
        return getHeight(root);
    }

    public int getSize() {
        return size;
    }

    public String getLastRotation() {
        return lastRotation;
    }

    public TreeNodeDto toDto() {
        return toDto(root);
    }

    private TreeNodeDto toDto(Node n) {
        if (n == null) return null;
        return new TreeNodeDto(
            n.key, n.height, getBalance(n),
            toDto(n.left), toDto(n.right),
            null, null, n.left == null && n.right == null, null
        );
    }
}
