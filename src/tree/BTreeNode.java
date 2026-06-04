package tree;

public class BTreeNode {

    int keys[];
    int degree;
    BTreeNode children[];
    int keyCount;
    boolean leaf;

    public BTreeNode(int degree, boolean leaf) {
        this.degree = degree;
        this.leaf = leaf;

        keys = new int[2 * degree - 1];
        children = new BTreeNode[2 * degree];

        keyCount = 0;
    }
}