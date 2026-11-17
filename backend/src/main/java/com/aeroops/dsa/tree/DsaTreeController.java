package com.aeroops.dsa.tree;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/dsa/trees")
@CrossOrigin(origins = "*")
public class DsaTreeController {

    private final TreeService treeService;

    public DsaTreeController(TreeService treeService) {
        this.treeService = treeService;
    }

    @PostMapping("/bst")
    public ResponseEntity<TreeOperationResult> runBst(@RequestBody(required = false) TreeRequest req) {
        return ResponseEntity.ok(treeService.runBst(req));
    }

    @PostMapping("/avl")
    public ResponseEntity<TreeOperationResult> runAvl(@RequestBody(required = false) TreeRequest req) {
        return ResponseEntity.ok(treeService.runAvl(req));
    }

    @PostMapping("/btree")
    public ResponseEntity<TreeOperationResult> runBTree(@RequestBody(required = false) TreeRequest req) {
        return ResponseEntity.ok(treeService.runBTree(req));
    }

    @PostMapping("/bplus")
    public ResponseEntity<TreeOperationResult> runBPlus(@RequestBody(required = false) TreeRequest req) {
        return ResponseEntity.ok(treeService.runBPlusTree(req));
    }

    @PostMapping("/bplus/range")
    public ResponseEntity<TreeRangeResult> runBPlusRange(@RequestBody(required = false) TreeRequest req) {
        return ResponseEntity.ok(treeService.runBPlusRange(req));
    }
}
