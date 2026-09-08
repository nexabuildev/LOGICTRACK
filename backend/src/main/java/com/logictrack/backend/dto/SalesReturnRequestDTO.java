package com.logictrack.backend.dto;

import java.util.List;

public record SalesReturnRequestDTO(
        Long orderId,
        String reason,
        List<ReturnItemDTO> items
) {
    public record ReturnItemDTO(Long productId, Integer quantity) {}
}
