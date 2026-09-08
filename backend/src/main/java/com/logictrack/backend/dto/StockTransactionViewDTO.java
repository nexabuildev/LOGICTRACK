package com.logictrack.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class StockTransactionViewDTO {
    private Long id;
    private Long productId;
    private String productName;
    private String productSku;
    private String userEmail;
    private Integer quantityChange;
    private String type;
    private String reason;
    private LocalDateTime createdAt;

    public StockTransactionViewDTO() {}

    public StockTransactionViewDTO(Long id, Long productId, String productName, String productSku,
                                   String userEmail, Integer quantityChange, String type,
                                   String reason, LocalDateTime createdAt) {
        this.id = id;
        this.productId = productId;
        this.productName = productName;
        this.productSku = productSku;
        this.userEmail = userEmail;
        this.quantityChange = quantityChange;
        this.type = type;
        this.reason = reason;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }

    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }

    public String getProductSku() { return productSku; }
    public void setProductSku(String productSku) { this.productSku = productSku; }

    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }

    public Integer getQuantityChange() { return quantityChange; }
    public void setQuantityChange(Integer quantityChange) { this.quantityChange = quantityChange; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
