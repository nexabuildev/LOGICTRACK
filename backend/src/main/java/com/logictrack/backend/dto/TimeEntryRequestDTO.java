package com.logictrack.backend.dto;

public record TimeEntryRequestDTO(
        Long userId,
        Long storeId,
        String notes
) {}
