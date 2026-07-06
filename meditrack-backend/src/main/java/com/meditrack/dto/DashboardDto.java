package com.meditrack.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardDto {

    // Admin Dashboard
    private Long totalMedicines;
    private Long totalSuppliers;
    private Long totalCustomers;
    private Long totalUsers;
    private Long lowStockCount;
    private Long expiredCount;
    private Long outOfStockCount;
    private Long pendingPrescriptions;

    private BigDecimal todaySales;
    private BigDecimal monthlyRevenue;
    private BigDecimal totalRevenue;
    private Long todaySaleCount;

    private List<Map<String, Object>> monthlySalesChart;
    private List<Map<String, Object>> categoryDistribution;
    private List<MedicineDto> lowStockMedicines;
    private List<MedicineDto> expiredMedicines;
}
