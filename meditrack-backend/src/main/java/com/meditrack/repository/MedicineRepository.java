package com.meditrack.repository;

import com.meditrack.entity.Medicine;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface MedicineRepository extends JpaRepository<Medicine, Long> {

    Page<Medicine> findByMedicineNameContainingIgnoreCaseOrGenericNameContainingIgnoreCase(
            String name, String genericName, Pageable pageable);

    Page<Medicine> findByCategoryIgnoreCase(String category, Pageable pageable);

    @Query("SELECT m FROM Medicine m WHERE m.quantity <= m.minimumStock AND m.quantity > 0")
    List<Medicine> findLowStockMedicines();

    @Query("SELECT m FROM Medicine m WHERE m.quantity = 0")
    List<Medicine> findOutOfStockMedicines();

    @Query("SELECT m FROM Medicine m WHERE m.expiryDate <= :date")
    List<Medicine> findExpiredMedicines(@Param("date") LocalDate date);

    @Query("SELECT m FROM Medicine m WHERE m.expiryDate BETWEEN :today AND :thirtyDays")
    List<Medicine> findExpiringSoon(@Param("today") LocalDate today, @Param("thirtyDays") LocalDate thirtyDays);

    @Query("SELECT DISTINCT m.category FROM Medicine m ORDER BY m.category")
    List<String> findAllCategories();

    long countByCategory(String category);

    @Query("SELECT COUNT(m) FROM Medicine m WHERE m.expiryDate < :today")
    long countExpiredMedicines(@Param("today") LocalDate today);

    @Query("SELECT COUNT(m) FROM Medicine m WHERE m.quantity <= m.minimumStock")
    long countLowStockMedicines();

    Page<Medicine> findByExpiryDateBefore(LocalDate date, Pageable pageable);

    @Query("SELECT m FROM Medicine m WHERE " +
            "(:search IS NULL OR LOWER(m.medicineName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(m.genericName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(m.batchNumber) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
            "(:category IS NULL OR LOWER(m.category) = LOWER(:category))")
    Page<Medicine> searchMedicines(@Param("search") String search,
                                    @Param("category") String category,
                                    Pageable pageable);
}
