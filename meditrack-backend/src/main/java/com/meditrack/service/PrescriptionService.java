package com.meditrack.service;

import com.meditrack.entity.Prescription;
import com.meditrack.entity.Customer;
import com.meditrack.entity.User;
import com.meditrack.exception.ResourceNotFoundException;
import com.meditrack.repository.PrescriptionRepository;
import com.meditrack.repository.CustomerRepository;
import com.meditrack.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PrescriptionService {

    private final PrescriptionRepository prescriptionRepository;
    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;

    @Value("${app.upload.dir}")
    private String uploadDir;

    @Transactional
    public Prescription uploadPrescription(Long customerId, MultipartFile file) throws IOException {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        // Save file
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
        Path filePath = uploadPath.resolve(filename);
        Files.copy(file.getInputStream(), filePath);

        Prescription prescription = Prescription.builder()
                .customer(customer)
                .prescriptionImage(filename)
                .status(Prescription.PrescriptionStatus.PENDING)
                .build();

        return prescriptionRepository.save(prescription);
    }

    public Page<Prescription> getAllPrescriptions(Pageable pageable) {
        return prescriptionRepository.findAll(pageable);
    }

    public Page<Prescription> getCustomerPrescriptions(Long customerId, Pageable pageable) {
        return prescriptionRepository.findByCustomerId(customerId, pageable);
    }

    @Transactional
    public Prescription updateStatus(Long id, String status, String notes, String pharmacistEmail) {
        Prescription prescription = prescriptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Prescription not found"));

        User pharmacist = userRepository.findByEmail(pharmacistEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Pharmacist not found"));

        prescription.setStatus(Prescription.PrescriptionStatus.valueOf(status.toUpperCase()));
        prescription.setNotes(notes);
        prescription.setReviewedBy(pharmacist);
        prescription.setReviewedAt(LocalDateTime.now());

        return prescriptionRepository.save(prescription);
    }
}
