package com.billingapp.service;

import com.billingapp.dto.DashboardStatsDto;
import com.billingapp.repository.CustomerRepository;
import com.billingapp.repository.InvoiceRepository;
import com.billingapp.repository.ProductRepository;
import org.springframework.stereotype.Service;

@Service
public class DashboardService {

    private final InvoiceRepository invoiceRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;

    public DashboardService(InvoiceRepository invoiceRepository,
                            CustomerRepository customerRepository,
                            ProductRepository productRepository) {
        this.invoiceRepository = invoiceRepository;
        this.customerRepository = customerRepository;
        this.productRepository = productRepository;
    }

    public DashboardStatsDto getDashboardStats(Long businessId) {
        DashboardStatsDto stats = new DashboardStatsDto();

        Double totalRevenue = invoiceRepository.calculateTotalRevenueByBusinessId(businessId);
        stats.setTotalRevenue(totalRevenue != null ? totalRevenue : 0.0);

        Double pendingAmount = invoiceRepository.calculatePendingAmountByBusinessId(businessId);
        stats.setPendingAmount(pendingAmount != null ? pendingAmount : 0.0);

        stats.setTotalInvoices(invoiceRepository.countByBusinessId(businessId));
        stats.setPaidInvoicesCount(invoiceRepository.countByBusinessIdAndStatus(businessId, "PAID"));
        stats.setPendingInvoicesCount(invoiceRepository.countByBusinessIdAndStatus(businessId, "SENT"));
        stats.setOverdueInvoicesCount(invoiceRepository.countByBusinessIdAndStatus(businessId, "OVERDUE"));

        stats.setTotalCustomers(customerRepository.countByBusinessId(businessId));
        stats.setTotalProducts(productRepository.countByBusinessId(businessId));

        stats.setRecentInvoices(invoiceRepository.findTop5ByBusinessIdOrderByCreatedAtDesc(businessId));

        return stats;
    }
}
