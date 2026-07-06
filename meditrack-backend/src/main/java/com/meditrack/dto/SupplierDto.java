package com.meditrack.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class SupplierDto {
    private Long id;

    @NotBlank(message = "Supplier name is required")
    private String supplierName;

    @NotBlank(message = "Company is required")
    private String company;

    @NotBlank(message = "Phone is required")
    private String phone;

    @NotBlank @Email(message = "Valid email is required")
    private String email;

    private String address;
    private boolean active;
    private String createdAt;
}
