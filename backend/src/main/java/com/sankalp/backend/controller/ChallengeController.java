package com.sankalp.backend.controller;

import com.sankalp.backend.dto.ChallengeRequest;
import com.sankalp.backend.dto.PilotVerificationRequest;
import com.sankalp.backend.entity.Challenge;
import com.sankalp.backend.service.ChallengeService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/challenges")
public class ChallengeController {

    private final ChallengeService challengeService;

    public ChallengeController(ChallengeService challengeService) {
        this.challengeService = challengeService;
    }

    @PostMapping
    public ResponseEntity<Challenge> createChallenge(
            @Valid @RequestBody ChallengeRequest request,
            Authentication authentication
    ) {
        String userEmail = authentication != null ? authentication.getName() : "citizen@adhikar.gov.in";
        Challenge created = challengeService.createChallenge(request, userEmail);
        return ResponseEntity.ok(created);
    }

    @GetMapping
    public ResponseEntity<List<Challenge>> getAllChallenges() {
        return ResponseEntity.ok(challengeService.getAllChallenges());
    }

    @GetMapping("/my")
    public ResponseEntity<List<Challenge>> getMyChallenges(Authentication authentication) {
        String userEmail = authentication != null ? authentication.getName() : "citizen@adhikar.gov.in";
        return ResponseEntity.ok(challengeService.getMyChallenges(userEmail));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Challenge> getChallengeById(@PathVariable Long id) {
        return ResponseEntity.ok(challengeService.getChallengeById(id));
    }

    @PostMapping("/{id}/verify-pilot")
    public ResponseEntity<Challenge> verifyPilot(
            @PathVariable Long id,
            @RequestBody(required = false) PilotVerificationRequest request
    ) {
        PilotVerificationRequest req = request != null ? request : new PilotVerificationRequest("Field pilot verified by Citizen / Gram Panchayat.");
        return ResponseEntity.ok(challengeService.verifyPilot(id, req));
    }

    @PostMapping("/{id}/upvote")
    public ResponseEntity<Challenge> upvoteChallenge(@PathVariable Long id) {
        return ResponseEntity.ok(challengeService.upvoteChallenge(id));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Challenge> updateStatus(
            @PathVariable Long id,
            @RequestBody java.util.Map<String, Object> body
    ) {
        return ResponseEntity.ok(challengeService.updateStatus(id, body));
    }

    @GetMapping("/clusters")
    public ResponseEntity<List<Challenge>> getClusterMasters() {
        return ResponseEntity.ok(challengeService.getClusterMasters());
    }

    @GetMapping("/clusters/{clusterId}/reports")
    public ResponseEntity<List<Challenge>> getClusterReports(@PathVariable Long clusterId) {
        return ResponseEntity.ok(challengeService.getClusterReports(clusterId));
    }

    @PutMapping("/{id}/override-priority")
    public ResponseEntity<Challenge> overridePriority(
            @PathVariable Long id,
            @RequestBody java.util.Map<String, String> body,
            Authentication authentication
    ) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new org.springframework.security.access.AccessDeniedException("Administrative privileges required");
        }
        String newPriority = body.getOrDefault("priority", "HIGH");
        String reason = body.getOrDefault("reason", "Administrative verification and escalation");
        String adminEmail = authentication.getName();
        return ResponseEntity.ok(challengeService.overridePriority(id, newPriority, reason, adminEmail));
    }

    @PostMapping("/{id}/separate-cluster")
    public ResponseEntity<Challenge> separateFromCluster(
            @PathVariable Long id,
            Authentication authentication
    ) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new org.springframework.security.access.AccessDeniedException("Administrative privileges required");
        }
        String adminEmail = authentication.getName();
        return ResponseEntity.ok(challengeService.separateFromCluster(id, adminEmail));
    }

    @PostMapping("/{id}/allocate")
    public ResponseEntity<Challenge> allocateHei(
            @PathVariable Long id,
            @RequestBody java.util.Map<String, String> body
    ) {
        String heiName = body.getOrDefault("heiName", "BIT Mesra, Ranchi");
        String labDepartment = body.getOrDefault("labDepartment", "Clean Water & Rural Innovation FabLab");
        String facultyMentor = body.getOrDefault("facultyMentor", "Dr. Arvind Sharma");
        return ResponseEntity.ok(challengeService.allocateHei(id, heiName, labDepartment, facultyMentor));
    }
}
