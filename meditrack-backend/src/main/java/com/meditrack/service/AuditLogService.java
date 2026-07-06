package com.meditrack.service;

import com.meditrack.entity.AuditLog;
import com.meditrack.entity.User;
import com.meditrack.repository.AuditLogRepository;
import com.meditrack.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    public void log(String email, String action, String entityType, Long entityId, String details) {
        User user = userRepository.findByEmail(email).orElse(null);
        AuditLog log = AuditLog.builder()
                .user(user)
                .action(action)
                .entityType(entityType)
                .entityId(entityId)
                .details(details)
                .timestamp(LocalDateTime.now())
                .build();
        auditLogRepository.save(log);
    }
}
