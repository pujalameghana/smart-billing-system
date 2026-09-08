package com.billingapp.repository;

import com.billingapp.model.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    List<Invoice> findByBusinessIdOrderByCreatedAtDesc(Long businessId);

    List<Invoice> findByBusinessIdAndStatusOrderByCreatedAtDesc(Long businessId, String status);

    @Query("SELECT i FROM Invoice i WHERE i.business.id = :businessId AND " +
           "(LOWER(i.invoiceNumber) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(i.customerName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(i.customerPhone) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "ORDER BY i.createdAt DESC")
    List<Invoice> searchInvoices(@Param("businessId") Long businessId, @Param("search") String search);

    Optional<Invoice> findTopByBusinessIdOrderByIdDesc(Long businessId);

    long countByBusinessId(Long businessId);

    long countByBusinessIdAndStatus(Long businessId, String status);

    @Query("SELECT COALESCE(SUM(i.totalAmount), 0.0) FROM Invoice i WHERE i.business.id = :businessId AND i.status = 'PAID'")
    Double calculateTotalRevenueByBusinessId(@Param("businessId") Long businessId);

    @Query("SELECT COALESCE(SUM(i.totalAmount), 0.0) FROM Invoice i WHERE i.business.id = :businessId AND i.status IN ('SENT', 'OVERDUE', 'DRAFT')")
    Double calculatePendingAmountByBusinessId(@Param("businessId") Long businessId);

    List<Invoice> findTop5ByBusinessIdOrderByCreatedAtDesc(Long businessId);
}
