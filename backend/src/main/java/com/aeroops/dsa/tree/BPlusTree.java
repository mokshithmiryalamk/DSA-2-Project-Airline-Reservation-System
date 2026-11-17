package com.aeroops.dsa.tree;

import java.util.*;

public class BPlusTree {

    public static class Node {
        public int degree;
        public boolean isLeaf;
        public List<Integer> keys = new ArrayList<>();
        public List<Node> children = new ArrayList<>();
        public Node next; // Sequential horizontal link for leaf nodes

        public Node(int degree, boolean isLeaf) {
            this.degree = degree;
            this.isLeaf = isLeaf;
        }
    }

    private final int degree;
    private Node root;

    public BPlusTree(int degree) {
        this.degree = degree;
    }

    public boolean insert(int key, List<TreeStep> steps) {
        int maxKeys = 2 * degree - 1;

        if (root == null) {
            root = new Node(degree, true);
            root.keys.add(key);
            if (steps != null) {
                steps.add(new TreeStep(steps.size() + 1, "init_root", key, "Initialized B+ Tree root leaf with key [" + key + "].", List.of(key)));
            }
            return true;
        }

        if (root.keys.size() == maxKeys) {
            Node oldRoot = root;
            Node newRoot = new Node(degree, false);
            newRoot.children.add(oldRoot);

            if (steps != null) {
                steps.add(new TreeStep(steps.size() + 1, "root_full", key, "B+ Tree root full. Created new internal router root.", new ArrayList<>(oldRoot.keys)));
            }

            splitChild(newRoot, 0, oldRoot, steps);

            int i = 0;
            if (newRoot.keys.get(0) <= key) {
                i++;
            }
            insertNonFull(newRoot.children.get(i), key, steps);
            root = newRoot;
        } else {
            insertNonFull(root, key, steps);
        }
        return true;
    }

    private void insertNonFull(Node node, int key, List<TreeStep> steps) {
        int maxKeys = 2 * degree - 1;

        if (node.isLeaf) {
            if (node.keys.contains(key)) {
                if (steps != null) {
                    steps.add(new TreeStep(steps.size() + 1, "duplicate_rejected", key, "Duplicate key " + key + " ignored in B+ Tree.", List.of(key)));
                }
                return;
            }

            int i = node.keys.size() - 1;
            node.keys.add(0);
            while (i >= 0 && node.keys.get(i) > key) {
                node.keys.set(i + 1, node.keys.get(i));
                i--;
            }
            node.keys.set(i + 1, key);

            if (steps != null) {
                steps.add(new TreeStep(steps.size() + 1, "inserted_leaf", key, "Inserted key " + key + " into leaf node " + node.keys + ".", new ArrayList<>(node.keys)));
            }
        } else {
            int i = node.keys.size() - 1;
            while (i >= 0 && node.keys.get(i) > key) {
                i--;
            }
            i++;

            if (node.children.get(i).keys.size() == maxKeys) {
                splitChild(node, i, node.children.get(i), steps);
                if (node.keys.get(i) <= key) {
                    i++;
                }
            }
            insertNonFull(node.children.get(i), key, steps);
        }
    }

    private void splitChild(Node parent, int index, Node fullChild, List<TreeStep> steps) {
        Node newChild = new Node(degree, fullChild.isLeaf);

        if (fullChild.isLeaf) {
            int splitPoint = degree;
            for (int j = splitPoint - 1; j < fullChild.keys.size(); j++) {
                newChild.keys.add(fullChild.keys.get(j));
            }
            while (fullChild.keys.size() > splitPoint - 1) {
                fullChild.keys.remove(fullChild.keys.size() - 1);
            }

            // Link sequential leaf pointers
            newChild.next = fullChild.next;
            fullChild.next = newChild;

            int promotedKey = newChild.keys.get(0);
            parent.children.add(index + 1, newChild);
            parent.keys.add(index, promotedKey);

            if (steps != null) {
                steps.add(new TreeStep(
                    steps.size() + 1, "split_leaf", promotedKey,
                    "Split leaf node into [" + fullChild.keys + "] -> [" + newChild.keys + "]. Copied router key " + promotedKey + " to parent.",
                    List.of(promotedKey)
                ));
            }
        } else {
            int medianKey = fullChild.keys.get(degree - 1);

            for (int j = degree; j < fullChild.keys.size(); j++) {
                newChild.keys.add(fullChild.keys.get(j));
            }
            for (int j = degree; j < fullChild.children.size(); j++) {
                newChild.children.add(fullChild.children.get(j));
            }

            while (fullChild.keys.size() > degree - 1) {
                fullChild.keys.remove(fullChild.keys.size() - 1);
            }
            while (fullChild.children.size() > degree) {
                fullChild.children.remove(fullChild.children.size() - 1);
            }

            parent.children.add(index + 1, newChild);
            parent.keys.add(index, medianKey);

            if (steps != null) {
                steps.add(new TreeStep(
                    steps.size() + 1, "split_internal", medianKey,
                    "Split internal router node around median key " + medianKey + ".",
                    List.of(medianKey)
                ));
            }
        }
    }

    public List<Integer> search(int key, List<TreeStep> steps) {
        List<Integer> path = new ArrayList<>();
        Node curr = root;

        while (curr != null && !curr.isLeaf) {
            int i = 0;
            while (i < curr.keys.size() && key >= curr.keys.get(i)) {
                i++;
            }
            path.add(curr.keys.get(Math.min(i, curr.keys.size() - 1)));
            curr = curr.children.get(i);
        }

        boolean found = false;
        if (curr != null && curr.isLeaf) {
            found = curr.keys.contains(key);
            path.add(key);
        }

        if (steps != null) {
            steps.add(new TreeStep(
                steps.size() + 1, found ? "search_found" : "search_not_found",
                key, found ? "Located key " + key + " in B+ Tree leaf." : "Key " + key + " not found in B+ Tree leaf.",
                path
            ));
        }

        return path;
    }

    public List<Integer> getSequentialLeafKeys() {
        List<Integer> result = new ArrayList<>();
        Node curr = root;
        if (curr == null) return result;

        while (!curr.isLeaf) {
            curr = curr.children.get(0);
        }

        while (curr != null) {
            result.addAll(curr.keys);
            curr = curr.next;
        }
        return result;
    }

    public List<Integer> rangeQuery(int low, int high, List<TreeStep> steps) {
        List<Integer> matched = new ArrayList<>();
        Node curr = root;
        if (curr == null) return matched;

        while (!curr.isLeaf) {
            int i = 0;
            while (i < curr.keys.size() && low >= curr.keys.get(i)) {
                i++;
            }
            curr = curr.children.get(i);
        }

        boolean done = false;
        while (curr != null && !done) {
            for (int k : curr.keys) {
                if (k >= low && k <= high) {
                    matched.add(k);
                } else if (k > high) {
                    done = true;
                    break;
                }
            }
            curr = curr.next;
        }

        if (steps != null) {
            steps.add(new TreeStep(
                steps.size() + 1, "range_query", null,
                "Executed range scan [" + low + ", " + high + "] via sequential leaf pointers: matched " + matched.size() + " keys.",
                matched
            ));
        }
        return matched;
    }

    public int getHeight() {
        return getHeight(root);
    }

    private int getHeight(Node node) {
        if (node == null) return 0;
        if (node.isLeaf) return 1;
        return 1 + getHeight(node.children.get(0));
    }

    public int getLeafCount() {
        int count = 0;
        Node curr = root;
        if (curr == null) return 0;
        while (!curr.isLeaf) {
            curr = curr.children.get(0);
        }
        while (curr != null) {
            count++;
            curr = curr.next;
        }
        return count;
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
        Integer nextKey = (node.isLeaf && node.next != null && !node.next.keys.isEmpty())
            ? node.next.keys.get(0) : null;

        return new TreeNodeDto(
            null, getHeight(node), null,
            null, null,
            new ArrayList<>(node.keys), childDtos,
            node.isLeaf, nextKey
        );
    }
}
