package com.meditrack.controller;

import com.meditrack.dto.SaleDto;
import com.meditrack.service.ReportService;
import com.meditrack.service.SaleService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'PHARMACIST')")
public class ReportController {

    private final ReportService reportService;
    private final SaleService saleService;

    @GetMapping("/sales/pdf")
    public ResponseEntity<byte[]> downloadSalesReportPdf(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) throws Exception {
        byte[] bytes = reportService.generateSalesReportPdf(start, end);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=sales-report.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(bytes);
    }

    @GetMapping("/inventory/excel")
    public ResponseEntity<byte[]> downloadInventoryExcel() throws Exception {
        byte[] bytes = reportService.generateInventoryReportExcel();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=inventory-report.xlsx")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(bytes);
    }

    @GetMapping("/invoice/{saleId}/pdf")
    public ResponseEntity<byte[]> downloadInvoicePdf(@PathVariable Long saleId) throws Exception {
        SaleDto.SaleResponse sale = saleService.getSaleById(saleId);
        byte[] bytes = reportService.generateInvoicePdf(sale);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=invoice-" + sale.getInvoiceNumber() + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(bytes);
    }
}
