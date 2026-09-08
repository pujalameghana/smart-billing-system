package com.billingapp.controller;

import com.billingapp.model.Business;
import com.billingapp.model.InvoiceTemplate;
import com.billingapp.repository.BusinessRepository;
import com.billingapp.repository.InvoiceTemplateRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/templates")
@CrossOrigin(origins = "*")
public class InvoiceTemplateController {

    private final InvoiceTemplateRepository templateRepository;
    private final BusinessRepository businessRepository;

    public InvoiceTemplateController(
            InvoiceTemplateRepository templateRepository,
            BusinessRepository businessRepository) {

        this.templateRepository = templateRepository;
        this.businessRepository = businessRepository;
    }

    // Get all templates
    @GetMapping
    public List<InvoiceTemplate> getAllTemplates() {
        return templateRepository.findAll();
    }

    // Get templates for a particular business
    @GetMapping("/business/{businessId}")
    public List<InvoiceTemplate> getTemplatesByBusiness(
            @PathVariable Long businessId) {

        return templateRepository.findByBusinessId(businessId);
    }

    // Get one template
    @GetMapping("/{id}")
    public ResponseEntity<InvoiceTemplate> getTemplate(@PathVariable Long id) {
        return templateRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Create a new template
    @PostMapping("/business/{businessId}")
    public InvoiceTemplate createTemplate(
            @PathVariable Long businessId,
            @RequestBody InvoiceTemplate template) {

        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new RuntimeException("Business not found"));

        template.setBusiness(business);
        return templateRepository.save(template);
    }

    // Update a template
    @PutMapping("/{id}")
    public ResponseEntity<InvoiceTemplate> updateTemplate(
            @PathVariable Long id,
            @RequestBody InvoiceTemplate template) {

        return templateRepository.findById(id)
                .map(existing -> {
                    existing.setTemplateName(template.getTemplateName());
                    if (template.getTheme() != null) existing.setTheme(template.getTheme());
                    if (template.getPrimaryColor() != null) existing.setPrimaryColor(template.getPrimaryColor());

                    existing.setShowLogo(template.isShowLogo());
                    existing.setShowBusinessName(template.isShowBusinessName());
                    existing.setShowAddress(template.isShowAddress());
                    existing.setShowGstin(template.isShowGstin());
                    existing.setShowPhone(template.isShowPhone());
                    existing.setShowEmail(template.isShowEmail());
                    existing.setShowWebsite(template.isShowWebsite());

                    existing.setShowCustomerName(template.isShowCustomerName());
                    existing.setShowCustomerPhone(template.isShowCustomerPhone());
                    existing.setShowCustomerAddress(template.isShowCustomerAddress());

                    existing.setShowProduct(template.isShowProduct());
                    existing.setShowQuantity(template.isShowQuantity());
                    existing.setShowRate(template.isShowRate());
                    existing.setShowAmount(template.isShowAmount());

                    existing.setShowTotal(template.isShowTotal());
                    existing.setShowTaxBreakdown(template.isShowTaxBreakdown());
                    existing.setShowBankDetails(template.isShowBankDetails());
                    existing.setShowSignature(template.isShowSignature());

                    return ResponseEntity.ok(templateRepository.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // Delete a template
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTemplate(@PathVariable Long id) {
        if (!templateRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        templateRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}