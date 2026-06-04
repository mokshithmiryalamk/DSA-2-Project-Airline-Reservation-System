package sorting;

public class MergeSort {

    public void sortByFare(double[] fares) {
        mergeSort(fares, 0, fares.length - 1);
    }

    private void mergeSort(double[] fares, int left, int right) {
        if(left < right) {
            int mid = (left + right) / 2;

            mergeSort(fares, left, mid);
            mergeSort(fares, mid + 1, right);

            merge(fares, left, mid, right);
        }
    }

    private void merge(double[] fares, int left, int mid, int right) {
        int n1 = mid - left + 1;
        int n2 = right - mid;

        double[] leftArray = new double[n1];
        double[] rightArray = new double[n2];

        for(int i = 0; i < n1; i++) {
            leftArray[i] = fares[left + i];
        }

        for(int j = 0; j < n2; j++) {
            rightArray[j] = fares[mid + 1 + j];
        }

        int i = 0, j = 0, k = left;

        while(i < n1 && j < n2) {
            if(leftArray[i] <= rightArray[j]) {
                fares[k++] = leftArray[i++];
            }
            else {
                fares[k++] = rightArray[j++];
            }
        }

        while(i < n1) {
            fares[k++] = leftArray[i++];
        }

        while(j < n2) {
            fares[k++] = rightArray[j++];
        }
    }
}