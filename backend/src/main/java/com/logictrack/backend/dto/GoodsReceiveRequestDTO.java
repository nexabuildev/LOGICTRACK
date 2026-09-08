package com.logictrack.backend.dto;

import java.util.List;

public record GoodsReceiveRequestDTO(
        List<ReceiveItemDTO> items
) {
    public record ReceiveItemDTO(Long itemId, Integer quantityReceived) {}
}
