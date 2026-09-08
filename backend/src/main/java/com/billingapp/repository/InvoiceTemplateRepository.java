package com.billingapp.repository;

import com.billingapp.model.InvoiceTemplate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InvoiceTemplateRepository
        extends JpaRepository<InvoiceTemplate, Long> {

    List<InvoiceTemplate> findByBusinessId(Long businessId);
}