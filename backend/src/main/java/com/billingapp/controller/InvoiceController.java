package com.billingapp.controller;

import com.billingapp.model.Invoice;
import com.billingapp.service.InvoiceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/invoices")
@CrossOrigin(origins = "*")
public class InvoiceController {

    private final InvoiceService invoiceService;

    public InvoiceController(InvoiceService invoiceService) {
        this.invoiceService = invoiceService;
    }

    @GetMapping("/business/{businessId}")
    public List<Invoice> getInvoicesByBusiness(@PathVariable Long businessId,
                                               @RequestParam(required = false) String status,
                                               @RequestParam(required = false) String search) {
        return invoiceService.getInvoicesByBusiness(businessId, status, search);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Invoice> getInvoiceById(@PathVariable Long id) {
        return ResponseEntity.ok(invoiceService.getInvoiceById(id));
    }

    @GetMapping("/next-number/{businessId}")
    public Map<String, String> getNextInvoiceNumber(@PathVariable Long businessId) {
        String nextNumber = invoiceService.generateNextInvoiceNumber(businessId);
        return Collections.singletonMap("invoiceNumber", nextNumber);
    }

    @PostMapping("/business/{businessId}")
    public ResponseEntity<Invoice> createInvoice(@PathVariable Long businessId,
                                                 @RequestParam(required = false) Long customerId,
                                                 @RequestBody Invoice invoice) {
        Invoice created = invoiceService.createInvoice(invoice, businessId, customerId);
        return ResponseEntity.ok(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Invoice> updateInvoice(@PathVariable Long id,
                                                 @RequestBody Invoice invoice) {
        Invoice updated = invoiceService.updateInvoice(id, invoice);
        return ResponseEntity.ok(updated);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Invoice> updateStatus(@PathVariable Long id,
                                                @RequestBody Map<String, String> statusBody) {
        String status = statusBody.get("status");
        if (status == null || status.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        Invoice updated = invoiceService.updateInvoiceStatus(id, status.trim());
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInvoice(@PathVariable Long id) {
        invoiceService.deleteInvoice(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/send-email")
    public ResponseEntity<?> sendInvoiceEmail(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        String recipientEmail = payload.get("recipientEmail");
        String subject = payload.get("subject");
        String message = payload.get("message");
        Map<String, Object> res = invoiceService.sendInvoiceEmail(id, recipientEmail, subject, message);
        return ResponseEntity.ok(res);
    }
}
