package com.meditrack.service;

import com.meditrack.dto.SaleDto;
import com.meditrack.entity.*;
import com.meditrack.exception.BadRequestException;
import com.meditrack.exception.ResourceNotFoundException;
import com.meditrack.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SaleService {

    private final SaleRepository saleRepository;
    private final SaleItemRepository saleItemRepository;
    private final MedicineRepository medicineRepository;
    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;

    @Transactional
    public SaleDto.SaleResponse createSale(SaleDto.CreateSaleRequest request, String pharmacistEmail) {
        User pharmacist = userRepository.findByEmail(pharmacistEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Pharmacist not found"));

        Sale sale = new Sale();
        sale.setInvoiceNumber(generateInvoiceNumber());
        sale.setPaymentMethod(request.getPaymentMethod());
        sale.setPharmacist(pharmacist);

        if (request.getCustomerId() != null) {
            Customer customer = customerRepository.findById(request.getCustomerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
            sale.setCustomer(customer);
            sale.setCustomerName(customer.getName());
        } else {
            sale.setCustomerName(request.getCustomerName() != null ? request.getCustomerName() : "Walk-in Customer");
        }

        List<SaleItem> saleItems = new ArrayList<>();
        BigDecimal subtotal = BigDecimal.ZERO;

        for (SaleDto.SaleItemRequest itemReq : request.getItems()) {
            Medicine medicine = medicineRepository.findById(itemReq.getMedicineId())
                    .orElseThrow(() -> new ResourceNotFoundException("Medicine not found: " + itemReq.getMedicineId()));

            if (medicine.getQuantity() < itemReq.getQuantity()) {
                throw new BadRequestException("Insufficient stock for: " + medicine.getMedicineName() +
                        ". Available: " + medicine.getQuantity());
            }

            // Deduct stock
            medicine.setQuantity(medicine.getQuantity() - itemReq.getQuantity());
            medicineRepository.save(medicine);

            BigDecimal itemTotal = medicine.getSellingPrice().multiply(BigDecimal.valueOf(itemReq.getQuantity()));
            subtotal = subtotal.add(itemTotal);

            SaleItem saleItem = SaleItem.builder()
                    .sale(sale)
                    .medicine(medicine)
                    .quantity(itemReq.getQuantity())
                    .unitPrice(medicine.getSellingPrice())
                    .totalPrice(itemTotal)
                    .build();
            saleItems.add(saleItem);
        }

        // Calculate discount and tax
        BigDecimal discountPercent = request.getDiscountPercent() != null ? request.getDiscountPercent() : BigDecimal.ZERO;
        BigDecimal taxPercent = request.getTaxPercent() != null ? request.getTaxPercent() : BigDecimal.ZERO;

        BigDecimal discountAmount = subtotal.multiply(discountPercent).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        BigDecimal afterDiscount = subtotal.subtract(discountAmount);
        BigDecimal taxAmount = afterDiscount.multiply(taxPercent).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        BigDecimal total = afterDiscount.add(taxAmount);

        sale.setDiscountAmount(discountAmount);
        sale.setTaxAmount(taxAmount);
        sale.setTotalAmount(total);
        sale.setSaleItems(saleItems);

        sale = saleRepository.save(sale);
        return toResponse(sale, subtotal);
    }

    public Page<SaleDto.SaleResponse> getAllSales(Pageable pageable) {
        return saleRepository.findAll(pageable).map(s -> toResponse(s, null));
    }

    public Page<SaleDto.SaleResponse> getSalesByCustomer(Long customerId, Pageable pageable) {
        return saleRepository.findByCustomerId(customerId, pageable).map(s -> toResponse(s, null));
    }

    public SaleDto.SaleResponse getSaleById(Long id) {
        Sale sale = saleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sale not found"));
        return toResponse(sale, null);
    }

    private String generateInvoiceNumber() {
        return "INV-" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd")) +
                "-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();
    }

    private SaleDto.SaleResponse toResponse(Sale sale, BigDecimal subtotal) {
        SaleDto.SaleResponse response = new SaleDto.SaleResponse();
        response.setId(sale.getId());
        response.setInvoiceNumber(sale.getInvoiceNumber());
        response.setCustomerName(sale.getCustomerName());
        response.setDiscountAmount(sale.getDiscountAmount());
        response.setTaxAmount(sale.getTaxAmount());
        response.setTotalAmount(sale.getTotalAmount());
        response.setPaymentMethod(sale.getPaymentMethod() != null ? sale.getPaymentMethod().name() : null);
        response.setStatus(sale.getStatus() != null ? sale.getStatus().name() : null);
        response.setSaleDate(sale.getSaleDate() != null ? sale.getSaleDate().toString() : null);
        if (sale.getPharmacist() != null) response.setPharmacistName(sale.getPharmacist().getName());

        List<SaleDto.SaleItemResponse> items = sale.getSaleItems().stream().map(item -> {
            SaleDto.SaleItemResponse ir = new SaleDto.SaleItemResponse();
            ir.setMedicineId(item.getMedicine().getId());
            ir.setMedicineName(item.getMedicine().getMedicineName());
            ir.setQuantity(item.getQuantity());
            ir.setUnitPrice(item.getUnitPrice());
            ir.setTotalPrice(item.getTotalPrice());
            return ir;
        }).collect(Collectors.toList());

        response.setItems(items);
        if (subtotal != null) response.setSubtotal(subtotal);
        return response;
    }
}
