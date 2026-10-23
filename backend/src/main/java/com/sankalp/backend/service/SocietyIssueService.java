package com.sankalp.backend.service;

import com.sankalp.backend.dto.SocietyDashboardMetrics;
import com.sankalp.backend.dto.SocietyIssueRequest;
import com.sankalp.backend.dto.SocietyIssueStatusUpdateRequest;
import com.sankalp.backend.entity.Challenge;
import com.sankalp.backend.entity.MaintenanceStaff;
import com.sankalp.backend.entity.Organization;
import com.sankalp.backend.entity.SocietyIssue;
import com.sankalp.backend.entity.SocietyIssueAudit;
import com.sankalp.backend.repository.ChallengeRepository;
import com.sankalp.backend.repository.MaintenanceStaffRepository;
import com.sankalp.backend.repository.OrganizationRepository;
import com.sankalp.backend.repository.SocietyIssueAuditRepository;
import com.sankalp.backend.repository.SocietyIssueRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class SocietyIssueService {

    private final SocietyIssueRepository issueRepository;
    private final SocietyIssueAuditRepository auditRepository;
    private final OrganizationRepository organizationRepository;
    private final MaintenanceStaffRepository staffRepository;
    private final ChallengeRepository challengeRepository;

    public SocietyIssueService(
            SocietyIssueRepository issueRepository,
            SocietyIssueAuditRepository auditRepository,
            OrganizationRepository organizationRepository,
            MaintenanceStaffRepository staffRepository
    ) {
        this(issueRepository, auditRepository, organizationRepository, staffRepository, null);
    }

    @Autowired
    public SocietyIssueService(
            SocietyIssueRepository issueRepository,
            SocietyIssueAuditRepository auditRepository,
            OrganizationRepository organizationRepository,
            MaintenanceStaffRepository staffRepository,
            @Autowired(required = false) ChallengeRepository challengeRepository
    ) {
        this.issueRepository = issueRepository;
        this.auditRepository = auditRepository;
        this.organizationRepository = organizationRepository;
        this.staffRepository = staffRepository;
        this.challengeRepository = challengeRepository;
    }

    @Transactional
    public SocietyIssue createIssue(SocietyIssueRequest request, String residentEmail) {
        Organization org = organizationRepository.findById(request.organizationId())
                .orElseThrow(() -> new IllegalArgumentException("Residential society organization not found"));

        SocietySafetyAssessment assessment = evaluateSocietySafetyRules(
                request.title(),
                request.description(),
                request.category(),
                request.priority()
        );

        SocietyIssue issue = new SocietyIssue();
        issue.setOrganizationId(org.getId());
        issue.setTitle(request.title().trim());
        issue.setDescription(request.description().trim());
        issue.setCategory(request.category().toUpperCase().trim());
        issue.setBuildingTower(request.buildingTower().trim());
        issue.setUnitFloor(request.unitFloor().trim());
        issue.setResidentName(request.residentName().trim());
        issue.setResidentEmail(residentEmail);
        issue.setResidentPhone(request.residentPhone());
        issue.setEvidenceImageUrl(request.evidenceImageUrl());
        issue.setAiSuggestedDescription(request.aiSuggestedDescription());

        // Apply authoritative AI safety triage
        issue.setPriority(assessment.priority());
        issue.setSafetyFlags(assessment.safetyFlags());
        issue.setEmergencyGuidance(assessment.emergencyGuidance());
        issue.setNeedsHumanReview(assessment.needsHumanReview());
        issue.setStatus("REPORTED");

        // Duplicate Issue Clustering within the same Society & Building/Tower
        List<SocietyIssue> activeInTower = issueRepository.findActiveByBuildingAndCategory(
                org.getId(),
                request.buildingTower().trim(),
                request.category().toUpperCase().trim()
        );

        Optional<SocietyIssue> masterOpt = activeInTower.stream()
                .filter(i -> Boolean.TRUE.equals(i.getIsClusterMaster()))
                .findFirst();

        SocietyIssue saved;
        if (masterOpt.isPresent()) {
            SocietyIssue master = masterOpt.get();
            issue.setIsClusterMaster(false);
            issue.setClusterId(master.getId());
            issue.setDuplicateCount(1);
            saved = issueRepository.save(issue);

            // Escalate master count and priority
            int currentCount = master.getDuplicateCount() != null ? master.getDuplicateCount() : 1;
            master.setDuplicateCount(currentCount + 1);
            if (master.getDuplicateCount() >= 3 && "MODERATE".equalsIgnoreCase(master.getPriority())) {
                master.setPriority("HIGH");
            }
            issueRepository.save(master);
        } else {
            issue.setIsClusterMaster(true);
            issue.setDuplicateCount(1);
            saved = issueRepository.save(issue);
            saved.setClusterId(saved.getId());
            saved = issueRepository.save(saved);
        }

        // Record Initial Audit Log
        auditRepository.save(new SocietyIssueAudit(
                saved.getId(),
                org.getId(),
                residentEmail,
                "SOCIETY_RESIDENT",
                "TICKET_CREATED",
                null,
                "REPORTED",
                "Resident registered issue for " + saved.getBuildingTower() + " - " + saved.getUnitFloor()
        ));

        return saved;
    }

    public List<SocietyIssue> getIssuesForOrganization(
            Long organizationId,
            String status,
            String priority,
            String category,
            String buildingTower
    ) {
        List<SocietyIssue> all = issueRepository.findByOrganizationIdOrderByCreatedAtDesc(organizationId);

        return all.stream()
                .filter(i -> status == null || status.isBlank() || i.getStatus().equalsIgnoreCase(status))
                .filter(i -> priority == null || priority.isBlank() || i.getPriority().equalsIgnoreCase(priority))
                .filter(i -> category == null || category.isBlank() || i.getCategory().equalsIgnoreCase(category))
                .filter(i -> buildingTower == null || buildingTower.isBlank() || i.getBuildingTower().equalsIgnoreCase(buildingTower))
                .toList();
    }

    public List<SocietyIssue> getMyIssues(String residentEmail, Long organizationId) {
        if (organizationId != null) {
            return issueRepository.findByOrganizationIdAndResidentEmailOrderByCreatedAtDesc(organizationId, residentEmail);
        }
        return issueRepository.findByResidentEmailOrderByCreatedAtDesc(residentEmail);
    }

    public SocietyIssue getIssueDetails(Long id, Long callerOrgId) {
        SocietyIssue issue = issueRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Society issue not found"));

        if (callerOrgId != null && !callerOrgId.equals(issue.getOrganizationId())) {
            throw new AccessDeniedException("Access denied: Issue belongs to another residential society organization");
        }

        return issue;
    }

    public List<SocietyIssueAudit> getIssueAuditHistory(Long issueId, Long callerOrgId) {
        SocietyIssue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new IllegalArgumentException("Society issue not found"));

        if (callerOrgId != null && !callerOrgId.equals(issue.getOrganizationId())) {
            throw new AccessDeniedException("Access denied: Audit records belong to another organization");
        }

        return auditRepository.findByIssueIdOrderByCreatedAtDesc(issueId);
    }

    @Transactional
    public SocietyIssue updateStatusAndStaff(
            Long id,
            SocietyIssueStatusUpdateRequest request,
            String managerEmail,
            Long managerOrgId
    ) {
        SocietyIssue issue = issueRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Society issue not found"));

        if (managerOrgId != null && !managerOrgId.equals(issue.getOrganizationId())) {
            throw new AccessDeniedException("Access denied: You are not authorized to manage this society");
        }

        String oldStatus = issue.getStatus();
        String newStatus = request.status() != null ? request.status().toUpperCase().trim() : oldStatus;

        if (request.status() != null && !request.status().isBlank()) {
            issue.setStatus(newStatus);
            if ("RESOLVED".equalsIgnoreCase(newStatus) || "CLOSED".equalsIgnoreCase(newStatus)) {
                if (issue.getResolvedAt() == null) {
                    issue.setResolvedAt(LocalDateTime.now());
                }
            }
        }

        if (request.priority() != null && !request.priority().isBlank()) {
            issue.setPriority(request.priority().toUpperCase().trim());
        }

        if (request.assignedStaffName() != null && !request.assignedStaffName().isBlank()) {
            issue.setAssignedStaffName(request.assignedStaffName().trim());
            issue.setAssignedStaffRole(request.assignedStaffRole());
            issue.setAssignedStaffPhone(request.assignedStaffPhone());
        }

        if (request.resolutionNotes() != null && !request.resolutionNotes().isBlank()) {
            issue.setResolutionNotes(request.resolutionNotes().trim());
        }

        SocietyIssue updated = issueRepository.save(issue);

        // Audit Trail
        auditRepository.save(new SocietyIssueAudit(
                updated.getId(),
                updated.getOrganizationId(),
                managerEmail,
                "SOCIETY_MANAGER",
                "STATUS_AND_ASSIGNMENT_UPDATE",
                oldStatus,
                newStatus,
                (request.assignedStaffName() != null ? "Assigned to " + request.assignedStaffName() + ". " : "") +
                        (request.resolutionNotes() != null ? request.resolutionNotes() : "")
        ));

        return updated;
    }

    @Transactional
    public SocietyIssue separateFromCluster(Long id, String managerEmail, Long managerOrgId) {
        SocietyIssue issue = issueRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Society issue not found"));

        if (managerOrgId != null && !managerOrgId.equals(issue.getOrganizationId())) {
            throw new AccessDeniedException("Access denied: You are not authorized to manage this society");
        }

        Long oldClusterId = issue.getClusterId();
        issue.setIsClusterMaster(true);
        issue.setClusterId(issue.getId());
        issue.setDuplicateCount(1);
        SocietyIssue saved = issueRepository.save(issue);

        // Decrement old master if exists
        if (oldClusterId != null && !oldClusterId.equals(issue.getId())) {
            issueRepository.findById(oldClusterId).ifPresent(oldMaster -> {
                int count = oldMaster.getDuplicateCount() != null ? oldMaster.getDuplicateCount() : 1;
                oldMaster.setDuplicateCount(Math.max(1, count - 1));
                issueRepository.save(oldMaster);
            });
        }

        auditRepository.save(new SocietyIssueAudit(
                saved.getId(),
                saved.getOrganizationId(),
                managerEmail,
                "SOCIETY_MANAGER",
                "CLUSTER_SEPARATION",
                "CLUSTERED",
                "INDEPENDENT_MASTER",
                "Manager unlinked report into distinct standalone maintenance issue"
        ));

        return saved;
    }

    public SocietyDashboardMetrics calculateMetrics(Long organizationId) {
        List<SocietyIssue> all = issueRepository.findByOrganizationIdOrderByCreatedAtDesc(organizationId);

        long total = all.size();
        long open = all.stream().filter(i -> "REPORTED".equalsIgnoreCase(i.getStatus())).count();
        long inProgress = all.stream().filter(i -> "ACKNOWLEDGED".equalsIgnoreCase(i.getStatus()) || "IN_PROGRESS".equalsIgnoreCase(i.getStatus())).count();
        long resolved = all.stream().filter(i -> "RESOLVED".equalsIgnoreCase(i.getStatus()) || "CLOSED".equalsIgnoreCase(i.getStatus())).count();

        LocalDateTime cutoff48h = LocalDateTime.now().minusHours(48);
        long overdue = all.stream()
                .filter(i -> !"RESOLVED".equalsIgnoreCase(i.getStatus()) && !"CLOSED".equalsIgnoreCase(i.getStatus()))
                .filter(i -> i.getCreatedAt().isBefore(cutoff48h))
                .count();

        long critical = all.stream()
                .filter(i -> "CRITICAL".equalsIgnoreCase(i.getPriority()))
                .filter(i -> !"RESOLVED".equalsIgnoreCase(i.getStatus()) && !"CLOSED".equalsIgnoreCase(i.getStatus()))
                .count();

        long totalClusters = all.stream()
                .filter(i -> Boolean.TRUE.equals(i.getIsClusterMaster()))
                .count();

        // Calculate authentic average resolution duration in hours
        List<SocietyIssue> resolvedWithDates = all.stream()
                .filter(i -> i.getResolvedAt() != null)
                .toList();

        double avgHours = 0.0;
        if (!resolvedWithDates.isEmpty()) {
            double totalHours = resolvedWithDates.stream()
                    .mapToDouble(i -> Duration.between(i.getCreatedAt(), i.getResolvedAt()).toMinutes() / 60.0)
                    .sum();
            avgHours = Math.round((totalHours / resolvedWithDates.size()) * 10.0) / 10.0;
        }

        return new SocietyDashboardMetrics(total, open, inProgress, resolved, overdue, critical, avgHours, totalClusters);
    }

    public List<MaintenanceStaff> getStaffForOrganization(Long organizationId) {
        return staffRepository.findByOrganizationId(organizationId);
    }

    public List<Organization> getAllSocieties() {
        return organizationRepository.findByType("RESIDENTIAL_SOCIETY");
    }

    // =========================================================================
    // Society-Specific Deterministic Priority & Safety Heuristics
    // =========================================================================
    private SocietySafetyAssessment evaluateSocietySafetyRules(String title, String desc, String category, String requestedPriority) {
        String text = (title + " " + desc + " " + category).toLowerCase();

        // 1. Life Safety: Exposed / Sparking Wiring & Electrical Hazards
        if (text.contains("spark") || text.contains("exposed wire") || text.contains("electric shock") ||
                text.contains("fire") || text.contains("short circuit") || text.contains("burning smell") ||
                category.equalsIgnoreCase("WIRING_HAZARD") || category.equalsIgnoreCase("ELECTRICAL_HAZARD")) {
            return new SocietySafetyAssessment(
                    "CRITICAL",
                    "ELECTRICAL_LIFE_SAFETY",
                    "CRITICAL ELECTRICAL RISK: Keep clear of the area. Do not operate nearby water sources or metal panels. Main building electrical isolator alert dispatched.",
                    false
            );
        }

        // 2. Elevator Entrapment or Free-fall Risk
        if (text.contains("lift trapped") || text.contains("stuck in lift") || text.contains("elevator trapped") ||
                text.contains("lift jerking") || text.contains("free fall") || text.contains("smoke in lift")) {
            return new SocietySafetyAssessment(
                    "CRITICAL",
                    "PASSENGER_ENTRAPMENT",
                    "ELEVATOR ENTRAPMENT EMERGENCY: Press the in-cabin alarm or call security intercom. DO NOT force doors open manually. OEM technician dispatched immediately.",
                    false
            );
        }

        // 3. Elevator Out of Service (No passengers trapped)
        if (text.contains("lift not working") || text.contains("lift stopped") || text.contains("elevator breakdown") ||
                text.contains("elevator out") || category.equalsIgnoreCase("ELEVATOR_LIFT")) {
            return new SocietySafetyAssessment(
                    "HIGH",
                    "VERTICAL_MOBILITY_IMPACT",
                    "Elevator out of operation. Service lift and stairs active. Maintenance OEM notified for door sensor and motor check.",
                    false
            );
        }

        // 4. Major Water Burst / Basement Flooding
        if (text.contains("pipe burst") || text.contains("shaft flooding") || text.contains("basement flood") ||
                text.contains("overflowing tank") || text.contains("main pipeline")) {
            return new SocietySafetyAssessment(
                    "HIGH",
                    "FLOODING_RISK",
                    "Major water flow reported. Society plumbing shutoff valve location verified. Plumber team assigned.",
                    false
            );
        }

        // 5. Minor Plumbing / Dripping
        if (text.contains("water leak") || text.contains("seepage") || text.contains("dripping") ||
                category.equalsIgnoreCase("WATER_LEAKAGE")) {
            return new SocietySafetyAssessment(
                    "MODERATE",
                    "WATER_CONSERVATION",
                    "Standard plumbing seepage/leakage inspection scheduled.",
                    false
            );
        }

        // 6. Common Area Lighting Outage
        if (text.contains("dark") || text.contains("staircase light") || text.contains("corridor light") ||
                category.equalsIgnoreCase("COMMON_LIGHTING")) {
            return new SocietySafetyAssessment(
                    "MODERATE",
                    "COMMON_AREA_SAFETY",
                    "Common lighting fixture replacement assigned for night illumination.",
                    false
            );
        }

        // 7. Housekeeping & Waste
        if (category.equalsIgnoreCase("HOUSEKEEPING") || category.equalsIgnoreCase("WASTE_MANAGEMENT") ||
                text.contains("garbage") || text.contains("dustbin") || text.contains("cleaning")) {
            return new SocietySafetyAssessment(
                    "LOW",
                    "ROUTINE_HOUSEKEEPING",
                    "Housekeeping sweep dispatched for common area cleaning.",
                    false
            );
        }

        // Standard Fallback
        String normPriority = requestedPriority != null ? requestedPriority.toUpperCase().trim() : "MODERATE";
        if (!List.of("LOW", "MODERATE", "HIGH", "CRITICAL").contains(normPriority)) {
            normPriority = "MODERATE";
        }
        if ("CRITICAL".equals(normPriority)) {
            normPriority = "HIGH"; // Prevent unverified critical without safety triggers
        }

        return new SocietySafetyAssessment(
                normPriority,
                "GENERAL_MAINTENANCE",
                "Standard maintenance request queued for facility manager review.",
                false
        );
    }

    @Transactional
    public SocietyIssue escalateToCivic(Long issueId, String reason, String actorEmail, String actorRole) {
        SocietyIssue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new IllegalArgumentException("Society maintenance issue not found: " + issueId));

        if (Boolean.TRUE.equals(issue.getIsEscalatedToCivic()) && issue.getLinkedChallengeId() != null) {
            return issue;
        }

        Organization org = organizationRepository.findById(issue.getOrganizationId()).orElse(null);
        String orgName = org != null ? org.getName() : "Residential Society";
        String city = (org != null && org.getCity() != null) ? org.getCity() : "Ranchi";

        String mappedDomain = mapSocietyCategoryToCivicDomain(issue.getCategory());
        String domainDisplayName = getDomainDisplayName(mappedDomain);

        if (challengeRepository != null) {
            Challenge challenge = new Challenge();
            challenge.setTitle("[Society Escalation] " + issue.getTitle());
            String fullDesc = issue.getDescription() + "\n\n" +
                    "--- CROSS-WORKFLOW ESCALATION DETAILS ---\n" +
                    "Escalated Reason: " + (reason != null ? reason : "Escalated for Municipal / Academic R&D intervention") + "\n" +
                    "Origin: " + orgName + " (" + issue.getBuildingTower() + ", " + issue.getUnitFloor() + ")\n" +
                    "Resident Submitter: " + issue.getResidentName() + " (" + issue.getResidentEmail() + ")";
            challenge.setDescription(fullDesc);
            challenge.setDomain(mappedDomain);
            challenge.setDomainName(domainDisplayName);
            challenge.setPriority(issue.getPriority());
            challenge.setUrgency(issue.getPriority());
            challenge.setEstimatedSeverity("ESCALATED - " + issue.getCategory());
            challenge.setSafetyFlags(issue.getSafetyFlags());
            challenge.setSubmitterType("COMMUNITY_SHG");
            challenge.setSubmitterName(issue.getResidentName() + " (" + orgName + ")");
            challenge.setCitizenEmail(issue.getResidentEmail());
            challenge.setDistrict(city);
            challenge.setBlock(issue.getBuildingTower());
            challenge.setPanchayat(orgName);
            challenge.setLocationText(orgName + ", " + issue.getBuildingTower() + " - " + issue.getUnitFloor());
            challenge.setEvidenceImageUrl(issue.getEvidenceImageUrl());
            challenge.setStatus(Challenge.Status.SUBMITTED);
            challenge.setOriginType("SOCIETY_ESCALATED");
            challenge.setLinkedSocietyIssueId(issue.getId());
            challenge.setIsClusterMaster(true);
            challenge.setDuplicateCount(1);
            challenge.setAffectedPopulation(org != null ? 800 : 300);

            Challenge savedChallenge = challengeRepository.save(challenge);
            savedChallenge.setClusterId(savedChallenge.getId());
            challengeRepository.save(savedChallenge);

            issue.setLinkedChallengeId(savedChallenge.getId());
        }

        issue.setIsEscalatedToCivic(true);
        issue.setCivicStage("SUBMITTED");
        issue.setUpdatedAt(LocalDateTime.now());
        SocietyIssue savedIssue = issueRepository.save(issue);

        // Audit Record
        SocietyIssueAudit audit = new SocietyIssueAudit();
        audit.setIssueId(issue.getId());
        audit.setOrganizationId(issue.getOrganizationId());
        audit.setAction("ESCALATED_TO_CIVIC");
        audit.setPreviousStatus(issue.getStatus());
        audit.setNewStatus(issue.getStatus());
        audit.setNotes("Escalated to Pan-India Civic Track / University R&D" +
                (issue.getLinkedChallengeId() != null ? " as Challenge #" + issue.getLinkedChallengeId() : "") +
                ". Reason: " + (reason != null ? reason : "Complex community issue"));
        audit.setActorEmail(actorEmail);
        audit.setActorRole(actorRole != null ? actorRole : "SOCIETY_MANAGER");
        auditRepository.save(audit);

        return savedIssue;
    }

    @Transactional
    public SocietyIssue signOffResolution(Long issueId, Integer rating, String feedback, String residentEmail) {
        SocietyIssue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new IllegalArgumentException("Society issue not found: " + issueId));

        issue.setResidentSignOffStatus("VERIFIED");
        issue.setResidentRating(rating != null ? rating : 5);
        issue.setResidentFeedback(feedback != null ? feedback : "Resident verified issue resolution.");
        issue.setStatus("CLOSED");
        issue.setUpdatedAt(LocalDateTime.now());

        if (issue.getLinkedChallengeId() != null && challengeRepository != null) {
            challengeRepository.findById(issue.getLinkedChallengeId()).ifPresent(ch -> {
                ch.setStatus(Challenge.Status.RESOLVED);
                ch.setResidentSignOffStatus("VERIFIED");
                ch.setCitizenFeedbackNotes("Verified by Resident " + issue.getResidentName() + " (" + (rating != null ? rating : 5) + "/5): " + feedback);
                ch.setCitizenVerificationRequested(false);
                ch.setUpdatedAt(LocalDateTime.now());
                challengeRepository.save(ch);
            });
            issue.setCivicStage("RESOLVED");
        }

        SocietyIssue saved = issueRepository.save(issue);

        SocietyIssueAudit audit = new SocietyIssueAudit();
        audit.setIssueId(issue.getId());
        audit.setOrganizationId(issue.getOrganizationId());
        audit.setAction("RESIDENT_SIGN_OFF_VERIFIED");
        audit.setPreviousStatus("RESOLVED");
        audit.setNewStatus("CLOSED");
        audit.setNotes("Resident sign-off verified with rating " + (rating != null ? rating : 5) + "/5. Notes: " + feedback);
        audit.setActorEmail(residentEmail);
        audit.setActorRole("SOCIETY_RESIDENT");
        auditRepository.save(audit);

        return saved;
    }

    private String mapSocietyCategoryToCivicDomain(String category) {
        if (category == null) return "INFRASTRUCTURE";
        switch (category.toUpperCase()) {
            case "WATER_LEAKAGE": return "WATER";
            case "WIRING_HAZARD":
            case "COMMON_LIGHTING": return "ENERGY_ENVIRONMENT";
            case "WASTE_MANAGEMENT":
            case "HOUSEKEEPING": return "HEALTHCARE";
            case "STRUCTURAL_CIVIL":
            case "ELEVATOR_LIFT":
            default: return "INFRASTRUCTURE";
        }
    }

    private String getDomainDisplayName(String domain) {
        switch (domain) {
            case "WATER": return "Water Resources & Management";
            case "HEALTHCARE": return "Healthcare & Sanitation";
            case "ENERGY_ENVIRONMENT": return "Clean Energy & Environment";
            case "INFRASTRUCTURE": return "Rural & Urban Infrastructure";
            default: return "Societal Innovation";
        }
    }

    public record SocietySafetyAssessment(
            String priority,
            String safetyFlags,
            String emergencyGuidance,
            boolean needsHumanReview
    ) {}
}
