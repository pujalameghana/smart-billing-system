package com.billingapp.controller;

import com.billingapp.model.Business;
import com.billingapp.model.User;
import com.billingapp.repository.BusinessRepository;
import com.billingapp.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/businesses")
@CrossOrigin(origins = "*")
public class BusinessController {

    private final BusinessRepository businessRepository;
    private final UserRepository userRepository;

    public BusinessController(BusinessRepository businessRepository, UserRepository userRepository) {
        this.businessRepository = businessRepository;
        this.userRepository = userRepository;
    }

    // Get businesses for current user or all if admin
    @GetMapping
    public List<Business> getBusinesses(Authentication authentication) {
        if (authentication != null && authentication.isAuthenticated() && !authentication.getName().equals("anonymousUser")) {
            boolean isAdmin = authentication.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
            if (isAdmin) {
                return businessRepository.findAll();
            }
            return businessRepository.findByOwnerUsername(authentication.getName());
        }
        return java.util.Collections.emptyList();
    }

    // Get one business
    @GetMapping("/{id}")
    public ResponseEntity<Business> getBusiness(@PathVariable Long id) {
        return businessRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Create business
    @PostMapping
    public Business createBusiness(@RequestBody Business business, Authentication authentication) {
        if (authentication != null && authentication.isAuthenticated() && !authentication.getName().equals("anonymousUser")) {
            userRepository.findByUsername(authentication.getName()).ifPresent(business::setOwner);
        }
        return businessRepository.save(business);
    }

    // Update business
    @PutMapping("/{id}")
    public ResponseEntity<Business> updateBusiness(
            @PathVariable Long id,
            @RequestBody Business business) {

        return businessRepository.findById(id)
                .map(existing -> {
                    existing.setName(business.getName());
                    existing.setLogo(business.getLogo());
                    existing.setAddress(business.getAddress());
                    existing.setGstin(business.getGstin());
                    existing.setPhone(business.getPhone());
                    existing.setEmail(business.getEmail());
                    existing.setWebsite(business.getWebsite());

                    if (business.getCurrency() != null) existing.setCurrency(business.getCurrency());
                    if (business.getBankName() != null) existing.setBankName(business.getBankName());
                    if (business.getAccountNumber() != null) existing.setAccountNumber(business.getAccountNumber());
                    if (business.getIfscCode() != null) existing.setIfscCode(business.getIfscCode());
                    if (business.getUpiId() != null) existing.setUpiId(business.getUpiId());
                    if (business.getTaxPercentage() != null) existing.setTaxPercentage(business.getTaxPercentage());
                    if (business.getInvoicePrefix() != null) existing.setInvoicePrefix(business.getInvoicePrefix());
                    if (business.getInvoiceTerms() != null) existing.setInvoiceTerms(business.getInvoiceTerms());
                    if (business.getNotes() != null) existing.setNotes(business.getNotes());

                    if (business.getSmtpHost() != null) existing.setSmtpHost(business.getSmtpHost());
                    if (business.getSmtpPort() != null) existing.setSmtpPort(business.getSmtpPort());
                    if (business.getSmtpUsername() != null) existing.setSmtpUsername(business.getSmtpUsername());
                    if (business.getSmtpPassword() != null) existing.setSmtpPassword(business.getSmtpPassword());
                    if (business.getSmtpFromEmail() != null) existing.setSmtpFromEmail(business.getSmtpFromEmail());

                    return ResponseEntity.ok(businessRepository.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // Delete business
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBusiness(@PathVariable Long id) {
        if (!businessRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        businessRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}