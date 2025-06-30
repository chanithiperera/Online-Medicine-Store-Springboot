package com.medicare.medicare.service;

import com.medicare.medicare.model.Product;
import com.medicare.medicare.repository.ProductFileRepository;
import com.medicare.medicare.util.ProductSorter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;

@Service
public class ProductService {

    private final ProductFileRepository productRepository;

    @Autowired
    public ProductService(ProductFileRepository productRepository) {
        this.productRepository = productRepository;
    }

    public List<Product> findAll() {
        return productRepository.findAll();
    }

    public Product findById(Long id) {
        return productRepository.findById(id).orElse(null);
    }

    public Product save(Product product) {
        return productRepository.save(product);
    }

    public void delete(Long id) {
        productRepository.delete(id);
    }

    public List<Product> findAllSorted(String order) {
        List<Product> products = productRepository.findAll();
        Product[] productArray = products.toArray(new Product[0]);
        boolean ascending = "asc".equalsIgnoreCase(order);
        ProductSorter.quickSort(productArray, 0, productArray.length - 1, ascending);
        return Arrays.asList(productArray);
    }
}