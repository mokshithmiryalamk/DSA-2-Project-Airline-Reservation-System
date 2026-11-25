package com.aeroops.dsa.tree;

import com.aeroops.entity.Passenger;
import com.aeroops.repository.PassengerRepository;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class TreeService {

    private final PassengerRepository passengerRepository;

    public static final List<Integer> DEFAULT_BST_KEYS = List.of(105, 102, 107, 101, 104, 106, 109);
    public static final List<Integer> DEFAULT_AVL_KEYS = List.of(101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111);
    public static final List<Integer> DEFAULT_BTREE_KEYS = List.of(10, 20, 30, 40, 50, 60);
    public static final List<Integer> DEFAULT_BPLUS_KEYS = List.of(10, 20, 30, 40, 50, 60, 70, 80);

    public TreeService(PassengerRepository passengerRepository) {
        this.passengerRepository = passengerRepository;
    }

    public List<Integer> getPassengerKeys() {
        return passengerRepository.findAll().stream()
            .map(p -> p.getPassengerId().intValue())
            .sorted()
            .toList();
    }

    public TreeOperationResult runBst(TreeRequest req) {
        List<TreeStep> steps = new ArrayList<>();
        BinarySearchTree bst = new BinarySearchTree();

        List<Integer> keys = resolveKeys(req, DEFAULT_BST_KEYS);
        for (int k : keys) {
            bst.insert(k, steps);
        }

        if (req != null && req.insertKey() != null) {
            bst.insert(req.insertKey(), steps);
        }

        List<Integer> searchPath = List.of();
        Boolean found = null;
        if (req != null && req.searchKey() != null) {
            searchPath = bst.search(req.searchKey(), steps);
            found = !searchPath.isEmpty() && searchPath.get(searchPath.size() - 1).equals(req.searchKey());
        }

        Map<String, List<Integer>> traversals = Map.of(
            "inorder", bst.inorder(),
            "preorder", bst.preorder(),
            "postorder", bst.postorder(),
            "levelorder", bst.levelorder()
        );

        return new TreeOperationResult(
            "BST", bst.getSize(), bst.getHeight(),
            bst.toDto(), traversals, searchPath, found, "None", steps
        );
    }

    public TreeOperationResult runAvl(TreeRequest req) {
        List<TreeStep> steps = new ArrayList<>();
        AvlTree avl = new AvlTree();

        List<Integer> keys = resolveKeys(req, DEFAULT_AVL_KEYS);
        for (int k : keys) {
            avl.insert(k, steps);
        }

        if (req != null && req.insertKey() != null) {
            avl.insert(req.insertKey(), steps);
        }

        List<Integer> searchPath = List.of();
        Boolean found = null;
        if (req != null && req.searchKey() != null) {
            searchPath = avl.search(req.searchKey(), steps);
            found = !searchPath.isEmpty() && searchPath.get(searchPath.size() - 1).equals(req.searchKey());
        }

        Map<String, List<Integer>> traversals = Map.of(
            "inorder", avl.inorder(),
            "preorder", avl.preorder(),
            "postorder", avl.postorder(),
            "levelorder", avl.levelorder()
        );

        return new TreeOperationResult(
            "AVL", avl.getSize(), avl.getHeight(),
            avl.toDto(), traversals, searchPath, found, avl.getLastRotation(), steps
        );
    }

    public TreeOperationResult runBTree(TreeRequest req) {
        List<TreeStep> steps = new ArrayList<>();
        BTree bTree = new BTree(3);

        List<Integer> keys = resolveKeys(req, DEFAULT_BTREE_KEYS);
        for (int k : keys) {
            bTree.insert(k, steps);
        }

        if (req != null && req.insertKey() != null) {
            bTree.insert(req.insertKey(), steps);
        }

        List<Integer> searchPath = List.of();
        Boolean found = null;
        if (req != null && req.searchKey() != null) {
            searchPath = bTree.search(req.searchKey(), steps);
            found = bTree.contains(req.searchKey());
        }

        Map<String, List<Integer>> traversals = Map.of(
            "inorder", bTree.inorder()
        );

        return new TreeOperationResult(
            "B-Tree", bTree.getKeyCount(), bTree.getHeight(),
            bTree.toDto(), traversals, searchPath, found, "None", steps
        );
    }

    public TreeOperationResult runBPlusTree(TreeRequest req) {
        List<TreeStep> steps = new ArrayList<>();
        BPlusTree bPlus = new BPlusTree(3);

        List<Integer> keys = resolveKeys(req, DEFAULT_BPLUS_KEYS);
        for (int k : keys) {
            bPlus.insert(k, steps);
        }

        if (req != null && req.insertKey() != null) {
            bPlus.insert(req.insertKey(), steps);
        }

        List<Integer> searchPath = List.of();
        Boolean found = null;
        if (req != null && req.searchKey() != null) {
            searchPath = bPlus.search(req.searchKey(), steps);
            found = bPlus.contains(req.searchKey());
        }

        Map<String, List<Integer>> traversals = Map.of(
            "sequentialLeaves", bPlus.getSequentialLeafKeys()
        );

        return new TreeOperationResult(
            "B+ Tree", bPlus.getSequentialLeafKeys().size(), bPlus.getHeight(),
            bPlus.toDto(), traversals, searchPath, found, "None", steps
        );
    }

    public TreeRangeResult runBPlusRange(TreeRequest req) {
        List<TreeStep> steps = new ArrayList<>();
        BPlusTree bPlus = new BPlusTree(3);

        List<Integer> keys = resolveKeys(req, DEFAULT_BPLUS_KEYS);
        for (int k : keys) {
            bPlus.insert(k, steps);
        }

        int low = req != null && req.rangeLow() != null ? req.rangeLow() : 25;
        int high = req != null && req.rangeHigh() != null ? req.rangeHigh() : 65;
        if (low > high) {
            throw new IllegalArgumentException("Range lower bound (" + low + ") cannot exceed upper bound (" + high + ").");
        }

        List<Integer> matched = bPlus.rangeQuery(low, high, steps);
        List<Integer> seq = bPlus.getSequentialLeafKeys();

        return new TreeRangeResult("B+ Tree", low, high, matched, seq, steps);
    }

    private List<Integer> resolveKeys(TreeRequest req, List<Integer> defaultKeys) {
        if (req != null && Boolean.TRUE.equals(req.syncWithPassengers())) {
            List<Integer> pKeys = getPassengerKeys();
            if (!pKeys.isEmpty()) {
                return pKeys.size() > 64 ? pKeys.subList(0, 64) : pKeys;
            }
        }
        if (req != null && req.initialKeys() != null && !req.initialKeys().isEmpty()) {
            if (req.initialKeys().size() > 64) {
                throw new IllegalArgumentException("Maximum 64 keys allowed per tree visualization request.");
            }
            return req.initialKeys();
        }
        return defaultKeys;
    }
}
