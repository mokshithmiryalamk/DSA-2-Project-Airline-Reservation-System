package com.aeroops.dsa.tree;

import java.util.*;

public class BinarySearchTree {

    public static class Node {
        public int key;
        public Node left, right;

        public Node(int key) {
            this.key = key;
        }
    }

    private Node root;
    private int size = 0;

    public boolean insert(int key, List<TreeStep> steps) {
        if (root == null) {
            root = new Node(key);
            size++;
            if (steps != null) {
                steps.add(new TreeStep(steps.size() + 1, "insert_root", key, "Inserted " + key + " as BST root.", List.of(key)));
            }
            return true;
        }

        Node curr = root;
        List<Integer> path = new ArrayList<>();
        while (true) {
            path.add(curr.key);
            if (key == curr.key) {
                if (steps != null) {
                    steps.add(new TreeStep(steps.size() + 1, "duplicate_rejected", key, "Key " + key + " already exists in BST.", path));
                }
                return false;
            }
            if (key < curr.key) {
                if (curr.left == null) {
                    curr.left = new Node(key);
                    size++;
                    path.add(key);
                    if (steps != null) {
                        steps.add(new TreeStep(steps.size() + 1, "insert_left", key, "Inserted " + key + " to the left of " + curr.key + ".", path));
                    }
                    return true;
                }
                curr = curr.left;
            } else {
                if (curr.right == null) {
                    curr.right = new Node(key);
                    size++;
                    path.add(key);
                    if (steps != null) {
                        steps.add(new TreeStep(steps.size() + 1, "insert_right", key, "Inserted " + key + " to the right of " + curr.key + ".", path));
                    }
                    return true;
                }
                curr = curr.right;
            }
        }
    }

    public List<Integer> search(int key, List<TreeStep> steps) {
        List<Integer> path = new ArrayList<>();
        Node curr = root;
        while (curr != null) {
            path.add(curr.key);
            if (curr.key == key) {
                if (steps != null) {
                    steps.add(new TreeStep(steps.size() + 1, "search_found", key, "Found key " + key + " in BST.", path));
                }
                return path;
            }
            curr = key < curr.key ? curr.left : curr.right;
        }
        if (steps != null) {
            steps.add(new TreeStep(steps.size() + 1, "search_not_found", key, "Key " + key + " not found in BST.", path));
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

    private int getHeight(Node n) {
        if (n == null) return 0;
        return 1 + Math.max(getHeight(n.left), getHeight(n.right));
    }

    public int getSize() {
        return size;
    }

    public TreeNodeDto toDto() {
        return toDto(root);
    }

    private TreeNodeDto toDto(Node n) {
        if (n == null) return null;
        int h = getHeight(n);
        int bf = getHeight(n.left) - getHeight(n.right);
        return new TreeNodeDto(
            n.key, h, bf,
            toDto(n.left), toDto(n.right),
            null, null, n.left == null && n.right == null, null
        );
    }
}
