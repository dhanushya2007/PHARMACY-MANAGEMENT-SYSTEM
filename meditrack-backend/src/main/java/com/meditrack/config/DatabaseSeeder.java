package com.meditrack.config;

import com.meditrack.entity.Customer;
import com.meditrack.entity.Medicine;
import com.meditrack.entity.Supplier;
import com.meditrack.entity.User;
import com.meditrack.repository.CustomerRepository;
import com.meditrack.repository.MedicineRepository;
import com.meditrack.repository.SupplierRepository;
import com.meditrack.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;

@Component
@RequiredArgsConstructor
public class DatabaseSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final SupplierRepository supplierRepository;
    private final MedicineRepository medicineRepository;
    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // 1. Seed Users
        if (userRepository.count() == 0) {
            User admin = User.builder()
                    .name("System Admin")
                    .email("admin@meditrack.com")
                    .password(passwordEncoder.encode("admin123"))
                    .role(User.Role.ADMIN)
                    .active(true)
                    .phone("9876543210")
                    .build();
            userRepository.save(admin);

            User pharmacist = User.builder()
                    .name("John Pharmacist")
                    .email("pharma@meditrack.com")
                    .password(passwordEncoder.encode("pharma123"))
                    .role(User.Role.PHARMACIST)
                    .active(true)
                    .phone("9876543211")
                    .build();
            userRepository.save(pharmacist);

            User customerUser = User.builder()
                    .name("Alice Customer")
                    .email("alice@gmail.com")
                    .password(passwordEncoder.encode("alice123"))
                    .role(User.Role.CUSTOMER)
                    .active(true)
                    .phone("9876543212")
                    .build();
            customerUser = userRepository.save(customerUser);

            Customer customer = Customer.builder()
                    .name("Alice Customer")
                    .email("alice@gmail.com")
                    .phone("9876543212")
                    .address("123 Main St, Tech City")
                    .user(customerUser)
                    .build();
            customerRepository.save(customer);
        }

        // 2. Seed Suppliers
        if (supplierRepository.count() == 0) {
            Supplier s1 = Supplier.builder()
                    .supplierName("Apex Pharma Dist")
                    .company("Apex Pharmaceuticals")
                    .phone("+91 9999999999")
                    .email("sales@apexpharma.com")
                    .address("404 Industrial Area, Mumbai")
                    .active(true)
                    .build();
            supplierRepository.save(s1);

            Supplier s2 = Supplier.builder()
                    .supplierName("MedLife Supply")
                    .company("MedLife Health Corp")
                    .phone("+91 8888888888")
                    .email("supply@medlife.com")
                    .address("101 Green Avenue, Bangalore")
                    .active(true)
                    .build();
            supplierRepository.save(s2);
        }

        // 3. Seed Medicines
        if (medicineRepository.count() == 0) {
            Supplier supplier = supplierRepository.findAll().get(0);

            Medicine m1 = Medicine.builder()
                    .medicineName("Paracetamol 650mg")
                    .genericName("Acetaminophen")
                    .category("Analgesic")
                    .brand("Calpol")
                    .batchNumber("CALP889")
                    .manufacturer("GSK India")
                    .manufacturingDate(LocalDate.now().minusMonths(6))
                    .expiryDate(LocalDate.now().plusYears(2))
                    .purchasePrice(BigDecimal.valueOf(1.20))
                    .sellingPrice(BigDecimal.valueOf(2.50))
                    .quantity(120)
                    .minimumStock(20)
                    .description("Common pain reliever and fever reducer.")
                    .supplier(supplier)
                    .build();
            medicineRepository.save(m1);

            Medicine m2 = Medicine.builder()
                    .medicineName("Amoxicillin 500mg")
                    .genericName("Amoxicillin Trihydrate")
                    .category("Antibiotic")
                    .brand("Novamox")
                    .batchNumber("AMX5042")
                    .manufacturer("Cipla Ltd")
                    .manufacturingDate(LocalDate.now().minusMonths(4))
                    .expiryDate(LocalDate.now().plusYears(1))
                    .purchasePrice(BigDecimal.valueOf(8.50))
                    .sellingPrice(BigDecimal.valueOf(15.00))
                    .quantity(80)
                    .minimumStock(15)
                    .description("Broad spectrum antibiotic for bacterial infections.")
                    .supplier(supplier)
                    .build();
            medicineRepository.save(m2);

            Medicine m3 = Medicine.builder()
                    .medicineName("Atorvastatin 10mg")
                    .genericName("Atorvastatin Calcium")
                    .category("Cardiovascular")
                    .brand("Lipitor")
                    .batchNumber("LIP9912")
                    .manufacturer("Pfizer India")
                    .manufacturingDate(LocalDate.now().minusMonths(2))
                    .expiryDate(LocalDate.now().plusDays(25)) // Expiring soon
                    .purchasePrice(BigDecimal.valueOf(12.00))
                    .sellingPrice(BigDecimal.valueOf(22.50))
                    .quantity(8) // Low stock
                    .minimumStock(10)
                    .description("Cholesterol-lowering medication.")
                    .supplier(supplier)
                    .build();
            medicineRepository.save(m3);

            Medicine m4 = Medicine.builder()
                    .medicineName("Ibuprofen 400mg")
                    .genericName("Ibuprofen")
                    .category("Analgesic")
                    .brand("Brufen")
                    .batchNumber("BRU112")
                    .manufacturer("Abbott India")
                    .manufacturingDate(LocalDate.now().minusYears(2))
                    .expiryDate(LocalDate.now().minusMonths(1)) // Expired
                    .purchasePrice(BigDecimal.valueOf(2.00))
                    .sellingPrice(BigDecimal.valueOf(4.50))
                    .quantity(50)
                    .minimumStock(10)
                    .description("NSAID used for relieving pain and reducing inflammation.")
                    .supplier(supplier)
                    .build();
            medicineRepository.save(m4);
        }
    }
}
