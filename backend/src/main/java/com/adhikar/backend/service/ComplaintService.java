package com.adhikar.backend.service;

import com.adhikar.backend.dto.ComplaintRequest;
import com.adhikar.backend.entity.Complaint;
import com.adhikar.backend.repository.ComplaintRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final ComplaintAIService complaintAIService;

    public ComplaintService(
            ComplaintRepository complaintRepository,
            ComplaintAIService complaintAIService
    ) {
        this.complaintRepository = complaintRepository;
        this.complaintAIService = complaintAIService;
    }

    // Create new complaint
    public Complaint createComplaint(
            ComplaintRequest request,
            String citizenEmail
    ) {

        String combinedText =
                request.title() + " " +
                        request.description();

        // AI category prediction
        String aiCategory =
                complaintAIService.predictCategory(
                        combinedText
                );

        // AI priority prediction
        String priority =
                complaintAIService.predictPriority(
                        combinedText
                );

        Complaint complaint = new Complaint(
                request.title(),
                request.description(),
                request.category(),
                request.location(),
                citizenEmail
        );

        // AI results
        complaint.setAiCategory(aiCategory);
        complaint.setPriority(priority);

        // GPS coordinates
        complaint.setLatitude(
                request.latitude()
        );

        complaint.setLongitude(
                request.longitude()
        );

        return complaintRepository.save(complaint);
    }

    // Citizen views own complaints
    public List<Complaint> getMyComplaints(
            String citizenEmail
    ) {

        return complaintRepository
                .findByCitizenEmail(citizenEmail);
    }

    // Officer/Admin views all complaints
    public List<Complaint> getAllComplaints() {

        return complaintRepository.findAll();
    }

    // Get complaint by ID
    public Complaint getComplaintById(Long id) {

        return complaintRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Complaint not found"
                        )
                );
    }

    // Update complaint status
    public Complaint updateStatus(
            Long id,
            Complaint.Status status
    ) {

        Complaint complaint =
                getComplaintById(id);

        complaint.setStatus(status);

        return complaintRepository.save(
                complaint
        );
    }

    // Save complaint
    // Used after uploading evidence image
    public Complaint saveComplaint(
            Complaint complaint
    ) {

        return complaintRepository.save(
                complaint
        );
    }
}