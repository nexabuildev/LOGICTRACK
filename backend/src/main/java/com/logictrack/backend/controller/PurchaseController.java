package com.logictrack.backend.controller;

import com.logictrack.backend.dto.CheckoutRequestDTO;
import com.logictrack.backend.model.PurchaseOrder;
import com.logictrack.backend.service.PdfGeneratorService;
import com.logictrack.backend.service.PurchaseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/purchases")
public class PurchaseController {

    @Autowired
    private PurchaseService purchaseService;

    @Autowired
    private PdfGeneratorService pdfGeneratorService;

    private String getEmail(Authentication auth) {
        return auth.getName();
    }

    private String getRole(Authentication auth) {
        return auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .map(role -> role.replace("ROLE_", ""))
                .findFirst().orElse("USER");
    }

    @PostMapping("/checkout")
    public ResponseEntity<?> checkout(@RequestBody CheckoutRequestDTO dto, Authentication authentication) {
        try {
            PurchaseOrder order = purchaseService.checkout(dto, getEmail(authentication));
            return ResponseEntity.ok(order);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error al procesar el pago: " + e.getMessage());
        }
    }

    @GetMapping("/my-purchases")
    public ResponseEntity<List<PurchaseOrder>> getMyPurchases(Authentication authentication) {
        return ResponseEntity.ok(purchaseService.getMyPurchases(getEmail(authentication)));
    }

    @GetMapping("/{id}/invoice")
    public ResponseEntity<byte[]> downloadInvoice(@PathVariable Long id, Authentication authentication) {
        try {
            PurchaseOrder order = purchaseService.getPurchaseOrder(id, getEmail(authentication), getRole(authentication));
            byte[] pdfBytes = pdfGeneratorService.generateInvoicePdf(order);

            return ResponseEntity.ok()
                    .header("Content-Disposition", "attachment; filename=Factura_" + order.getId() + ".pdf")
                    .header("Content-Type", "application/pdf")
                    .body(pdfBytes);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @GetMapping
    public ResponseEntity<?> getAllPurchases(Authentication authentication) {
        String role = getRole(authentication);
        if (!"ADMIN".equals(role) && !"TECNICO".equals(role)) {
            return ResponseEntity.status(403).body("Solo personal de almacén/admin puede ver todos los pedidos web");
        }
        return ResponseEntity.ok(purchaseService.getAllPurchases());
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody java.util.Map<String, String> body, Authentication authentication) {
        String role = getRole(authentication);
        if (!"ADMIN".equals(role) && !"TECNICO".equals(role)) {
            return ResponseEntity.status(403).body("Solo personal de almacén/admin puede actualizar pedidos web");
        }
        String status = body.get("status");
        String trackingCode = body.get("trackingCode");
        return ResponseEntity.ok(purchaseService.updateStatusAndTracking(id, status, trackingCode));
    }
}
