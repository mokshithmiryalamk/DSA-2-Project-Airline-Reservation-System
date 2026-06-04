package tree;

public class SegmentTree {

    private double[] tree;
    private double[] fares;

    public SegmentTree(double[] fares) {
        this.fares = fares;
        tree = new double[4 * fares.length];
        buildTree(0, 0, fares.length - 1);
    }

    private void buildTree(int node, int start, int end) {
        if(start == end) {
            tree[node] = fares[start];
        }
        else {
            int mid = (start + end) / 2;

            buildTree(2 * node + 1, start, mid);
            buildTree(2 * node + 2, mid + 1, end);

            tree[node] = Math.min(tree[2 * node + 1], tree[2 * node + 2]);
        }
    }

    public double rangeMinimumQuery(int left, int right) {
        return query(0, 0, fares.length - 1, left, right);
    }

    private double query(int node, int start, int end, int left, int right) {
        if(right < start || end < left) {
            return Double.MAX_VALUE;
        }

        if(left <= start && end <= right) {
            return tree[node];
        }

        int mid = (start + end) / 2;

        double leftMin = query(2 * node + 1, start, mid, left, right);
        double rightMin = query(2 * node + 2, mid + 1, end, left, right);

        return Math.min(leftMin, rightMin);
    }

    public void updateFare(int index, double newFare) {
        update(0, 0, fares.length - 1, index, newFare);
    }

    private void update(int node, int start, int end, int index, double newFare) {
        if(start == end) {
            fares[index] = newFare;
            tree[node] = newFare;
        }
        else {
            int mid = (start + end) / 2;

            if(index <= mid) {
                update(2 * node + 1, start, mid, index, newFare);
            }
            else {
                update(2 * node + 2, mid + 1, end, index, newFare);
            }

            tree[node] = Math.min(tree[2 * node + 1], tree[2 * node + 2]);
        }
    }
}