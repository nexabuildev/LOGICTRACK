package com.logictrack.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record SupplierOrderRequestDTO(
        Long supplierId,
        LocalDate expectedDate,
        String notes,
        String status,
        List<SupplierOrderItemDTO> items
) {
    public record SupplierOrderItemDTO(Long productId, String productName, String sku, Integer quantityOrdered, BigDecimal unitCost) {}
}
