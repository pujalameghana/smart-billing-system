package com.billingapp.controller;

import com.billingapp.model.Business;
import com.billingapp.model.User;
import com.billingapp.repository.BusinessRepository;
import com.billingapp.repository.InvoiceRepository;
import com.billingapp.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    private final UserRepository userRepository;
    private final BusinessRepository businessRepository;
    private final InvoiceRepository invoiceRepository;

    public AdminController(UserRepository userRepository,
                           BusinessRepository businessRepository,
                           InvoiceRepository invoiceRepository) {
        this.userRepository = userRepository;
        this.businessRepository = businessRepository;
        this.invoiceRepository = invoiceRepository;
    }

    private boolean isAdmin(Authentication authentication) {
        if (authentication == null) return false;
        return authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
    }

    @GetMapping("/overview")
    public ResponseEntity<?> getPlatformOverview(Authentication authentication) {
        if (!isAdmin(authentication)) {
            return ResponseEntity.status(403).body("Access Denied: Platform Administrator only.");
        }

        long totalUsers = userRepository.count();
        long totalBusinesses = businessRepository.count();
        long totalInvoices = invoiceRepository.count();

        Double totalPlatformRevenue = invoiceRepository.findAll().stream()
                .filter(i -> "PAID".equalsIgnoreCase(i.getStatus()))
                .mapToDouble(i -> i.getTotalAmount())
                .sum();

        Map<String, Object> response = new HashMap<>();
        response.put("totalUsers", totalUsers);
        response.put("totalBusinesses", totalBusinesses);
        response.put("totalInvoices", totalInvoices);
        response.put("totalPlatformRevenue", totalPlatformRevenue);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers(Authentication authentication) {
        if (!isAdmin(authentication)) {
            return ResponseEntity.status(403).body("Access Denied: Platform Administrator only.");
        }

        List<User> users = userRepository.findAll();
        List<Map<String, Object>> result = new ArrayList<>();

        for (User u : users) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", u.getId());
            map.put("username", u.getUsername());
            map.put("email", u.getEmail());
            map.put("fullName", u.getFullName());
            map.put("role", u.getRole());
            map.put("authProvider", u.getAuthProvider());
            map.put("createdAt", u.getCreatedAt());

            List<Business> userBusinesses = businessRepository.findByOwnerId(u.getId());
            List<String> businessNames = userBusinesses.stream().map(Business::getName).toList();
            map.put("businesses", businessNames);
            map.put("businessCount", userBusinesses.size());

            result.add(map);
        }

        return ResponseEntity.ok(result);
    }

    @GetMapping("/businesses")
    public ResponseEntity<?> getAllBusinesses(Authentication authentication) {
        if (!isAdmin(authentication)) {
            return ResponseEntity.status(403).body("Access Denied: Platform Administrator only.");
        }

        List<Business> businesses = businessRepository.findAll();
        List<Map<String, Object>> result = new ArrayList<>();

        for (Business b : businesses) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", b.getId());
            map.put("name", b.getName());
            map.put("email", b.getEmail());
            map.put("phone", b.getPhone());
            map.put("gstin", b.getGstin());
            map.put("currency", b.getCurrency());
            map.put("ownerName", b.getOwner() != null ? b.getOwner().getFullName() : "Admin");
            map.put("ownerEmail", b.getOwner() != null ? b.getOwner().getEmail() : "N/A");

            long invoiceCount = invoiceRepository.countByBusinessId(b.getId());
            Double rev = invoiceRepository.calculateTotalRevenueByBusinessId(b.getId());
            map.put("invoiceCount", invoiceCount);
            map.put("revenue", rev != null ? rev : 0.0);

            result.add(map);
        }

        return ResponseEntity.ok(result);
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id, Authentication authentication) {
        if (!isAdmin(authentication)) {
            return ResponseEntity.status(403).body("Access Denied: Platform Administrator only.");
        }

        if (!userRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }

        userRepository.deleteById(id);
        return ResponseEntity.ok("User deleted successfully.");
    }
}
