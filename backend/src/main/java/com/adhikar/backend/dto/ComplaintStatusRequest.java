package com.adhikar.backend.dto;

import com.adhikar.backend.entity.Complaint;

public record ComplaintStatusRequest(
        Complaint.Status status
) {
}