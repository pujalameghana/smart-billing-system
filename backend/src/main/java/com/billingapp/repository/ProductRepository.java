package com.billingapp.repository;

import com.billingapp.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByBusinessIdOrderByNameAsc(Long businessId);
    List<Product> findByBusinessIdOrBusinessIsNullOrderByNameAsc(Long businessId);
    long countByBusinessId(Long businessId);
}
