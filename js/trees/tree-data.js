/**
 * AEROOPS: Tree Indexing Data Architecture & Datasets (Stage 4)
 *
 * Provides seed datasets and test vectors mirroring Java model.Passenger IDs
 * used in tree.BST, tree.AVLTree, tree.BTree, and tree.BPlusTree.
 */

(function (window) {
  'use strict';

  // Authentic passenger ID keys representing real database indexing sequences
  const DATASETS = {
    standard: [105, 102, 108, 101, 104, 107, 109],
    avlLL: [105, 103, 101], // Triggers Right Rotation (LL)
    avlRR: [101, 103, 105], // Triggers Left Rotation (RR)
    avlLR: [105, 101, 103], // Triggers Left-Right Double Rotation (LR)
    avlRL: [101, 105, 103], // Triggers Right-Left Double Rotation (RL)
    bTreeSplit: [10, 20, 30, 40, 50, 60, 70, 80, 90] // Triggers node splitting in degree t=3
  };

  const TreeData = {
    getDataset: function (name) {
      return (DATASETS[name] || DATASETS.standard).slice();
    },

    /**
     * Extracts passenger IDs from Stage 2 AeroDataStore if present
     */
    getPassengerIds: function () {
      if (window.AeroDataStore) {
        const passengers = window.AeroDataStore.getPassengers();
        if (passengers && passengers.length > 0) {
          return passengers.map(p => p.passengerId);
        }
      }
      return this.getDataset('standard');
    }
  };

  window.AeroTreeData = TreeData;

})(window);
