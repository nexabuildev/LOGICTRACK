package com.logictrack.backend.dto;

public record StockAdjustmentRequestDTO(
        Long productId,
        Integer quantityChange,
        String adjustmentType,
        String reason
) {}
