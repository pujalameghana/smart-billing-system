package com.billingapp.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

@Entity
public class InvoiceTemplate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String templateName;
    private String theme = "modern"; // modern, classic, minimal
    private String primaryColor = "#0d6efd";

    // Business fields
    private boolean showLogo = true;
    private boolean showBusinessName = true;
    private boolean showAddress = true;
    private boolean showGstin = true;
    private boolean showPhone = true;
    private boolean showEmail = true;
    private boolean showWebsite = true;

    // Customer fields
    private boolean showCustomerName = true;
    private boolean showCustomerPhone = true;
    private boolean showCustomerAddress = true;

    // Product fields
    private boolean showProduct = true;
    private boolean showQuantity = true;
    private boolean showRate = true;
    private boolean showAmount = true;

    // Summary & Footer fields
    private boolean showTotal = true;
    private boolean showTaxBreakdown = true;
    private boolean showBankDetails = true;
    private boolean showSignature = true;

    // Relationship with Business
    @ManyToOne
    @JoinColumn(name = "business_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "owner"})
    private Business business;

    public InvoiceTemplate() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTemplateName() {
        return templateName;
    }

    public void setTemplateName(String templateName) {
        this.templateName = templateName;
    }

    public String getTheme() {
        return theme;
    }

    public void setTheme(String theme) {
        this.theme = theme;
    }

    public String getPrimaryColor() {
        return primaryColor;
    }

    public void setPrimaryColor(String primaryColor) {
        this.primaryColor = primaryColor;
    }

    public boolean isShowLogo() {
        return showLogo;
    }

    public void setShowLogo(boolean showLogo) {
        this.showLogo = showLogo;
    }

    public boolean isShowBusinessName() {
        return showBusinessName;
    }

    public void setShowBusinessName(boolean showBusinessName) {
        this.showBusinessName = showBusinessName;
    }

    public boolean isShowAddress() {
        return showAddress;
    }

    public void setShowAddress(boolean showAddress) {
        this.showAddress = showAddress;
    }

    public boolean isShowGstin() {
        return showGstin;
    }

    public void setShowGstin(boolean showGstin) {
        this.showGstin = showGstin;
    }

    public boolean isShowPhone() {
        return showPhone;
    }

    public void setShowPhone(boolean showPhone) {
        this.showPhone = showPhone;
    }

    public boolean isShowEmail() {
        return showEmail;
    }

    public void setShowEmail(boolean showEmail) {
        this.showEmail = showEmail;
    }

    public boolean isShowWebsite() {
        return showWebsite;
    }

    public void setShowWebsite(boolean showWebsite) {
        this.showWebsite = showWebsite;
    }

    public boolean isShowCustomerName() {
        return showCustomerName;
    }

    public void setShowCustomerName(boolean showCustomerName) {
        this.showCustomerName = showCustomerName;
    }

    public boolean isShowCustomerPhone() {
        return showCustomerPhone;
    }

    public void setShowCustomerPhone(boolean showCustomerPhone) {
        this.showCustomerPhone = showCustomerPhone;
    }

    public boolean isShowCustomerAddress() {
        return showCustomerAddress;
    }

    public void setShowCustomerAddress(boolean showCustomerAddress) {
        this.showCustomerAddress = showCustomerAddress;
    }

    public boolean isShowProduct() {
        return showProduct;
    }

    public void setShowProduct(boolean showProduct) {
        this.showProduct = showProduct;
    }

    public boolean isShowQuantity() {
        return showQuantity;
    }

    public void setShowQuantity(boolean showQuantity) {
        this.showQuantity = showQuantity;
    }

    public boolean isShowRate() {
        return showRate;
    }

    public void setShowRate(boolean showRate) {
        this.showRate = showRate;
    }

    public boolean isShowAmount() {
        return showAmount;
    }

    public void setShowAmount(boolean showAmount) {
        this.showAmount = showAmount;
    }

    public boolean isShowTotal() {
        return showTotal;
    }

    public void setShowTotal(boolean showTotal) {
        this.showTotal = showTotal;
    }

    public boolean isShowTaxBreakdown() {
        return showTaxBreakdown;
    }

    public void setShowTaxBreakdown(boolean showTaxBreakdown) {
        this.showTaxBreakdown = showTaxBreakdown;
    }

    public boolean isShowBankDetails() {
        return showBankDetails;
    }

    public void setShowBankDetails(boolean showBankDetails) {
        this.showBankDetails = showBankDetails;
    }

    public boolean isShowSignature() {
        return showSignature;
    }

    public void setShowSignature(boolean showSignature) {
        this.showSignature = showSignature;
    }

    public Business getBusiness() {
        return business;
    }

    public void setBusiness(Business business) {
        this.business = business;
    }
}