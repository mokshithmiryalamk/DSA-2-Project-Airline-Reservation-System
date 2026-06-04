package tree;

public class BPlusTreeNode {

    int keys[];
    BPlusTreeNode children[];
    int keyCount;
    boolean leaf;
    BPlusTreeNode next;

    public BPlusTreeNode(int degree, boolean leaf) {
        this.leaf = leaf;

        keys = new int[2 * degree - 1];
        children = new BPlusTreeNode[2 * degree];

        keyCount = 0;
        next = null;
    }
}