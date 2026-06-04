package tree;

public class BTree {

    BTreeNode root;
    int degree;

    public BTree(int degree) {
        this.degree = degree;
        root = null;
    }
    
    public BTreeNode search(BTreeNode node, int key) {

        int i = 0;

        while(i < node.keyCount && key > node.keys[i]) {
            i++;
        }

        if(i < node.keyCount && node.keys[i] == key) {
            return node;
        }

        if(node.leaf) {
            return null;
        }

        return search(node.children[i], key);
    }
    
    public BTreeNode search(int key) {

        if(root == null) {
            return null;
        }

        return search(root, key);
    }
    
    public void insert(int key) {

        if(root == null) {
            root = new BTreeNode(degree, true);
            root.keys[0] = key;
            root.keyCount = 1;
        }
        else {
            if(root.keyCount == 2 * degree - 1) {

                BTreeNode newRoot = new BTreeNode(degree, false);
                newRoot.children[0] = root;

                splitChild(newRoot, 0, root);

                int i = 0;

                if(newRoot.keys[0] < key) {
                    i++;
                }

                insertNonFull(newRoot.children[i], key);
                root = newRoot;
            }
            else {
                insertNonFull(root, key);
            }
        }
    }
    
    private void insertNonFull(BTreeNode node, int key) {

        int i = node.keyCount - 1;

        if(node.leaf) {

            while(i >= 0 && node.keys[i] > key) {
                node.keys[i + 1] = node.keys[i];
                i--;
            }

            node.keys[i + 1] = key;
            node.keyCount++;
        }
        else {

            while(i >= 0 && node.keys[i] > key) {
                i--;
            }

            i++;

            if(node.children[i].keyCount == 2 * degree - 1) {

                splitChild(node, i, node.children[i]);

                if(node.keys[i] < key) {
                    i++;
                }
            }

            insertNonFull(node.children[i], key);
        }
    }
    
    private void splitChild(BTreeNode parent, int index, BTreeNode fullChild) {

        BTreeNode newChild = new BTreeNode(degree, fullChild.leaf);
        newChild.keyCount = degree - 1;

        for(int j = 0; j < degree - 1; j++) {
            newChild.keys[j] = fullChild.keys[j + degree];
        }

        if(!fullChild.leaf) {
            for(int j = 0; j < degree; j++) {
                newChild.children[j] = fullChild.children[j + degree];
            }
        }

        fullChild.keyCount = degree - 1;

        for(int j = parent.keyCount; j >= index + 1; j--) {
            parent.children[j + 1] = parent.children[j];
        }

        parent.children[index + 1] = newChild;

        for(int j = parent.keyCount - 1; j >= index; j--) {
            parent.keys[j + 1] = parent.keys[j];
        }

        parent.keys[index] = fullChild.keys[degree - 1];
        parent.keyCount++;
    }
    
    public void traverse() {
        if(root != null) {
            traverseNode(root);
        }
        else {
            System.out.println("B-Tree is empty.");
        }
    }

    private void traverseNode(BTreeNode node) {

        int i;

        for(i = 0; i < node.keyCount; i++) {

            if(!node.leaf) {
                traverseNode(node.children[i]);
            }

            System.out.print(node.keys[i] + " ");
        }

        if(!node.leaf) {
            traverseNode(node.children[i]);
        }
    }
}