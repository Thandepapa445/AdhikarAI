package com.adhikar.backend.controller;

import com.adhikar.backend.dto.ComplaintRequest;
import com.adhikar.backend.dto.ComplaintStatusRequest;
import com.adhikar.backend.entity.Complaint;
import com.adhikar.backend.service.CloudinaryService;
import com.adhikar.backend.service.ComplaintService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/complaints")
public class ComplaintController {

    private final ComplaintService complaintService;
    private final CloudinaryService cloudinaryService;

    public ComplaintController(
            ComplaintService complaintService,
            CloudinaryService cloudinaryService
    ) {
        this.complaintService = complaintService;
        this.cloudinaryService = cloudinaryService;
    }

    // Citizen submits complaint
    @PostMapping
    public ResponseEntity<Complaint> createComplaint(
            @Valid @RequestBody ComplaintRequest request,
            Authentication authentication
    ) {

        Complaint complaint =
                complaintService.createComplaint(
                        request,
                        authentication.getName()
                );

        return ResponseEntity.ok(complaint);
    }

    // Citizen views own complaints
    @GetMapping("/my")
    public ResponseEntity<List<Complaint>> getMyComplaints(
            Authentication authentication
    ) {

        return ResponseEntity.ok(
                complaintService.getMyComplaints(
                        authentication.getName()
                )
        );
    }

    // Officer/Admin views all complaints
    @GetMapping
    public ResponseEntity<List<Complaint>> getAllComplaints() {

        return ResponseEntity.ok(
                complaintService.getAllComplaints()
        );
    }

    // Officer/Admin views one complaint
    @GetMapping("/{id}")
    public ResponseEntity<Complaint> getComplaintById(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                complaintService.getComplaintById(id)
        );
    }

    // Officer/Admin updates complaint status
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

    // Upload evidence image
    @PostMapping("/{id}/evidence")
    public ResponseEntity<Complaint> uploadEvidence(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file,
            Authentication authentication
    ) throws IOException {

        Complaint complaint =
                complaintService.getComplaintById(id);

        // Only the citizen who created the complaint
        // can upload evidence for it.
        if (!complaint.getCitizenEmail()
                .equals(authentication.getName())) {

            return ResponseEntity
                    .status(403)
                    .build();
        }

        String imageUrl =
                cloudinaryService.uploadImage(file);

        complaint.setEvidenceImageUrl(imageUrl);

        Complaint savedComplaint =
                complaintService.saveComplaint(
                        complaint
                );

        return ResponseEntity.ok(savedComplaint);
    }
}