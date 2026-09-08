package com.logictrack.backend.dto;

import java.math.BigDecimal;

public record CategoryRequestDTO(
        String name,
        String type,
        Long parentId,
        Boolean active
) {}
