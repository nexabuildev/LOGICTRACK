package com.logictrack.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "supplier_order_items")
public class SupplierOrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_order_id", nullable = false)
    @JsonIgnore
    private SupplierOrder supplierOrder;

    private Long productId;

    @Column(nullable = false)
    private String productName;

    @Column(length = 50)
    private String sku;

    @Column(nullable = false)
    private Integer quantityOrdered;

    @Column(nullable = false)
    private Integer quantityReceived = 0;

    @Column(nullable = false)
    private BigDecimal unitCost;

    public SupplierOrderItem() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public SupplierOrder getSupplierOrder() { return supplierOrder; }
    public void setSupplierOrder(SupplierOrder supplierOrder) { this.supplierOrder = supplierOrder; }

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }

    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }

    public String getSku() { return sku; }
    public void setSku(String sku) { this.sku = sku; }

    public Integer getQuantityOrdered() { return quantityOrdered; }
    public void setQuantityOrdered(Integer quantityOrdered) { this.quantityOrdered = quantityOrdered; }

    public Integer getQuantityReceived() { return quantityReceived; }
    public void setQuantityReceived(Integer quantityReceived) { this.quantityReceived = quantityReceived; }

    public BigDecimal getUnitCost() { return unitCost; }
    public void setUnitCost(BigDecimal unitCost) { this.unitCost = unitCost; }
}
