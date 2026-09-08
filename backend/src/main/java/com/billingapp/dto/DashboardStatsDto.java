package com.billingapp.dto;

import com.billingapp.model.Invoice;
import java.util.List;

public class DashboardStatsDto {
    private double totalRevenue;
    private double pendingAmount;
    private long totalInvoices;
    private long paidInvoicesCount;
    private long pendingInvoicesCount;
    private long overdueInvoicesCount;
    private long totalCustomers;
    private long totalProducts;
    private List<Invoice> recentInvoices;

    public DashboardStatsDto() {
    }

    public double getTotalRevenue() {
        return totalRevenue;
    }

    public void setTotalRevenue(double totalRevenue) {
        this.totalRevenue = totalRevenue;
    }

    public double getPendingAmount() {
        return pendingAmount;
    }

    public void setPendingAmount(double pendingAmount) {
        this.pendingAmount = pendingAmount;
    }

    public long getTotalInvoices() {
        return totalInvoices;
    }

    public void setTotalInvoices(long totalInvoices) {
        this.totalInvoices = totalInvoices;
    }

    public long getPaidInvoicesCount() {
        return paidInvoicesCount;
    }

    public void setPaidInvoicesCount(long paidInvoicesCount) {
        this.paidInvoicesCount = paidInvoicesCount;
    }

    public long getPendingInvoicesCount() {
        return pendingInvoicesCount;
    }

    public void setPendingInvoicesCount(long pendingInvoicesCount) {
        this.pendingInvoicesCount = pendingInvoicesCount;
    }

    public long getOverdueInvoicesCount() {
        return overdueInvoicesCount;
    }

    public void setOverdueInvoicesCount(long overdueInvoicesCount) {
        this.overdueInvoicesCount = overdueInvoicesCount;
    }

    public long getTotalCustomers() {
        return totalCustomers;
    }

    public void setTotalCustomers(long totalCustomers) {
        this.totalCustomers = totalCustomers;
    }

    public long getTotalProducts() {
        return totalProducts;
    }

    public void setTotalProducts(long totalProducts) {
        this.totalProducts = totalProducts;
    }

    public List<Invoice> getRecentInvoices() {
        return recentInvoices;
    }

    public void setRecentInvoices(List<Invoice> recentInvoices) {
        this.recentInvoices = recentInvoices;
    }
}
