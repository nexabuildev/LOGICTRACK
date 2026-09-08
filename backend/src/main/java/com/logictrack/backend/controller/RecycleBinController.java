package com.logictrack.backend.controller;

import com.logictrack.backend.model.Category;
import com.logictrack.backend.model.Customer;
import com.logictrack.backend.model.Product;
import com.logictrack.backend.model.User;
import com.logictrack.backend.repository.CategoryRepository;
import com.logictrack.backend.repository.CustomerRepository;
import com.logictrack.backend.repository.ProductRepository;
import com.logictrack.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/recycle-bin")
public class RecycleBinController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @GetMapping
    public ResponseEntity<Map<String, List<?>>> getDeletedItems() {
        Map<String, List<?>> result = new HashMap<>();

        List<User> deletedUsers = userRepository.findAll().stream()
                .filter(u -> u.getDeleted() != null && u.getDeleted())
                .toList();

        List<Product> deletedProducts = productRepository.findAll().stream()
                .filter(p -> p.getDeleted() != null && p.getDeleted())
                .toList();

        List<Category> deletedCategories = categoryRepository.findAll().stream()
                .filter(c -> c.getDeleted() != null && c.getDeleted())
                .toList();

        List<Customer> deletedCustomers = customerRepository.findAll().stream()
                .filter(c -> c.getDeleted() != null && c.getDeleted())
                .toList();

        result.put("users", deletedUsers);
        result.put("products", deletedProducts);
        result.put("categories", deletedCategories);
        result.put("customers", deletedCustomers);

        return ResponseEntity.ok(result);
    }

    @PostMapping("/restore/{type}/{id}")
    public ResponseEntity<?> restoreItem(@PathVariable String type, @PathVariable Long id) {
        switch (type.toLowerCase()) {
            case "products":
                productRepository.findById(id).ifPresent(p -> {
                    p.setDeleted(false);
                    productRepository.save(p);
                });
                break;
            case "users":
                userRepository.findById(id).ifPresent(u -> {
                    u.setDeleted(false);
                    userRepository.save(u);
                });
                break;
            case "categories":
                categoryRepository.findById(id).ifPresent(c -> {
                    c.setDeleted(false);
                    categoryRepository.save(c);
                });
                break;
            case "customers":
                customerRepository.findById(id).ifPresent(c -> {
                    c.setDeleted(false);
                    customerRepository.save(c);
                });
                break;
            default:
                return ResponseEntity.badRequest().body("Tipo de entidad no válido");
        }
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/permanent/{type}/{id}")
    public ResponseEntity<?> permanentDeleteItem(@PathVariable String type, @PathVariable Long id) {
        switch (type.toLowerCase()) {
            case "products":
                productRepository.deleteById(id);
                break;
            case "users":
                userRepository.deleteById(id);
                break;
            case "categories":
                categoryRepository.deleteById(id);
                break;
            case "customers":
                customerRepository.deleteById(id);
                break;
            default:
                return ResponseEntity.badRequest().body("Tipo de entidad no válido");
        }
        return ResponseEntity.ok().build();
    }
}
