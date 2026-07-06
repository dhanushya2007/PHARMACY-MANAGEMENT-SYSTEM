package com.meditrack.repository;

import com.meditrack.entity.Prescription;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PrescriptionRepository extends JpaRepository<Prescription, Long> {
    Page<Prescription> findByCustomerId(Long customerId, Pageable pageable);
    Page<Prescription> findByStatus(Prescription.PrescriptionStatus status, Pageable pageable);
    long countByStatus(Prescription.PrescriptionStatus status);
}
