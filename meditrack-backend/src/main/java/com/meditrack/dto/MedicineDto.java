package com.meditrack.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class MedicineDto {

    private Long id;

    @NotBlank(message = "Medicine name is required")
    private String medicineName;

    private String genericName;

    @NotBlank(message = "Category is required")
    private String category;

    private String brand;

    private String batchNumber;

    @NotBlank(message = "Manufacturer is required")
    private String manufacturer;

    private LocalDate manufacturingDate;

    @NotNull(message = "Expiry date is required")
    @Future(message = "Expiry date must be in the future")
    private LocalDate expiryDate;

    @NotNull @DecimalMin("0.01")
    private BigDecimal purchasePrice;

    @NotNull @DecimalMin("0.01")
    private BigDecimal sellingPrice;

    @NotNull @Min(0)
    private Integer quantity;

    @Min(0)
    private Integer minimumStock = 10;

    private String description;
    private String barcode;
    private Long supplierId;
    private String supplierName;
    private String createdAt;
    private String updatedAt;
}
