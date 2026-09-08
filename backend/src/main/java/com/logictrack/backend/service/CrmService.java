package com.logictrack.backend.service;

import com.logictrack.backend.model.Customer;
import com.logictrack.backend.model.Promotion;
import com.logictrack.backend.repository.CustomerRepository;
import com.logictrack.backend.repository.PromotionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class CrmService {

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private PromotionRepository promotionRepository;

    public List<Customer> getAllCustomers() {
        return customerRepository.findAll().stream()
                .filter(c -> c.getDeleted() == null || !c.getDeleted())
                .toList();
    }

    public Customer saveCustomer(Customer customer) {
        if (customer.getCreatedAt() == null) {
            customer.setCreatedAt(LocalDateTime.now());
        }
        return customerRepository.save(customer);
    }

    public Customer getCustomerById(Long id) {
        return customerRepository.findById(id).orElse(null);
    }

    public List<Promotion> getAllPromotions() {
        return promotionRepository.findAll();
    }

    public Promotion savePromotion(Promotion promotion) {
        if (promotion.getCreatedAt() == null) {
            promotion.setCreatedAt(LocalDateTime.now());
        }
        if (promotion.getCode() != null) {
            promotion.setCode(promotion.getCode().toUpperCase());
        }
        return promotionRepository.save(promotion);
    }

    public Promotion validatePromotionCode(String code) {
        return promotionRepository.findByCodeIgnoreCase(code)
                .filter(p -> p.getActive() != null && p.getActive())
                .filter(p -> p.getExpiresAt() == null || p.getExpiresAt().isAfter(LocalDateTime.now()))
                .orElse(null);
    }
}
