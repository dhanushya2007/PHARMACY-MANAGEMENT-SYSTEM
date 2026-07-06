package com.meditrack.service;

import com.itextpdf.text.*;
import com.itextpdf.text.pdf.*;
import com.meditrack.dto.SaleDto;
import com.meditrack.entity.Medicine;
import com.meditrack.entity.Sale;
import com.meditrack.repository.MedicineRepository;
import com.meditrack.repository.SaleRepository;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final SaleRepository saleRepository;
    private final MedicineRepository medicineRepository;

    public byte[] generateSalesReportPdf(LocalDateTime start, LocalDateTime end) throws DocumentException {
        List<Sale> sales = saleRepository.findBySaleDateBetween(start, end);

        Document document = new Document();
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        PdfWriter.getInstance(document, out);
        document.open();

        // Title
        com.itextpdf.text.Font titleFont = new com.itextpdf.text.Font(
                com.itextpdf.text.Font.FontFamily.HELVETICA, 18, com.itextpdf.text.Font.BOLD, BaseColor.DARK_GRAY);
        Paragraph title = new Paragraph("MediTrack - Sales Report", titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        document.add(title);
        document.add(new Paragraph("Period: " + start.toLocalDate() + " to " + end.toLocalDate()));
        document.add(Chunk.NEWLINE);

        // Table
        PdfPTable table = new PdfPTable(6);
        table.setWidthPercentage(100);
        String[] headers = {"Invoice No", "Customer", "Items", "Discount", "Tax", "Total"};
        for (String h : headers) {
            PdfPCell cell = new PdfPCell(new Phrase(h,
                    new com.itextpdf.text.Font(com.itextpdf.text.Font.FontFamily.HELVETICA, 10, com.itextpdf.text.Font.BOLD)));
            cell.setBackgroundColor(new BaseColor(21, 101, 192));
            cell.setPadding(5);
            table.addCell(cell);
        }

        for (Sale sale : sales) {
            table.addCell(sale.getInvoiceNumber());
            table.addCell(sale.getCustomerName() != null ? sale.getCustomerName() : "Walk-in");
            table.addCell(String.valueOf(sale.getSaleItems().size()));
            table.addCell("₹" + sale.getDiscountAmount());
            table.addCell("₹" + sale.getTaxAmount());
            table.addCell("₹" + sale.getTotalAmount());
        }

        document.add(table);
        document.close();
        return out.toByteArray();
    }

    public byte[] generateInventoryReportExcel() throws IOException {
        List<Medicine> medicines = medicineRepository.findAll();

        XSSFWorkbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Inventory Report");

        // Header row style
        CellStyle headerStyle = workbook.createCellStyle();
        Font headerFont = workbook.createFont();
        headerFont.setBold(true);
        headerFont.setFontHeightInPoints((short) 12);
        headerStyle.setFont(headerFont);
        headerStyle.setFillForegroundColor(IndexedColors.CORNFLOWER_BLUE.getIndex());
        headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

        Row headerRow = sheet.createRow(0);
        String[] columns = {"ID", "Name", "Generic Name", "Category", "Batch No", "Manufacturer",
                "Expiry Date", "Purchase Price", "Selling Price", "Quantity", "Min Stock", "Status"};
        for (int i = 0; i < columns.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(columns[i]);
            cell.setCellStyle(headerStyle);
        }

        int rowNum = 1;
        for (Medicine m : medicines) {
            Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue(m.getId());
            row.createCell(1).setCellValue(m.getMedicineName());
            row.createCell(2).setCellValue(m.getGenericName() != null ? m.getGenericName() : "");
            row.createCell(3).setCellValue(m.getCategory());
            row.createCell(4).setCellValue(m.getBatchNumber() != null ? m.getBatchNumber() : "");
            row.createCell(5).setCellValue(m.getManufacturer());
            row.createCell(6).setCellValue(m.getExpiryDate() != null ? m.getExpiryDate().toString() : "");
            row.createCell(7).setCellValue(m.getPurchasePrice().doubleValue());
            row.createCell(8).setCellValue(m.getSellingPrice().doubleValue());
            row.createCell(9).setCellValue(m.getQuantity());
            row.createCell(10).setCellValue(m.getMinimumStock());

            String status = m.getQuantity() == 0 ? "OUT OF STOCK" :
                    m.getQuantity() <= m.getMinimumStock() ? "LOW STOCK" :
                    m.getExpiryDate().isBefore(LocalDate.now()) ? "EXPIRED" : "AVAILABLE";
            row.createCell(11).setCellValue(status);
        }

        for (int i = 0; i < columns.length; i++) {
            sheet.autoSizeColumn(i);
        }

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        workbook.write(out);
        workbook.close();
        return out.toByteArray();
    }

    public byte[] generateInvoicePdf(SaleDto.SaleResponse sale) throws DocumentException {
        Document document = new Document();
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        PdfWriter.getInstance(document, out);
        document.open();

        com.itextpdf.text.Font titleFont = new com.itextpdf.text.Font(
                com.itextpdf.text.Font.FontFamily.HELVETICA, 20, com.itextpdf.text.Font.BOLD);
        Paragraph title = new Paragraph("MEDITRACK PHARMACY", titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        document.add(title);

        document.add(new Paragraph("Invoice No: " + sale.getInvoiceNumber()));
        document.add(new Paragraph("Customer: " + sale.getCustomerName()));
        document.add(new Paragraph("Date: " + sale.getSaleDate()));
        document.add(Chunk.NEWLINE);

        PdfPTable table = new PdfPTable(4);
        table.setWidthPercentage(100);
        String[] headers = {"Medicine", "Qty", "Unit Price", "Total"};
        for (String h : headers) {
            PdfPCell cell = new PdfPCell(new Phrase(h));
            cell.setBackgroundColor(new BaseColor(21, 101, 192));
            table.addCell(cell);
        }

        if (sale.getItems() != null) {
            for (SaleDto.SaleItemResponse item : sale.getItems()) {
                table.addCell(item.getMedicineName());
                table.addCell(String.valueOf(item.getQuantity()));
                table.addCell("₹" + item.getUnitPrice());
                table.addCell("₹" + item.getTotalPrice());
            }
        }

        document.add(table);
        document.add(Chunk.NEWLINE);
        document.add(new Paragraph("Discount: ₹" + sale.getDiscountAmount()));
        document.add(new Paragraph("Tax (GST): ₹" + sale.getTaxAmount()));

        com.itextpdf.text.Font totalFont = new com.itextpdf.text.Font(
                com.itextpdf.text.Font.FontFamily.HELVETICA, 14, com.itextpdf.text.Font.BOLD);
        document.add(new Paragraph("TOTAL: ₹" + sale.getTotalAmount(), totalFont));
        document.add(Chunk.NEWLINE);
        document.add(new Paragraph("Thank you for your purchase!", new com.itextpdf.text.Font(
                com.itextpdf.text.Font.FontFamily.HELVETICA, 10, com.itextpdf.text.Font.ITALIC)));

        document.close();
        return out.toByteArray();
    }
}
