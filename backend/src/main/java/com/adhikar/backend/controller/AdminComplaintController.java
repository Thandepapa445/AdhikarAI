package com.adhikar.backend.controller;

import com.adhikar.backend.dto.ComplaintStatusRequest;
import com.adhikar.backend.entity.Complaint;
import com.adhikar.backend.service.ComplaintService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/complaints")
public class AdminComplaintController {

    private final ComplaintService complaintService;

    public AdminComplaintController(
            ComplaintService complaintService
    ) {
        this.complaintService = complaintService;
    }

    // View all complaints
    @GetMapping
    public ResponseEntity<List<Complaint>> getAllComplaints() {

        return ResponseEntity.ok(
                complaintService.getAllComplaints()
        );
    }

    // View complaint by ID
    @GetMapping("/{id}")
    public ResponseEntity<Complaint> getComplaint(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                complaintService.getComplaintById(id)
        );
    }

    // Update complaint status
    @PutMapping("/{id}/status")
    public ResponseEntity<Complaint> updateStatus(
            @PathVariable Long id,
            @RequestBody ComplaintStatusRequest request
    ) {

        return ResponseEntity.ok(
                complaintService.updateStatus(
                        id,
                        request.status()
                )
        );
    }
}