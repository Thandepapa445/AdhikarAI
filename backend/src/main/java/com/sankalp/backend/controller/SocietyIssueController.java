package com.sankalp.backend.controller;

import com.sankalp.backend.dto.SocietyDashboardMetrics;
import com.sankalp.backend.dto.SocietyIssueRequest;
import com.sankalp.backend.dto.SocietyIssueStatusUpdateRequest;
import com.sankalp.backend.entity.MaintenanceStaff;
import com.sankalp.backend.entity.Organization;
import com.sankalp.backend.entity.SocietyIssue;
import com.sankalp.backend.entity.SocietyIssueAudit;
import com.sankalp.backend.entity.User;
import com.sankalp.backend.repository.UserRepository;
import com.sankalp.backend.service.SocietyIssueService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/society")
public class SocietyIssueController {

    private final SocietyIssueService societyIssueService;
    private final UserRepository userRepository;

    public SocietyIssueController(SocietyIssueService societyIssueService, UserRepository userRepository) {
        this.societyIssueService = societyIssueService;
        this.userRepository = userRepository;
    }

    private User getAuthenticatedUser(Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) {
            throw new AccessDeniedException("Authentication required");
        }
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new AccessDeniedException("User account not found"));
    }

    // 1. List Public Residential Societies (for registration and dropdowns)
    @GetMapping("/organizations")
    public ResponseEntity<List<Organization>> listSocieties() {
        return ResponseEntity.ok(societyIssueService.getAllSocieties());
    }

    // 2. Submit a New Society Maintenance Issue
    @PostMapping("/issues")
    public ResponseEntity<SocietyIssue> createIssue(
            @Valid @RequestBody SocietyIssueRequest request,
            Authentication authentication
    ) {
        User user = getAuthenticatedUser(authentication);
        // Ensure resident submits to their assigned organization if specified
        Long orgId = user.getOrganizationId() != null ? user.getOrganizationId() : request.organizationId();
        SocietyIssueRequest scopedRequest = new SocietyIssueRequest(
                orgId,
                request.title(),
                request.description(),
                request.category(),
                request.buildingTower(),
                request.unitFloor(),
                request.residentName(),
                request.residentPhone(),
                request.evidenceImageUrl(),
                request.aiSuggestedDescription(),
                request.priority()
        );
        return ResponseEntity.ok(societyIssueService.createIssue(scopedRequest, user.getEmail()));
    }

    // 3. List Issues Scoped to the User's Society Organization
    @GetMapping("/issues")
    public ResponseEntity<List<SocietyIssue>> getIssues(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String buildingTower,
            Authentication authentication
    ) {
        User user = getAuthenticatedUser(authentication);
        Long orgId = user.getOrganizationId() != null ? user.getOrganizationId() : 2L; // Default to Greenwood if not set
        return ResponseEntity.ok(societyIssueService.getIssuesForOrganization(orgId, status, priority, category, buildingTower));
    }

    // 4. Resident's Personal Complaints
    @GetMapping("/issues/my")
    public ResponseEntity<List<SocietyIssue>> getMyIssues(Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        return ResponseEntity.ok(societyIssueService.getMyIssues(user.getEmail(), user.getOrganizationId()));
    }

    // 5. Issue Details
    @GetMapping("/issues/{id}")
    public ResponseEntity<SocietyIssue> getIssueDetails(
            @PathVariable Long id,
            Authentication authentication
    ) {
        User user = getAuthenticatedUser(authentication);
        return ResponseEntity.ok(societyIssueService.getIssueDetails(id, user.getOrganizationId()));
    }

    // 6. Issue Audit Trail
    @GetMapping("/issues/{id}/audits")
    public ResponseEntity<List<SocietyIssueAudit>> getIssueAudits(
            @PathVariable Long id,
            Authentication authentication
    ) {
        User user = getAuthenticatedUser(authentication);
        return ResponseEntity.ok(societyIssueService.getIssueAuditHistory(id, user.getOrganizationId()));
    }

    // 7. Update Status & Staff Assignment (Manager Only)
    @PutMapping("/issues/{id}/status")
    public ResponseEntity<SocietyIssue> updateStatusAndStaff(
            @PathVariable Long id,
            @RequestBody SocietyIssueStatusUpdateRequest request,
            Authentication authentication
    ) {
        User user = getAuthenticatedUser(authentication);
        return ResponseEntity.ok(societyIssueService.updateStatusAndStaff(
                id,
                request,
                user.getEmail(),
                user.getOrganizationId()
        ));
    }

    // 8. Unlink from Duplicate Cluster (Manager Only)
    @PostMapping("/issues/{id}/separate-cluster")
    public ResponseEntity<SocietyIssue> separateCluster(
            @PathVariable Long id,
            Authentication authentication
    ) {
        User user = getAuthenticatedUser(authentication);
        return ResponseEntity.ok(societyIssueService.separateFromCluster(
                id,
                user.getEmail(),
                user.getOrganizationId()
        ));
    }

    // 9. Authentic KPI Metrics (Manager Dashboard)
    @GetMapping("/metrics")
    public ResponseEntity<SocietyDashboardMetrics> getMetrics(Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        Long orgId = user.getOrganizationId() != null ? user.getOrganizationId() : 2L;
        return ResponseEntity.ok(societyIssueService.calculateMetrics(orgId));
    }

    // 10. List Maintenance Staff (Manager Dashboard)
    @GetMapping("/staff")
    public ResponseEntity<List<MaintenanceStaff>> getStaff(Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        Long orgId = user.getOrganizationId() != null ? user.getOrganizationId() : 2L;
        return ResponseEntity.ok(societyIssueService.getStaffForOrganization(orgId));
    }

    // 11. Escalate Society Issue to Civic / University Track
    @PostMapping("/issues/{id}/escalate-to-civic")
    public ResponseEntity<SocietyIssue> escalateToCivic(
            @PathVariable Long id,
            @RequestBody(required = false) java.util.Map<String, String> body,
            Authentication authentication
    ) {
        User user = getAuthenticatedUser(authentication);
        String reason = body != null ? body.get("reason") : "Escalated for municipal / university intervention";
        String roleStr = user.getRole() != null ? user.getRole().name() : "SOCIETY_MANAGER";
        return ResponseEntity.ok(societyIssueService.escalateToCivic(id, reason, user.getEmail(), roleStr));
    }

    // 12. Resident Sign-off / Verification on Resolved Issue
    @PostMapping("/issues/{id}/sign-off")
    public ResponseEntity<SocietyIssue> signOffResolution(
            @PathVariable Long id,
            @RequestBody(required = false) java.util.Map<String, Object> body,
            Authentication authentication
    ) {
        User user = getAuthenticatedUser(authentication);
        Integer rating = body != null && body.get("rating") != null ? Integer.valueOf(body.get("rating").toString()) : 5;
        String feedback = body != null && body.get("feedback") != null ? body.get("feedback").toString() : "Resident verified issue resolution.";
        return ResponseEntity.ok(societyIssueService.signOffResolution(id, rating, feedback, user.getEmail()));
    }
}
