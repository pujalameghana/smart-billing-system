package com.billingapp.repository;

import com.billingapp.model.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {
    List<Customer> findByBusinessIdOrderByNameAsc(Long businessId);
    List<Customer> findByBusinessIdAndNameContainingIgnoreCase(Long businessId, String name);
    long countByBusinessId(Long businessId);
}
