package com.meditrack.repository;

import com.meditrack.entity.Sale;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface SaleRepository extends JpaRepository<Sale, Long> {

    Optional<Sale> findByInvoiceNumber(String invoiceNumber);

    Page<Sale> findByCustomerId(Long customerId, Pageable pageable);

    Page<Sale> findByPharmacistId(Long pharmacistId, Pageable pageable);

    @Query("SELECT s FROM Sale s WHERE s.saleDate BETWEEN :start AND :end")
    List<Sale> findBySaleDateBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT COALESCE(SUM(s.totalAmount), 0) FROM Sale s WHERE s.saleDate BETWEEN :start AND :end")
    BigDecimal sumTotalAmountBetween(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT COUNT(s) FROM Sale s WHERE DATE(s.saleDate) = CURRENT_DATE")
    long countTodaySales();

    @Query("SELECT COALESCE(SUM(s.totalAmount), 0) FROM Sale s WHERE DATE(s.saleDate) = CURRENT_DATE")
    BigDecimal sumTodaySales();

    @Query("SELECT COALESCE(SUM(s.totalAmount), 0) FROM Sale s WHERE MONTH(s.saleDate) = MONTH(CURRENT_DATE) AND YEAR(s.saleDate) = YEAR(CURRENT_DATE)")
    BigDecimal sumMonthlyRevenue();

    @Query("SELECT MONTH(s.saleDate) as month, COALESCE(SUM(s.totalAmount), 0) as total FROM Sale s WHERE YEAR(s.saleDate) = :year GROUP BY MONTH(s.saleDate) ORDER BY MONTH(s.saleDate)")
    List<Object[]> findMonthlySales(@Param("year") int year);

    long countByCustomerId(Long customerId);
}
