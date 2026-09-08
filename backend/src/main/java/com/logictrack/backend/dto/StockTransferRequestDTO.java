package com.logictrack.backend.dto;

public record StockTransferRequestDTO(
        Long fromStoreId,
        Long toStoreId,
        Long productId,
        Integer quantity,
        String notes
) {}
