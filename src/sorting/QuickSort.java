package sorting;

public class QuickSort {

    public void sortByFare(double[] fares) {
        quickSort(fares, 0, fares.length - 1);
    }

    private void quickSort(double[] fares, int low, int high) {
        if(low < high) {
            int pivotIndex = partition(fares, low, high);

            quickSort(fares, low, pivotIndex - 1);
            quickSort(fares, pivotIndex + 1, high);
        }
    }

    private int partition(double[] fares, int low, int high) {
        double pivot = fares[high];
        int i = low - 1;

        for(int j = low; j < high; j++) {
            if(fares[j] <= pivot) {
                i++;

                double temp = fares[i];
                fares[i] = fares[j];
                fares[j] = temp;
            }
        }

        double temp = fares[i + 1];
        fares[i + 1] = fares[high];
        fares[high] = temp;

        return i + 1;
    }
}