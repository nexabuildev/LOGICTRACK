package com.logictrack.backend.dto;

import java.util.List;

public class OrderRequestDTO {
    private List<OrderItemDTO> items;
    private String paymentMethod;
    private Long storeId;
    private Long customerId;
    private Boolean redeemPoints = false;
    private Boolean useStoreCredit = false;

    public List<OrderItemDTO> getItems() {
        return items;
    }

    public void setItems(List<OrderItemDTO> items) {
        this.items = items;
    }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public Long getStoreId() { return storeId; }
    public void setStoreId(Long storeId) { this.storeId = storeId; }

    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; }

    public Boolean getRedeemPoints() { return redeemPoints; }
    public void setRedeemPoints(Boolean redeemPoints) { this.redeemPoints = redeemPoints; }

    public Boolean getUseStoreCredit() { return useStoreCredit; }
    public void setUseStoreCredit(Boolean useStoreCredit) { this.useStoreCredit = useStoreCredit; }
}
