package com.logictrack.backend.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;


@Entity
@Table(name = "customers")
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(unique = true)
    private String email;

    private String phone;

    private String taxId; // NIF/CIF

    private String address;

    @Column(nullable = false)
    private Integer logicPoints = 0; // Puntos de fidelidad

    @Column(nullable = false)
    private Double storeCredit = 0.0; // Crédito a favor

    @Column(nullable = false)
    private Double debtAmount = 0.0; // Deuda pendiente

    private Boolean active = true;

    private LocalDateTime createdAt = LocalDateTime.now();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getTaxId() { return taxId; }
    public void setTaxId(String taxId) { this.taxId = taxId; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public Integer getLogicPoints() { return logicPoints; }
    public void setLogicPoints(Integer logicPoints) { this.logicPoints = logicPoints; }
    public Double getStoreCredit() { return storeCredit; }
    public void setStoreCredit(Double storeCredit) { this.storeCredit = storeCredit; }
    public Double getDebtAmount() { return debtAmount; }
    public void setDebtAmount(Double debtAmount) { this.debtAmount = debtAmount; }
    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    @Column(nullable = false)
    private Boolean deleted = false;

    public Boolean getDeleted() { return deleted; }
    public void setDeleted(Boolean deleted) { this.deleted = deleted; }
}
