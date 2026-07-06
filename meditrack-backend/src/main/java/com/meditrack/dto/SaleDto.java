package com.meditrack.dto;

import com.meditrack.entity.Sale;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

public class SaleDto {

    @Data
    public static class CreateSaleRequest {
        private Long customerId;
        private String customerName;

        @NotEmpty(message = "Sale must have at least one item")
        private List<SaleItemRequest> items;

        @NotNull
        private Sale.PaymentMethod paymentMethod;

        private BigDecimal discountPercent = BigDecimal.ZERO;
        private BigDecimal taxPercent = BigDecimal.ZERO;
    }

    @Data
    public static class SaleItemRequest {
        @NotNull
        private Long medicineId;
        @NotNull
        private Integer quantity;
    }

    @Data
    public static class SaleResponse {
        private Long id;
        private String invoiceNumber;
        private String customerName;
        private List<SaleItemResponse> items;
        private BigDecimal subtotal;
        private BigDecimal discountAmount;
        private BigDecimal taxAmount;
        private BigDecimal totalAmount;
        private String paymentMethod;
        private String status;
        private String saleDate;
        private String pharmacistName;
    }

    @Data
    public static class SaleItemResponse {
        private Long medicineId;
        private String medicineName;
        private Integer quantity;
        private BigDecimal unitPrice;
        private BigDecimal totalPrice;
    }
}
