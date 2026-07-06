package com.meditrack.service;

import com.meditrack.dto.DashboardDto;
import com.meditrack.dto.MedicineDto;
import com.meditrack.repository.*;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Year;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final MedicineRepository medicineRepository;
    private final SupplierRepository supplierRepository;
    private final CustomerRepository customerRepository;
    private final SaleRepository saleRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final UserRepository userRepository;
    private final ModelMapper modelMapper;

    public DashboardDto getAdminDashboard() {
        int currentYear = Year.now().getValue();

        List<Map<String, Object>> monthlySales = new ArrayList<>();
        List<Object[]> rawMonthlySales = saleRepository.findMonthlySales(currentYear);
        for (Object[] row : rawMonthlySales) {
            Map<String, Object> entry = new HashMap<>();
            entry.put("month", row[0]);
            entry.put("total", row[1]);
            monthlySales.add(entry);
        }

        // Category distribution
        List<String> categories = medicineRepository.findAllCategories();
        List<Map<String, Object>> categoryDist = categories.stream().map(cat -> {
            Map<String, Object> m = new HashMap<>();
            m.put("category", cat);
            m.put("count", medicineRepository.countByCategory(cat));
            return m;
        }).collect(Collectors.toList());

        List<MedicineDto> lowStock = medicineRepository.findLowStockMedicines().stream()
                .map(m -> modelMapper.map(m, MedicineDto.class)).collect(Collectors.toList());
        List<MedicineDto> expired = medicineRepository.findExpiredMedicines(LocalDate.now()).stream()
                .map(m -> modelMapper.map(m, MedicineDto.class)).collect(Collectors.toList());

        return DashboardDto.builder()
                .totalMedicines(medicineRepository.count())
                .totalSuppliers(supplierRepository.count())
                .totalCustomers(customerRepository.count())
                .totalUsers(userRepository.count())
                .lowStockCount(medicineRepository.countLowStockMedicines())
                .expiredCount(medicineRepository.countExpiredMedicines(LocalDate.now()))
                .pendingPrescriptions(prescriptionRepository.countByStatus(
                        com.meditrack.entity.Prescription.PrescriptionStatus.PENDING))
                .todaySales(saleRepository.sumTodaySales())
                .monthlyRevenue(saleRepository.sumMonthlyRevenue())
                .todaySaleCount(saleRepository.countTodaySales())
                .monthlySalesChart(monthlySales)
                .categoryDistribution(categoryDist)
                .lowStockMedicines(lowStock)
                .expiredMedicines(expired)
                .build();
    }
}
