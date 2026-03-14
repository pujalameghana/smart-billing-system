package com.billingapp.controller;

import com.billingapp.model.Product;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Arrays;
import java.util.List;

@RestController
public class ProductController {

    @GetMapping("/api/products")
    public List<Product> getProducts() {
        return Arrays.asList(
            new Product("UPVC Sheet", 100),
            new Product("Glass", 200),
            new Product("Sealant", 50)
        );
    }
}
