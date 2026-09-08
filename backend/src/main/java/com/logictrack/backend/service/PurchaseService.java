package com.logictrack.backend.service;

import com.logictrack.backend.dto.CartItemDTO;
import com.logictrack.backend.dto.CheckoutRequestDTO;
import com.logictrack.backend.model.*;
import com.logictrack.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class PurchaseService {

    @Autowired
    private PurchaseOrderRepository purchaseOrderRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StockTransactionRepository stockTransactionRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private PdfGeneratorService pdfGeneratorService;

    @Transactional
    public PurchaseOrder checkout(CheckoutRequestDTO request, String userEmail) {
        User buyer = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("Usuario comprador no encontrado"));

        if (request.items() == null || request.items().isEmpty()) {
            throw new IllegalArgumentException("El carrito está vacío");
        }

        PurchaseOrder order = new PurchaseOrder();
        order.setBuyer(buyer);
        
        BigDecimal totalAmount = BigDecimal.ZERO;

        for (CartItemDTO itemDTO : request.items()) {
            Product product = productRepository.findById(itemDTO.productId())
                    .orElseThrow(() -> new IllegalArgumentException("Producto no encontrado con ID: " + itemDTO.productId()));

            if (product.getStockQuantity() < itemDTO.quantity()) {
                throw new IllegalArgumentException("Stock insuficiente para: " + product.getName() + " (Quedan: " + product.getStockQuantity() + ")");
            }

            // Decrementar stock
            product.setStockQuantity(product.getStockQuantity() - itemDTO.quantity());
            productRepository.save(product);

            // Crear Kardex transaction
            stockTransactionRepository.save(new StockTransaction(
                    product,
                    buyer,
                    -itemDTO.quantity(),
                    "OUTPUT",
                    "Compra de carrito - Cliente: " + userEmail
            ));

            // Agregar a la orden
            PurchaseOrderItem orderItem = new PurchaseOrderItem();
            orderItem.setProduct(product);
            orderItem.setProductName(product.getName());
            orderItem.setProductSku(product.getSku());
            orderItem.setQuantity(itemDTO.quantity());
            orderItem.setUnitPrice(product.getPrice());
            
            order.addItem(orderItem);
            totalAmount = totalAmount.add(orderItem.getTotalPrice());
        }

        order.setTotalAmount(totalAmount);
        PurchaseOrder savedOrder = purchaseOrderRepository.save(order);

        // Auditoría
        auditLogRepository.save(new AuditLog(
                userEmail,
                "PURCHASED",
                "Cliente completó el checkout. Orden #" + savedOrder.getId() + " - Total: $" + totalAmount
        ));

        // Generar Factura PDF y Enviar Correo
        try {
            byte[] invoicePdf = pdfGeneratorService.generateInvoicePdf(savedOrder);
            String emailText = "Hola " + buyer.getName() + ",\n\n" +
                    "Gracias por tu compra en LogiTrack Shop.\n" +
                    "Adjuntamos a este correo la factura detallada de tu pedido #" + savedOrder.getId() + ".\n\n" +
                    "Total pagado: $" + savedOrder.getTotalAmount() + "\n\n" +
                    "Atentamente,\nEl equipo de LogiTrack";
            
            emailService.sendPurchaseConfirmationEmail(buyer.getEmail(), "Confirmación de Compra #" + savedOrder.getId(), emailText, invoicePdf);
        } catch (Exception e) {
            System.err.println("Error enviando factura por correo: " + e.getMessage());
        }

        return savedOrder;
    }

    @Transactional(readOnly = true)
    public List<PurchaseOrder> getMyPurchases(String email) {
        return purchaseOrderRepository.findByBuyerEmailOrderByCreatedAtDesc(email);
    }
    
    @Transactional(readOnly = true)
    public PurchaseOrder getPurchaseOrder(Long orderId, String email, String role) {
        PurchaseOrder order = purchaseOrderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Orden no encontrada"));
                
        if (!"ADMIN".equals(role) && !"TECNICO".equals(role) && !order.getBuyer().getEmail().equals(email)) {
            throw new IllegalArgumentException("No tienes permiso para ver esta orden");
        }
        
        return order;
    }

    @Transactional(readOnly = true)
    public List<PurchaseOrder> getAllPurchases() {
        return purchaseOrderRepository.findAll();
    }

    @Transactional
    public PurchaseOrder updateStatusAndTracking(Long id, String status, String trackingCode) {
        PurchaseOrder order = purchaseOrderRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Orden no encontrada"));
        if (status != null) {
            order.setStatus(status);
        }
        if (trackingCode != null) {
            order.setTrackingCode(trackingCode);
        }
        return purchaseOrderRepository.save(order);
    }
}
