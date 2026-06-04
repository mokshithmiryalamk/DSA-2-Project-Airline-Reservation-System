package sorting;

public class HeapSort {

    public void sortByFare(double[] fares) {
        int n = fares.length;

        for(int i = n / 2 - 1; i >= 0; i--) {
            heapify(fares, n, i);
        }

        for(int i = n - 1; i > 0; i--) {
            double temp = fares[0];
            fares[0] = fares[i];
            fares[i] = temp;

            heapify(fares, i, 0);
        }
    }

    private void heapify(double[] fares, int n, int i) {
        int largest = i;
        int left = 2 * i + 1;
        int right = 2 * i + 2;

        if(left < n && fares[left] > fares[largest]) {
            largest = left;
        }

        if(right < n && fares[right] > fares[largest]) {
            largest = right;
        }

        if(largest != i) {
            double temp = fares[i];
            fares[i] = fares[largest];
            fares[largest] = temp;

            heapify(fares, n, largest);
        }
    }
}