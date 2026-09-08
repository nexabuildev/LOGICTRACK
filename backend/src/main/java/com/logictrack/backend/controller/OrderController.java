package com.logictrack.backend.controller;

import com.logictrack.backend.dto.OrderItemDTO;
import com.logictrack.backend.dto.OrderRequestDTO;
import com.logictrack.backend.model.Customer;
import com.logictrack.backend.model.Order;
import com.logictrack.backend.model.OrderItem;
import com.logictrack.backend.model.Product;
import com.logictrack.backend.model.User;
import com.logictrack.backend.repository.OrderRepository;
import com.logictrack.backend.repository.ProductRepository;
import com.logictrack.backend.repository.StoreRepository;
import com.logictrack.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StoreRepository storeRepository;

    @Autowired
    private com.logictrack.backend.repository.CustomerRepository customerRepository;

    @Autowired
    private com.logictrack.backend.service.PdfGeneratorService pdfGeneratorService;

    @Autowired
    private com.logictrack.backend.service.EmailService emailService;

    @GetMapping
    public ResponseEntity<List<Order>> getAllOrders() {
        return ResponseEntity.ok(orderRepository.findAllByOrderByCreatedAtDesc());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getOrderById(@PathVariable Long id) {
        return orderRepository.findByIdWithItems(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @Transactional
    public ResponseEntity<?> createOrder(@RequestBody OrderRequestDTO request, Authentication auth) {
        Order order = new Order();
        
        if (auth != null && auth.getName() != null) {
            Optional<User> userOpt = userRepository.findByEmail(auth.getName());
            userOpt.ifPresent(order::setUser);
        }

        Customer customer = null;
        if (request.getCustomerId() != null) {
            customer = customerRepository.findById(request.getCustomerId()).orElse(null);
            if (customer != null) {
                order.setCustomer(customer);
            }
        }

        if (request.getPaymentMethod() != null) {
            order.setPaymentMethod(request.getPaymentMethod());
        }
        if (request.getStoreId() != null) {
            storeRepository.findById(request.getStoreId()).ifPresent(order::setStore);
        }

        BigDecimal totalAmount = BigDecimal.ZERO;

        for (OrderItemDTO itemDto : request.getItems()) {
            Optional<Product> prodOpt = productRepository.findById(itemDto.getProductId());
            if (prodOpt.isEmpty()) {
                return ResponseEntity.badRequest().body("Producto no encontrado: " + itemDto.getProductId());
            }
            Product product = prodOpt.get();
            if (product.getStockQuantity() < itemDto.getQuantity()) {
                return ResponseEntity.badRequest().body("Stock insuficiente para: " + product.getName());
            }

            // Descontar stock
            product.setStockQuantity(product.getStockQuantity() - itemDto.getQuantity());
            productRepository.save(product);

            OrderItem orderItem = new OrderItem();
            orderItem.setProduct(product);
            orderItem.setQuantity(itemDto.getQuantity());
            orderItem.setUnitPrice(product.getPrice());
            
            order.addItem(orderItem);

            totalAmount = totalAmount.add(product.getPrice().multiply(BigDecimal.valueOf(itemDto.getQuantity())));
        }

        // Apply Points Discount
        if (customer != null && request.getRedeemPoints() != null && request.getRedeemPoints()) {
            double maxPointsDiscount = customer.getLogicPoints() / 10.0;
            double discountAmount = Math.min(maxPointsDiscount, totalAmount.doubleValue());
            int pointsRedeemed = (int) (discountAmount * 10);
            customer.setLogicPoints(customer.getLogicPoints() - pointsRedeemed);
            totalAmount = totalAmount.subtract(BigDecimal.valueOf(discountAmount));
        }

        // Apply Store Credit
        if (customer != null && request.getUseStoreCredit() != null && request.getUseStoreCredit()) {
            double creditUsed = Math.min(customer.getStoreCredit(), totalAmount.doubleValue());
            customer.setStoreCredit(customer.getStoreCredit() - creditUsed);
            totalAmount = totalAmount.subtract(BigDecimal.valueOf(creditUsed));
        }

        // Apply Debt
        if ("DEBT".equals(request.getPaymentMethod())) {
            if (customer == null) {
                return ResponseEntity.badRequest().body("Debe seleccionar un cliente para compras a deber (deuda).");
            }
            customer.setDebtAmount(customer.getDebtAmount() + totalAmount.doubleValue());
        }

        // Earn Points
        if (customer != null) {
            int earnedPoints = (int) (totalAmount.doubleValue() * 0.1);
            customer.setLogicPoints(customer.getLogicPoints() + earnedPoints);
            customerRepository.save(customer);
        }

        order.setTotalAmount(totalAmount);
        orderRepository.save(order);

        // Send Email Invoice
        if (customer != null && customer.getEmail() != null && !customer.getEmail().isBlank()) {
            try {
                byte[] pdf = pdfGeneratorService.generatePosOrderInvoicePdf(order);
                emailService.sendPurchaseConfirmationEmail(
                    customer.getEmail(),
                    "Factura Simplificada TPV #" + order.getId(),
                    "Hola " + customer.getName() + ",\n\nAdjuntamos la factura simplificada de tu compra en el TPV.\n\nTotal: €" + order.getTotalAmount() + "\n\nSaludos,\nEquipo de LogicTrack",
                    pdf
                );
            } catch (Exception e) {
                System.err.println("Error enviando factura TPV: " + e.getMessage());
            }
        }

        return ResponseEntity.ok(order);
    }
}
