package com.logictrack.backend.dto;

import java.math.BigDecimal;

public record RegisterClosureRequestDTO(
        Long storeId,
        BigDecimal cashCounted,
        String notes
) {}
