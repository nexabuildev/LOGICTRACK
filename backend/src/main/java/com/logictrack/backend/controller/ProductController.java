package com.logictrack.backend.controller;

import com.logictrack.backend.dto.ProductRequestDTO;
import com.logictrack.backend.model.Product;
import com.logictrack.backend.repository.ProductRepository;
import com.logictrack.backend.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController
{
    @Autowired
    private ProductService productService;

    @GetMapping
    public ResponseEntity<List<Product>> getAllProducts()
    {
        return ResponseEntity.ok(productService.getAllProducts());
    }

    @PostMapping
    public ResponseEntity<?> createProduct(@Valid @RequestBody ProductRequestDTO dto) {
        try {
            Product savedProduct = productService.createProduct(dto);
            return ResponseEntity.ok(savedProduct);
        } catch (IllegalArgumentException e) {
            // Si el SKU está duplicado, devolvemos un error 400 (Bad Request) estructurado
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
