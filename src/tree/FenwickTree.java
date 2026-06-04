package tree;

public class FenwickTree {

    private double[] tree;
    private int size;

    public FenwickTree(int size) {
        this.size = size;
        tree = new double[size + 1];
    }

    public void update(int index, double value) {

        index++;

        while(index <= size) {
            tree[index] += value;
            index += index & (-index);
        }
    }

    public double getPrefixSum(int index) {

        index++;

        double sum = 0;

        while(index > 0) {
            sum += tree[index];
            index -= index & (-index);
        }

        return sum;
    }

    public double getRangeSum(int left, int right) {

        if(left == 0) {
            return getPrefixSum(right);
        }

        return getPrefixSum(right) - getPrefixSum(left - 1);
    }
}