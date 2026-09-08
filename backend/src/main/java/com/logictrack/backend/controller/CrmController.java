package com.logictrack.backend.controller;

import com.logictrack.backend.model.Customer;
import com.logictrack.backend.model.Promotion;
import com.logictrack.backend.service.CrmService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/crm")
public class CrmController {

    @Autowired
    private CrmService crmService;

    // --- Customers ---

    @GetMapping("/customers")
    public ResponseEntity<List<Customer>> getCustomers() {
        return ResponseEntity.ok(crmService.getAllCustomers());
    }

    @PostMapping("/customers")
    public ResponseEntity<Customer> createCustomer(@RequestBody Customer customer) {
        return ResponseEntity.ok(crmService.saveCustomer(customer));
    }

    @PutMapping("/customers/{id}")
    public ResponseEntity<Customer> updateCustomer(@PathVariable Long id, @RequestBody Customer customerDetails) {
        Customer existing = crmService.getCustomerById(id);
        if (existing == null) {
            return ResponseEntity.notFound().build();
        }
        existing.setName(customerDetails.getName());
        existing.setEmail(customerDetails.getEmail());
        existing.setPhone(customerDetails.getPhone());
        existing.setTaxId(customerDetails.getTaxId());
        existing.setAddress(customerDetails.getAddress());
        existing.setActive(customerDetails.getActive());
        
        return ResponseEntity.ok(crmService.saveCustomer(existing));
    }

    // --- Promotions ---

    @GetMapping("/promotions")
    public ResponseEntity<List<Promotion>> getPromotions() {
        return ResponseEntity.ok(crmService.getAllPromotions());
    }

    @PostMapping("/promotions")
    public ResponseEntity<Promotion> createPromotion(@RequestBody Promotion promotion) {
        return ResponseEntity.ok(crmService.savePromotion(promotion));
    }

    @PutMapping("/promotions/{id}")
    public ResponseEntity<Promotion> updatePromotion(@PathVariable Long id, @RequestBody Promotion promoDetails) {
        Promotion existing = crmService.getAllPromotions().stream().filter(p -> p.getId().equals(id)).findFirst().orElse(null);
        if (existing == null) {
            return ResponseEntity.notFound().build();
        }
        existing.setName(promoDetails.getName());
        existing.setCode(promoDetails.getCode());
        existing.setType(promoDetails.getType());
        existing.setDiscountValue(promoDetails.getDiscountValue());
        existing.setMinOrderAmount(promoDetails.getMinOrderAmount());
        existing.setActive(promoDetails.getActive());
        existing.setExpiresAt(promoDetails.getExpiresAt());

        return ResponseEntity.ok(crmService.savePromotion(existing));
    }

    @GetMapping("/promotions/validate/{code}")
    public ResponseEntity<?> validatePromotion(@PathVariable String code) {
        Promotion promo = crmService.validatePromotionCode(code);
        if (promo == null) {
            return ResponseEntity.badRequest().body("Código inválido, inactivo o caducado.");
        }
        return ResponseEntity.ok(promo);
    }

    @Autowired
    private com.logictrack.backend.service.EmailService emailService;

    @PostMapping("/campaigns/send")
    public ResponseEntity<?> sendCampaign(@RequestBody java.util.Map<String, String> body) {
        String subject = body.get("subject");
        String message = body.get("message");
        
        List<Customer> customers = crmService.getAllCustomers();
        int count = 0;
        for (Customer c : customers) {
            if (c.getEmail() != null && !c.getEmail().isBlank()) {
                try {
                    emailService.sendPlainEmail(c.getEmail(), subject, message);
                    count++;
                } catch (Exception e) {
                    System.err.println("Error enviando campaña a " + c.getEmail() + ": " + e.getMessage());
                }
            }
        }
        return ResponseEntity.ok(java.util.Map.of("sentCount", count));
    }
}
