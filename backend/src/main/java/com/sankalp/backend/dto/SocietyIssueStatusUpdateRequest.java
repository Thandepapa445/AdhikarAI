package com.sankalp.backend.dto;

public record SocietyIssueStatusUpdateRequest(
        String status, // ACKNOWLEDGED, IN_PROGRESS, RESOLVED, CLOSED
        String priority, // optional override: LOW, MODERATE, HIGH, CRITICAL
        String assignedStaffName,
        String assignedStaffRole,
        String assignedStaffPhone,
        String resolutionNotes
) {}
