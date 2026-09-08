package com.logictrack.backend.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public record ProductRequestDTO(
        @NotBlank(message = "El SKU es obligatorio")
        @Size(max = 50, message = "El SKU no puede superar los 50 caracteres")
        String sku,

        @NotBlank(message = "El nombre del producto es obligatorio")
        String name,

        @Size(max = 1000, message = "La descripción no puede superar los 1000 caracteres")
        String description,

        @NotNull(message = "El precio es obligatorio")
        @Positive(message = "El precio debe ser un número positivo")
        BigDecimal price,

        @NotNull(message = "El stock inicial es obligatorio")
        @Min(value = 0, message = "El stock no puede ser inferior a 0")
        Integer stockQuantity,

        Integer minStockAlert,

        String serialNumber,
        String condition,
        String features,

        String userEmail,
        Long storeId
) {}