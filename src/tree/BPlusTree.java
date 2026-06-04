package tree;

public class BPlusTree {

    BPlusTreeNode root;
    int degree;

    public BPlusTree(int degree) {
        this.degree = degree;
        root = null;
    }
    
    public void insert(int key) {
        if(root == null) {
            root = new BPlusTreeNode(degree, true);
            root.keys[0] = key;
            root.keyCount = 1;
        }
        else {
            insertSimple(root, key);
        }
    }

    private void insertSimple(BPlusTreeNode node, int key) {
        int i = node.keyCount - 1;

        while(i >= 0 && node.keys[i] > key) {
            node.keys[i + 1] = node.keys[i];
            i--;
        }

        node.keys[i + 1] = key;
        node.keyCount++;
    }
    
    public boolean search(int key) {
        BPlusTreeNode current = root;

        while(current != null) {
            for(int i = 0; i < current.keyCount; i++) {
                if(current.keys[i] == key) {
                    return true;
                }
            }
            current = current.next;
        }

        return false;
    }
    
    public void display() {
        BPlusTreeNode current = root;

        while(current != null) {
            for(int i = 0; i < current.keyCount; i++) {
                System.out.print(current.keys[i] + " ");
            }
            current = current.next;
        }

        System.out.println();
    }
}