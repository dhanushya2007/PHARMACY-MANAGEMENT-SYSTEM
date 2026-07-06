package com.meditrack.service;

import com.meditrack.dto.MedicineDto;
import com.meditrack.entity.Medicine;
import com.meditrack.entity.Supplier;
import com.meditrack.exception.BadRequestException;
import com.meditrack.exception.ResourceNotFoundException;
import com.meditrack.repository.MedicineRepository;
import com.meditrack.repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MedicineService {

    private final MedicineRepository medicineRepository;
    private final SupplierRepository supplierRepository;
    private final ModelMapper modelMapper;
    private final AuditLogService auditLogService;

    public Page<MedicineDto> searchMedicines(String search, String category, Pageable pageable) {
        return medicineRepository.searchMedicines(search, category, pageable)
                .map(this::toDto);
    }

    public MedicineDto getMedicineById(Long id) {
        return toDto(findById(id));
    }

    @Transactional
    public MedicineDto createMedicine(MedicineDto dto, String createdBy) {
        Medicine medicine = toEntity(dto);
        if (dto.getSupplierId() != null) {
            Supplier supplier = supplierRepository.findById(dto.getSupplierId())
                    .orElseThrow(() -> new ResourceNotFoundException("Supplier not found"));
            medicine.setSupplier(supplier);
        }
        medicine = medicineRepository.save(medicine);
        auditLogService.log(createdBy, "CREATE", "Medicine", medicine.getId(),
                "Created medicine: " + medicine.getMedicineName());
        return toDto(medicine);
    }

    @Transactional
    public MedicineDto updateMedicine(Long id, MedicineDto dto, String updatedBy) {
        Medicine medicine = findById(id);
        modelMapper.map(dto, medicine);
        medicine.setId(id);
        if (dto.getSupplierId() != null) {
            Supplier supplier = supplierRepository.findById(dto.getSupplierId())
                    .orElseThrow(() -> new ResourceNotFoundException("Supplier not found"));
            medicine.setSupplier(supplier);
        }
        medicine = medicineRepository.save(medicine);
        auditLogService.log(updatedBy, "UPDATE", "Medicine", medicine.getId(),
                "Updated medicine: " + medicine.getMedicineName());
        return toDto(medicine);
    }

    @Transactional
    public void deleteMedicine(Long id, String deletedBy) {
        Medicine medicine = findById(id);
        auditLogService.log(deletedBy, "DELETE", "Medicine", id,
                "Deleted medicine: " + medicine.getMedicineName());
        medicineRepository.deleteById(id);
    }

    public List<MedicineDto> getLowStockMedicines() {
        return medicineRepository.findLowStockMedicines().stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<MedicineDto> getExpiredMedicines() {
        return medicineRepository.findExpiredMedicines(LocalDate.now()).stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<MedicineDto> getExpiringSoon() {
        return medicineRepository.findExpiringSoon(LocalDate.now(), LocalDate.now().plusDays(30))
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<String> getAllCategories() {
        return medicineRepository.findAllCategories();
    }

    private Medicine findById(Long id) {
        return medicineRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medicine not found with id: " + id));
    }

    private MedicineDto toDto(Medicine medicine) {
        MedicineDto dto = modelMapper.map(medicine, MedicineDto.class);
        if (medicine.getSupplier() != null) {
            dto.setSupplierId(medicine.getSupplier().getId());
            dto.setSupplierName(medicine.getSupplier().getSupplierName());
        }
        return dto;
    }

    private Medicine toEntity(MedicineDto dto) {
        return modelMapper.map(dto, Medicine.class);
    }
}
