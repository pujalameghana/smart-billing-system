package com.billingapp.controller;

import com.billingapp.model.Business;
import com.billingapp.model.Customer;
import com.billingapp.repository.BusinessRepository;
import com.billingapp.repository.CustomerRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customers")
@CrossOrigin(origins = "*")
public class CustomerController {

    private final CustomerRepository customerRepository;
    private final BusinessRepository businessRepository;

    public CustomerController(CustomerRepository customerRepository, BusinessRepository businessRepository) {
        this.customerRepository = customerRepository;
        this.businessRepository = businessRepository;
    }

    @GetMapping("/business/{businessId}")
    public List<Customer> getCustomersByBusiness(@PathVariable Long businessId,
                                                 @RequestParam(required = false) String search) {
        if (search != null && !search.trim().isEmpty()) {
            return customerRepository.findByBusinessIdAndNameContainingIgnoreCase(businessId, search.trim());
        }
        return customerRepository.findByBusinessIdOrderByNameAsc(businessId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Customer> getCustomerById(@PathVariable Long id) {
        return customerRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/business/{businessId}")
    public ResponseEntity<Customer> createCustomer(@PathVariable Long businessId,
                                                   @RequestBody Customer customer) {
        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new RuntimeException("Business not found with id: " + businessId));

        customer.setBusiness(business);
        return ResponseEntity.ok(customerRepository.save(customer));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Customer> updateCustomer(@PathVariable Long id,
                                                   @RequestBody Customer customerDetails) {
        return customerRepository.findById(id)
                .map(existing -> {
                    existing.setName(customerDetails.getName());
                    existing.setEmail(customerDetails.getEmail());
                    existing.setPhone(customerDetails.getPhone());
                    existing.setCompanyName(customerDetails.getCompanyName());
                    existing.setBillingAddress(customerDetails.getBillingAddress());
                    existing.setShippingAddress(customerDetails.getShippingAddress());
                    existing.setGstin(customerDetails.getGstin());
                    return ResponseEntity.ok(customerRepository.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCustomer(@PathVariable Long id) {
        if (!customerRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        customerRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
