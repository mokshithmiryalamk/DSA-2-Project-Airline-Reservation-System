package com.aeroops.dsa.tree;

import java.util.*;

public class BTree {

    public static class Node {
        public int t; // Minimum degree
        public List<Integer> keys = new ArrayList<>();
        public List<Node> children = new ArrayList<>();
        public boolean isLeaf;

        public Node(int t, boolean isLeaf) {
            this.t = t;
            this.isLeaf = isLeaf;
        }
    }

    private final int t;
    private Node root;
    private int keyCount = 0;

    public BTree(int t) {
        this.t = t;
    }

    public boolean insert(int key, List<TreeStep> steps) {
        if (root == null) {
            root = new Node(t, true);
            root.keys.add(key);
            keyCount++;
            if (steps != null) {
                steps.add(new TreeStep(steps.size() + 1, "insert_root", key, "Inserted " + key + " into new B-Tree root.", List.of(key)));
            }
            return true;
        }

        if (contains(root, key)) {
            if (steps != null) {
                steps.add(new TreeStep(steps.size() + 1, "duplicate_rejected", key, "Duplicate key " + key + " rejected in B-Tree.", List.of(key)));
            }
            return false;
        }

        if (root.keys.size() == 2 * t - 1) {
            Node newRoot = new Node(t, false);
            newRoot.children.add(root);
            splitChild(newRoot, 0, root, steps);
            int idx = newRoot.keys.get(0) < key ? 1 : 0;
            insertNonFull(newRoot.children.get(idx), key, steps);
            root = newRoot;
        } else {
            insertNonFull(root, key, steps);
        }
        keyCount++;
        return true;
    }

    private void splitChild(Node parent, int childIdx, Node child, List<TreeStep> steps) {
        Node sibling = new Node(t, child.isLeaf);
        int medianIdx = t - 1;
        int medianKey = child.keys.get(medianIdx);

        for (int i = medianIdx + 1; i < child.keys.size(); i++) {
            sibling.keys.add(child.keys.get(i));
        }
        if (!child.isLeaf) {
            for (int i = t; i < child.children.size(); i++) {
                sibling.children.add(child.children.get(i));
            }
        }

        // Trim child
        while (child.keys.size() > medianIdx) {
            child.keys.remove(child.keys.size() - 1);
        }
        if (!child.isLeaf) {
            while (child.children.size() > t) {
                child.children.remove(child.children.size() - 1);
            }
        }

        parent.children.add(childIdx + 1, sibling);
        parent.keys.add(childIdx, medianKey);

        if (steps != null) {
            steps.add(new TreeStep(
                steps.size() + 1, "split_node", medianKey,
                "B-Tree split full node. Promoted median key " + medianKey + " to parent.",
                List.of(medianKey)
            ));
        }
    }

    private void insertNonFull(Node node, int key, List<TreeStep> steps) {
        int i = node.keys.size() - 1;
        if (node.isLeaf) {
            node.keys.add(0);
            while (i >= 0 && node.keys.get(i) > key) {
                node.keys.set(i + 1, node.keys.get(i));
                i--;
            }
            node.keys.set(i + 1, key);
            if (steps != null) {
                steps.add(new TreeStep(steps.size() + 1, "insert_key", key, "Inserted key " + key + " into B-Tree leaf.", List.of(key)));
            }
        } else {
            while (i >= 0 && node.keys.get(i) > key) {
                i--;
            }
            i++;
            if (node.children.get(i).keys.size() == 2 * t - 1) {
                splitChild(node, i, node.children.get(i), steps);
                if (node.keys.get(i) < key) {
                    i++;
                }
            }
            insertNonFull(node.children.get(i), key, steps);
        }
    }

    private boolean contains(Node node, int key) {
        int i = 0;
        while (i < node.keys.size() && key > node.keys.get(i)) {
            i++;
        }
        if (i < node.keys.size() && node.keys.get(i) == key) {
            return true;
        }
        if (node.isLeaf) {
            return false;
        }
        return contains(node.children.get(i), key);
    }

    public List<Integer> search(int key, List<TreeStep> steps) {
        List<Integer> path = new ArrayList<>();
        boolean found = searchHelper(root, key, path);
        if (steps != null) {
            steps.add(new TreeStep(
                steps.size() + 1, found ? "search_found" : "search_not_found",
                key, found ? "Found key " + key + " in B-Tree." : "Key " + key + " not found in B-Tree.",
                path
            ));
        }
        return path;
    }

    private boolean searchHelper(Node node, int key, List<Integer> path) {
        if (node == null) return false;
        int i = 0;
        while (i < node.keys.size() && key > node.keys.get(i)) {
            i++;
        }
        if (i < node.keys.size() && node.keys.get(i) == key) {
            path.add(node.keys.get(i));
            return true;
        }
        if (node.isLeaf) {
            if (!node.keys.isEmpty()) {
                path.add(node.keys.get(Math.min(i, node.keys.size() - 1)));
            }
            return false;
        }
        path.add(node.keys.get(Math.min(i, node.keys.size() - 1)));
        return searchHelper(node.children.get(i), key, path);
    }

    public List<Integer> inorder() {
        List<Integer> res = new ArrayList<>();
        inorderHelper(root, res);
        return res;
    }

    private void inorderHelper(Node node, List<Integer> res) {
        if (node == null) return;
        int i;
        for (i = 0; i < node.keys.size(); i++) {
            if (!node.isLeaf) {
                inorderHelper(node.children.get(i), res);
            }
            res.add(node.keys.get(i));
        }
        if (!node.isLeaf) {
            inorderHelper(node.children.get(i), res);
        }
    }

    public int getHeight() {
        return getHeight(root);
    }

    private int getHeight(Node node) {
        if (node == null) return 0;
        if (node.isLeaf) return 1;
        return 1 + getHeight(node.children.get(0));
    }

    public int getKeyCount() {
        return keyCount;
    }

    public TreeNodeDto toDto() {
        return toDto(root);
    }

    private TreeNodeDto toDto(Node node) {
        if (node == null) return null;
        List<TreeNodeDto> childDtos = new ArrayList<>();
        for (Node c : node.children) {
            childDtos.add(toDto(c));
        }
        return new TreeNodeDto(
            null, getHeight(node), null,
            null, null,
            new ArrayList<>(node.keys), childDtos,
            node.isLeaf, null
        );
    }
}
