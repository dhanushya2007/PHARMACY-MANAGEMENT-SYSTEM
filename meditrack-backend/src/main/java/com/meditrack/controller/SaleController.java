package com.meditrack.controller;

import com.meditrack.dto.ApiResponse;
import com.meditrack.dto.SaleDto;
import com.meditrack.service.SaleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/sales")
@RequiredArgsConstructor
public class SaleController {

    private final SaleService saleService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PHARMACIST')")
    public ResponseEntity<ApiResponse<SaleDto.SaleResponse>> createSale(
            @Valid @RequestBody SaleDto.CreateSaleRequest request, Authentication auth) {
        return ResponseEntity.ok(ApiResponse.success("Sale created", saleService.createSale(request, auth.getName())));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PHARMACIST')")
    public ResponseEntity<ApiResponse<Page<SaleDto.SaleResponse>>> getAllSales(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success(
                saleService.getAllSales(PageRequest.of(page, size, Sort.by("saleDate").descending()))));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SaleDto.SaleResponse>> getSaleById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(saleService.getSaleById(id)));
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<ApiResponse<Page<SaleDto.SaleResponse>>> getSalesByCustomer(
            @PathVariable Long customerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success(
                saleService.getSalesByCustomer(customerId, PageRequest.of(page, size, Sort.by("saleDate").descending()))));
    }
}
