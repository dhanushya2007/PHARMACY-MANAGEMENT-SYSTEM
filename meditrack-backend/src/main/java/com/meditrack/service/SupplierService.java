package com.meditrack.service;

import com.meditrack.dto.SupplierDto;
import com.meditrack.entity.Supplier;
import com.meditrack.exception.BadRequestException;
import com.meditrack.exception.ResourceNotFoundException;
import com.meditrack.repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SupplierService {

    private final SupplierRepository supplierRepository;
    private final ModelMapper modelMapper;

    public Page<SupplierDto> getAllSuppliers(Pageable pageable) {
        return supplierRepository.findAll(pageable).map(s -> modelMapper.map(s, SupplierDto.class));
    }

    public SupplierDto getSupplierById(Long id) {
        return modelMapper.map(findById(id), SupplierDto.class);
    }

    @Transactional
    public SupplierDto createSupplier(SupplierDto dto) {
        if (supplierRepository.existsByEmail(dto.getEmail())) {
            throw new BadRequestException("Supplier email already exists");
        }
        Supplier supplier = modelMapper.map(dto, Supplier.class);
        supplier.setActive(true);
        return modelMapper.map(supplierRepository.save(supplier), SupplierDto.class);
    }

    @Transactional
    public SupplierDto updateSupplier(Long id, SupplierDto dto) {
        Supplier supplier = findById(id);
        modelMapper.map(dto, supplier);
        supplier.setId(id);
        return modelMapper.map(supplierRepository.save(supplier), SupplierDto.class);
    }

    @Transactional
    public void deleteSupplier(Long id) {
        findById(id);
        supplierRepository.deleteById(id);
    }

    private Supplier findById(Long id) {
        return supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + id));
    }
}
