package com.logictrack.backend.service;

import com.logictrack.backend.dto.ProductRequestDTO;
import com.logictrack.backend.model.Product;
import com.logictrack.backend.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Transactional(readOnly = true)
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    @Transactional
    public Product createProduct(ProductRequestDTO dto) {
        // Validación de negocio: Evitar SKUs duplicados
        if (productRepository.existsBySku(dto.sku())) {
            throw new IllegalArgumentException("Ya existe un producto con el SKU: " + dto.sku());
        }

        // Mapeamos el DTO seguro a nuestra Entidad de base de datos
        Product product = new Product();
        product.setSku(dto.sku());
        product.setName(dto.name());
        product.setDescription(dto.description());
        product.setPrice(dto.price());
        product.setStockQuantity(dto.stockQuantity());

        return productRepository.save(product);
    }
}