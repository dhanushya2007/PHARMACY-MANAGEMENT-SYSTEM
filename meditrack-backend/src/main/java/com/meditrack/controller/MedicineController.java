package com.meditrack.controller;

import com.meditrack.dto.ApiResponse;
import com.meditrack.dto.MedicineDto;
import com.meditrack.service.MedicineService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/medicines")
@RequiredArgsConstructor
public class MedicineController {

    private final MedicineService medicineService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<MedicineDto>>> getAllMedicines(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "medicineName") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        PageRequest pageable = PageRequest.of(page, size, sort);
        return ResponseEntity.ok(ApiResponse.success(medicineService.searchMedicines(search, category, pageable)));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<Page<MedicineDto>>> searchMedicines(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success(
                medicineService.searchMedicines(q, category, PageRequest.of(page, size))));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<MedicineDto>> getMedicineById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(medicineService.getMedicineById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PHARMACIST')")
    public ResponseEntity<ApiResponse<MedicineDto>> createMedicine(
            @Valid @RequestBody MedicineDto dto, Authentication auth) {
        return ResponseEntity.ok(ApiResponse.success("Medicine created", medicineService.createMedicine(dto, auth.getName())));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PHARMACIST')")
    public ResponseEntity<ApiResponse<MedicineDto>> updateMedicine(
            @PathVariable Long id, @Valid @RequestBody MedicineDto dto, Authentication auth) {
        return ResponseEntity.ok(ApiResponse.success("Medicine updated", medicineService.updateMedicine(id, dto, auth.getName())));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteMedicine(@PathVariable Long id, Authentication auth) {
        medicineService.deleteMedicine(id, auth.getName());
        return ResponseEntity.ok(ApiResponse.success("Medicine deleted", null));
    }

    @GetMapping("/low-stock")
    public ResponseEntity<ApiResponse<List<MedicineDto>>> getLowStockMedicines() {
        return ResponseEntity.ok(ApiResponse.success(medicineService.getLowStockMedicines()));
    }

    @GetMapping("/expired")
    public ResponseEntity<ApiResponse<List<MedicineDto>>> getExpiredMedicines() {
        return ResponseEntity.ok(ApiResponse.success(medicineService.getExpiredMedicines()));
    }

    @GetMapping("/expiring-soon")
    public ResponseEntity<ApiResponse<List<MedicineDto>>> getExpiringSoon() {
        return ResponseEntity.ok(ApiResponse.success(medicineService.getExpiringSoon()));
    }

    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<List<String>>> getAllCategories() {
        return ResponseEntity.ok(ApiResponse.success(medicineService.getAllCategories()));
    }
}
