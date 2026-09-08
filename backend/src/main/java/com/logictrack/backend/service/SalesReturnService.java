package com.logictrack.backend.service;

import com.logictrack.backend.dto.SalesReturnRequestDTO;
import com.logictrack.backend.model.*;
import com.logictrack.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class SalesReturnService {

    @Autowired
    private SalesReturnRepository returnRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    public List<SalesReturn> getAllReturns() {
        return returnRepository.findAllByOrderByCreatedAtDesc();
    }

    @Transactional
    public SalesReturn processReturn(SalesReturnRequestDTO dto, String email) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new IllegalArgumentException("User not found"));
        Order order = orderRepository.findById(dto.orderId()).orElseThrow(() -> new IllegalArgumentException("Venta no encontrada"));

        SalesReturn salesReturn = new SalesReturn();
        salesReturn.setOrder(order);
        salesReturn.setUser(user); // processedBy -> user
        // store doesn't exist on SalesReturn, skipping
        salesReturn.setReason(dto.reason());
        salesReturn.setCreatedAt(LocalDateTime.now()); // returnedAt -> createdAt
        salesReturn.setItems(new ArrayList<>());

        BigDecimal totalRefund = BigDecimal.ZERO;

        for (SalesReturnRequestDTO.ReturnItemDTO reqItem : dto.items()) {
            if (reqItem.quantity() == null || reqItem.quantity() <= 0) continue;

            Product product = productRepository.findById(reqItem.productId())
                    .orElseThrow(() -> new IllegalArgumentException("Producto no encontrado: " + reqItem.productId()));

            // Devolver al stock
            product.setStockQuantity(product.getStockQuantity() + reqItem.quantity()); // getStock -> getStockQuantity
            productRepository.save(product);

            SalesReturnItem item = new SalesReturnItem();
            item.setSalesReturn(salesReturn);
            item.setProduct(product);
            item.setQuantity(reqItem.quantity());
            
            // Refund calculation (using the product's current selling price or order price if we were to look it up)
            BigDecimal itemRefund = product.getPrice().multiply(BigDecimal.valueOf(reqItem.quantity())); // getSellingPrice -> getPrice
            item.setUnitPrice(product.getPrice()); // setRefundAmount -> setUnitPrice
            totalRefund = totalRefund.add(itemRefund);

            salesReturn.getItems().add(item);
        }

        if (salesReturn.getItems().isEmpty()) {
            throw new IllegalArgumentException("La devolución debe contener al menos 1 producto con cantidad mayor a cero.");
        }

        salesReturn.setRefundAmount(totalRefund); // setTotalRefund -> setRefundAmount

        return returnRepository.save(salesReturn);
    }
}
