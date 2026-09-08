package com.logictrack.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "register_closures")
public class RegisterClosure {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "password", "token"})
    private User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "store_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Store store;

    @Column(nullable = false)
    private LocalDateTime closedAt = LocalDateTime.now();

    @Column(nullable = false)
    private Integer ordersCount = 0;

    @Column(nullable = false)
    private BigDecimal totalSales = BigDecimal.ZERO;

    @Column(nullable = false)
    private BigDecimal cashTotal = BigDecimal.ZERO;

    @Column(nullable = false)
    private BigDecimal cardTotal = BigDecimal.ZERO;

    @Column(nullable = false)
    private BigDecimal cashCounted = BigDecimal.ZERO;

    @Column(nullable = false)
    private BigDecimal difference = BigDecimal.ZERO;

    @Column(length = 1000)
    private String notes;

    public RegisterClosure() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Store getStore() { return store; }
    public void setStore(Store store) { this.store = store; }

    public LocalDateTime getClosedAt() { return closedAt; }
    public void setClosedAt(LocalDateTime closedAt) { this.closedAt = closedAt; }

    public Integer getOrdersCount() { return ordersCount; }
    public void setOrdersCount(Integer ordersCount) { this.ordersCount = ordersCount; }

    public BigDecimal getTotalSales() { return totalSales; }
    public void setTotalSales(BigDecimal totalSales) { this.totalSales = totalSales; }

    public BigDecimal getCashTotal() { return cashTotal; }
    public void setCashTotal(BigDecimal cashTotal) { this.cashTotal = cashTotal; }

    public BigDecimal getCardTotal() { return cardTotal; }
    public void setCardTotal(BigDecimal cardTotal) { this.cardTotal = cardTotal; }

    public BigDecimal getCashCounted() { return cashCounted; }
    public void setCashCounted(BigDecimal cashCounted) { this.cashCounted = cashCounted; }

    public BigDecimal getDifference() { return difference; }
    public void setDifference(BigDecimal difference) { this.difference = difference; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
