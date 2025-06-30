package com.medicare.medicare.util;

import com.medicare.medicare.model.Product;

public class ProductSorter {
    public static void quickSort(Product[] products, int low, int high, boolean ascending) {
        if (low < high) {
            int pi = partition(products, low, high, ascending);
            quickSort(products, low, pi - 1, ascending);
            quickSort(products, pi + 1, high, ascending);
        }
    }

    private static int partition(Product[] products, int low, int high, boolean ascending) {
        Product pivot = products[high];
        int i = low - 1;
        for (int j = low; j < high; j++) {
            if (ascending) {
                if (products[j].getPrice() < pivot.getPrice()) {
                    i++;
                    swap(products, i, j);
                }
            } else {
                if (products[j].getPrice() > pivot.getPrice()) {
                    i++;
                    swap(products, i, j);
                }
            }
        }
        swap(products, i + 1, high);
        return i + 1;
    }

    private static void swap(Product[] products, int i, int j) {
        Product temp = products[i];
        products[i] = products[j];
        products[j] = temp;
    }
}