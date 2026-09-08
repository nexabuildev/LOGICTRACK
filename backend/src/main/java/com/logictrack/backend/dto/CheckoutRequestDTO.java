package com.logictrack.backend.dto;

import java.util.List;

public record CheckoutRequestDTO(List<CartItemDTO> items) {}
