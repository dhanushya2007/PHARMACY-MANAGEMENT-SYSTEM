package com.meditrack.repository;

import com.meditrack.entity.Supplier;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SupplierRepository extends JpaRepository<Supplier, Long> {
    boolean existsByEmail(String email);
    Page<Supplier> findBySupplierNameContainingIgnoreCase(String name, Pageable pageable);
}
