package com.billingapp.service;

import com.billingapp.model.Business;
import com.billingapp.model.Customer;
import com.billingapp.model.Invoice;
import com.billingapp.model.InvoiceItem;
import com.billingapp.repository.BusinessRepository;
import com.billingapp.repository.CustomerRepository;
import com.billingapp.repository.InvoiceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final BusinessRepository businessRepository;
    private final CustomerRepository customerRepository;
    private final EmailService emailService;

    public InvoiceService(InvoiceRepository invoiceRepository,
                          BusinessRepository businessRepository,
                          CustomerRepository customerRepository,
                          EmailService emailService) {
        this.invoiceRepository = invoiceRepository;
        this.businessRepository = businessRepository;
        this.customerRepository = customerRepository;
        this.emailService = emailService;
    }

    public List<Invoice> getInvoicesByBusiness(Long businessId, String status, String search) {
        if (search != null && !search.trim().isEmpty()) {
            return invoiceRepository.searchInvoices(businessId, search.trim());
        }
        if (status != null && !status.trim().isEmpty() && !status.equalsIgnoreCase("ALL")) {
            return invoiceRepository.findByBusinessIdAndStatusOrderByCreatedAtDesc(businessId, status.toUpperCase());
        }
        return invoiceRepository.findByBusinessIdOrderByCreatedAtDesc(businessId);
    }

    public Invoice getInvoiceById(Long id) {
        return invoiceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Invoice not found with id: " + id));
    }

    public String generateNextInvoiceNumber(Long businessId) {
        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new RuntimeException("Business not found with id: " + businessId));

        String prefix = (business.getInvoicePrefix() != null && !business.getInvoicePrefix().trim().isEmpty())
                ? business.getInvoicePrefix().trim().toUpperCase()
                : "INV";

        int year = LocalDate.now().getYear();
        long count = invoiceRepository.countByBusinessId(businessId) + 1;

        return String.format("%s-%d-%04d", prefix, year, count);
    }

    @Transactional
    public Invoice createInvoice(Invoice invoice, Long businessId, Long customerId) {
        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new RuntimeException("Business not found with id: " + businessId));
        invoice.setBusiness(business);

        if (invoice.getCurrency() == null || invoice.getCurrency().isEmpty()) {
            invoice.setCurrency(business.getCurrency() != null ? business.getCurrency() : "₹");
        }

        if (customerId != null) {
            Customer customer = customerRepository.findById(customerId).orElse(null);
            if (customer != null) {
                invoice.setCustomer(customer);
                if (invoice.getCustomerName() == null || invoice.getCustomerName().isEmpty()) {
                    invoice.setCustomerName(customer.getName());
                }
                if (invoice.getCustomerPhone() == null || invoice.getCustomerPhone().isEmpty()) {
                    invoice.setCustomerPhone(customer.getPhone());
                }
                if (invoice.getCustomerEmail() == null || invoice.getCustomerEmail().isEmpty()) {
                    invoice.setCustomerEmail(customer.getEmail());
                }
                if (invoice.getCustomerAddress() == null || invoice.getCustomerAddress().isEmpty()) {
                    invoice.setCustomerAddress(customer.getBillingAddress());
                }
                if (invoice.getCustomerGstin() == null || invoice.getCustomerGstin().isEmpty()) {
                    invoice.setCustomerGstin(customer.getGstin());
                }
            }
        }

        if (invoice.getInvoiceNumber() == null || invoice.getInvoiceNumber().trim().isEmpty()) {
            invoice.setInvoiceNumber(generateNextInvoiceNumber(businessId));
        }

        recalculateInvoiceTotals(invoice);

        return invoiceRepository.save(invoice);
    }

    @Transactional
    public Invoice updateInvoice(Long id, Invoice updatedInvoice) {
        Invoice existing = getInvoiceById(id);

        existing.setCustomerName(updatedInvoice.getCustomerName());
        existing.setCustomerPhone(updatedInvoice.getCustomerPhone());
        existing.setCustomerEmail(updatedInvoice.getCustomerEmail());
        existing.setCustomerAddress(updatedInvoice.getCustomerAddress());
        existing.setCustomerGstin(updatedInvoice.getCustomerGstin());

        existing.setInvoiceDate(updatedInvoice.getInvoiceDate());
        existing.setDueDate(updatedInvoice.getDueDate());
        existing.setStatus(updatedInvoice.getStatus());
        existing.setPaymentMethod(updatedInvoice.getPaymentMethod());
        existing.setCurrency(updatedInvoice.getCurrency());
        existing.setTemplateTheme(updatedInvoice.getTemplateTheme());
        existing.setNotes(updatedInvoice.getNotes());
        existing.setTerms(updatedInvoice.getTerms());

        existing.setDiscountAmount(updatedInvoice.getDiscountAmount());
        existing.setShippingFee(updatedInvoice.getShippingFee());
        existing.setTaxRate(updatedInvoice.getTaxRate());
        existing.setPaidAmount(updatedInvoice.getPaidAmount());

        // Replace items
        existing.getItems().clear();
        if (updatedInvoice.getItems() != null) {
            for (InvoiceItem item : updatedInvoice.getItems()) {
                existing.addItem(item);
            }
        }

        recalculateInvoiceTotals(existing);

        return invoiceRepository.save(existing);
    }

    @Transactional
    public Invoice updateInvoiceStatus(Long id, String status) {
        Invoice invoice = getInvoiceById(id);
        invoice.setStatus(status.toUpperCase());
        if ("PAID".equalsIgnoreCase(status)) {
            invoice.setPaidAmount(invoice.getTotalAmount());
        }
        return invoiceRepository.save(invoice);
    }

    @Transactional
    public void deleteInvoice(Long id) {
        invoiceRepository.deleteById(id);
    }

    public void recalculateInvoiceTotals(Invoice invoice) {
        double subtotal = 0.0;

        if (invoice.getItems() != null) {
            for (InvoiceItem item : invoice.getItems()) {
                item.setInvoice(invoice);

                // Calculation logic:
                // If dimensional (width & height & nosSft exist), amount = width * height * nosSft * rate
                // Otherwise amount = quantity * rate
                double amount = 0.0;
                if (item.getWidth() != null && item.getWidth() > 0 &&
                    item.getHeight() != null && item.getHeight() > 0) {
                    double factor = (item.getNosSft() != null && item.getNosSft() > 0) ? item.getNosSft() : 1.0;
                    amount = item.getWidth() * item.getHeight() * factor * item.getRate();
                } else {
                    double qty = item.getQuantity() > 0 ? item.getQuantity() : 1.0;
                    amount = qty * item.getRate();
                }

                if (item.getDiscount() > 0) {
                    amount = Math.max(0, amount - item.getDiscount());
                }

                item.setAmount(Math.round(amount * 100.0) / 100.0);
                subtotal += item.getAmount();
            }
        }

        invoice.setSubtotal(Math.round(subtotal * 100.0) / 100.0);

        double taxRate = invoice.getTaxRate() >= 0 ? invoice.getTaxRate() : 0.0;
        double taxableSubtotal = Math.max(0, subtotal - invoice.getDiscountAmount());
        double taxAmount = (taxableSubtotal * taxRate) / 100.0;
        invoice.setTaxAmount(Math.round(taxAmount * 100.0) / 100.0);

        double grandTotal = taxableSubtotal + invoice.getTaxAmount() + invoice.getShippingFee();
        invoice.setTotalAmount(Math.round(grandTotal * 100.0) / 100.0);
    }

    @Transactional
    public java.util.Map<String, Object> sendInvoiceEmail(Long invoiceId, String recipientEmail, String subject, String message) {
        Invoice invoice = getInvoiceById(invoiceId);

        // Attempt real email delivery via SMTP EmailService
        java.util.Map<String, Object> emailRes = emailService.sendInvoiceEmail(invoice, recipientEmail, subject, message);

        boolean delivered = Boolean.TRUE.equals(emailRes.get("delivered"));
        if (delivered) {
            if (!"PAID".equalsIgnoreCase(invoice.getStatus())) {
                invoice.setStatus("SENT");
                invoiceRepository.save(invoice);
            }
        }
        emailRes.put("status", invoice.getStatus());
        emailRes.put("invoiceNumber", invoice.getInvoiceNumber());
        return emailRes;
    }
}

