package com.logictrack.backend.model;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "products")
public class Product {

    // @Id indica que esta es la Clave Primaria (Primary Key)
    @Id
    // @GeneratedValue hace que el ID sea autoincremental (1, 2, 3...)
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // @Column nos permite definir reglas. Aquí decimos que el SKU no puede ser nulo y debe ser único.
    @Column(nullable = false, unique = true, length = 50)
    private String sku; // Código único de inventario (Ej: RTX-4090-001)

    @Column(nullable = false)
    private String name;

    @Column(length = 1000)
    private String description;

    @Column(nullable = false)
    private BigDecimal price; // Siempre usamos BigDecimal para dinero, nunca Double o Float

    @Column(nullable = false)
    private Integer stockQuantity;

    // Registra cuándo se añadió el producto al sistema
    @Column(updatable = false)
    private LocalDateTime createdAt;

    // --- CONSTRUCTORES ---
    public Product() {
        // JPA necesita un constructor vacío por defecto
    }

    // Un método que se ejecuta automáticamente justo antes de guardar en la BD por primera vez
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    // --- GETTERS Y SETTERS ---
    // (Para que Spring y React puedan leer y modificar los datos)

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getSku() { return sku; }
    public void setSku(String sku) { this.sku = sku; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    public Integer getStockQuantity() { return stockQuantity; }
    public void setStockQuantity(Integer stockQuantity) { this.stockQuantity = stockQuantity; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }


}
