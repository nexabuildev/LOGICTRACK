package com.logictrack.backend.model;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "erp_settings")
public class ErpSettings {

    @Id
    private Long id = 1L;

    private String companyName = "LogicTrack S.L.";
    private String taxId = "";
    private String address = "";
    private String city = "";
    private String country = "España";
    private String phone = "";
    private String email = "";
    private String logoUrl = "";

    private String posTicketMessage = "Gracias por su compra";
    private String currency = "EUR";
    private BigDecimal taxRate = new BigDecimal("21.00");

    private Boolean stockAlertsEnabled = true;
    private String stockAlertEmail = "";
    private Integer defaultMinStockAlert = 5;

    public ErpSettings() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public String getTaxId() { return taxId; }
    public void setTaxId(String taxId) { this.taxId = taxId; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getCountry() { return country; }
    public void setCountry(String country) { this.country = country; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getLogoUrl() { return logoUrl; }
    public void setLogoUrl(String logoUrl) { this.logoUrl = logoUrl; }

    public String getPosTicketMessage() { return posTicketMessage; }
    public void setPosTicketMessage(String posTicketMessage) { this.posTicketMessage = posTicketMessage; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public BigDecimal getTaxRate() { return taxRate; }
    public void setTaxRate(BigDecimal taxRate) { this.taxRate = taxRate; }

    public Boolean getStockAlertsEnabled() { return stockAlertsEnabled; }
    public void setStockAlertsEnabled(Boolean stockAlertsEnabled) { this.stockAlertsEnabled = stockAlertsEnabled; }

    public String getStockAlertEmail() { return stockAlertEmail; }
    public void setStockAlertEmail(String stockAlertEmail) { this.stockAlertEmail = stockAlertEmail; }

    public Integer getDefaultMinStockAlert() { return defaultMinStockAlert; }
    public void setDefaultMinStockAlert(Integer defaultMinStockAlert) { this.defaultMinStockAlert = defaultMinStockAlert; }
}
