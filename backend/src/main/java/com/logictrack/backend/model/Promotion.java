package com.logictrack.backend.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;


@Entity
@Table(name = "promotions")
public class Promotion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(unique = true)
    private String code; // e.g., VERANO20, VIP50

    @Column(nullable = false)
    private String type; // PERCENTAGE, FIXED_AMOUNT

    @Column(nullable = false)
    private Double discountValue;

    private Integer minOrderAmount; // Mínimo de compra para aplicar

    private Boolean active = true;

    private LocalDateTime expiresAt; // Fecha límite de validez

    private LocalDateTime createdAt = LocalDateTime.now();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public Double getDiscountValue() { return discountValue; }
    public void setDiscountValue(Double discountValue) { this.discountValue = discountValue; }
    public Integer getMinOrderAmount() { return minOrderAmount; }
    public void setMinOrderAmount(Integer minOrderAmount) { this.minOrderAmount = minOrderAmount; }
    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
    public LocalDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
