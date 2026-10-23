package com.sankalp.backend.service;

import com.sankalp.backend.dto.ChallengeRequest;
import com.sankalp.backend.dto.PilotVerificationRequest;
import com.sankalp.backend.entity.Challenge;
import com.sankalp.backend.entity.SocietyIssue;
import com.sankalp.backend.repository.ChallengeRepository;
import com.sankalp.backend.repository.SocietyIssueRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
public class ChallengeService {

    private final ChallengeRepository challengeRepository;
    private final SocietalChallengeAIService aiService;
    private final SocietyIssueRepository societyIssueRepository;

    public ChallengeService(ChallengeRepository challengeRepository, SocietalChallengeAIService aiService) {
        this(challengeRepository, aiService, null);
    }

    @Autowired
    public ChallengeService(
            ChallengeRepository challengeRepository,
            SocietalChallengeAIService aiService,
            @Autowired(required = false) SocietyIssueRepository societyIssueRepository
    ) {
        this.challengeRepository = challengeRepository;
        this.aiService = aiService;
        this.societyIssueRepository = societyIssueRepository;
    }

    public Challenge createChallenge(ChallengeRequest request, String citizenEmail) {
        String combinedText = request.title() + " " + request.description();

        String domain = (request.domain() != null && !request.domain().isBlank())
                ? request.domain()
                : aiService.predictDomain(combinedText);

        // Authoritative Server-Side Priority & Safety Rules (Client priority is never blindly trusted)
        PriorityAssessment assessment = calculateAuthoritativePriority(
                request.title(),
                request.description(),
                domain,
                request.modelConfidence(),
                request.priority() != null ? request.priority() : request.urgency()
        );

        Map<String, String> routing = aiService.recommendUniversityRouting(domain, request.district());

        Challenge challenge = new Challenge();
        challenge.setTitle(request.title());
        challenge.setDescription(request.description());
        challenge.setDomain(domain);
        challenge.setDomainName(getDomainDisplayName(domain));

        // Set authoritative AI / Safety fields
        challenge.setPriority(assessment.priority());
        challenge.setUrgency(assessment.priority());
        challenge.setEstimatedSeverity(request.estimatedSeverity() != null ? request.estimatedSeverity() : assessment.estimatedSeverity());
        challenge.setModelConfidence(request.modelConfidence() != null ? request.modelConfidence() : 0.85);
        challenge.setPriorityExplanation(assessment.explanation());
        challenge.setAiSuggestedDescription(request.aiSuggestedDescription());
        challenge.setNeedsHumanReview(assessment.needsHumanReview());
        challenge.setSafetyFlags(assessment.safetyFlags());

        challenge.setSubmitterType(request.submitterType());
        challenge.setSubmitterName(request.submitterName());
        challenge.setCitizenEmail(citizenEmail);
        challenge.setDistrict(request.district());
        challenge.setBlock(request.block());
        challenge.setPanchayat(request.panchayat());
        challenge.setLocationText(request.locationText());
        challenge.setLatitude(request.latitude());
        challenge.setLongitude(request.longitude());
        challenge.setAffectedPopulation(request.affectedPopulation() != null ? request.affectedPopulation() : 500);
        challenge.setEvidenceImageUrl(request.evidenceImageUrl());

        challenge.setAssignedHei(routing.get("assignedHei"));
        challenge.setAssignedHeiDepartment(routing.get("department"));
        challenge.setFacultyMentor(routing.get("mentor"));
        challenge.setStudentTeam("Multidisciplinary Student Innovation Team");
        challenge.setIndustryPartner(routing.get("industryPartner"));
        challenge.setStatus(Challenge.Status.SUBMITTED);

        // Duplicate Complaint Detection & Location-Based Clustering (200m radius)
        Challenge matchedMaster = null;
        if (request.latitude() != null && request.longitude() != null) {
            List<Challenge> openChallenges = challengeRepository.findByStatusNot(Challenge.Status.RESOLVED);
            for (Challenge existing : openChallenges) {
                if (existing.getStatus() == Challenge.Status.REJECTED) continue;
                if (existing.getDomain() != null && existing.getDomain().equalsIgnoreCase(domain)) {
                    double distMeters = calculateHaversineDistanceMeters(
                            request.latitude(), request.longitude(),
                            existing.getLatitude(), existing.getLongitude()
                    );
                    if (distMeters <= DUPLICATE_RADIUS_METERS) {
                        if (Boolean.TRUE.equals(existing.getIsClusterMaster())) {
                            matchedMaster = existing;
                        } else if (existing.getClusterId() != null) {
                            matchedMaster = challengeRepository.findById(existing.getClusterId()).orElse(existing);
                        } else {
                            matchedMaster = existing;
                        }
                        break;
                    }
                }
            }
        }

        if (matchedMaster != null) {
            // Associate with existing cluster
            Long masterClusterId = matchedMaster.getClusterId() != null ? matchedMaster.getClusterId() : matchedMaster.getId();
            challenge.setClusterId(masterClusterId);
            challenge.setIsClusterMaster(false);
            challenge.setDuplicateCount(1);

            // Save individual report
            Challenge saved = challengeRepository.save(challenge);

            // Increment master report count and escalate priority if corroborated by 3+ independent citizens
            int newCount = (matchedMaster.getDuplicateCount() != null ? matchedMaster.getDuplicateCount() : 1) + 1;
            matchedMaster.setDuplicateCount(newCount);

            if (newCount >= 3 && "LOW".equalsIgnoreCase(matchedMaster.getPriority())) {
                matchedMaster.setPriority("MODERATE");
                matchedMaster.setPriorityExplanation("Priority escalated from LOW to MODERATE due to " + newCount + " independent corroborating citizen reports in a 200m perimeter.");
            } else if (newCount >= 3 && "MODERATE".equalsIgnoreCase(matchedMaster.getPriority())) {
                matchedMaster.setPriority("HIGH");
                matchedMaster.setPriorityExplanation("Priority escalated from MODERATE to HIGH due to " + newCount + " independent corroborating citizen reports in a 200m perimeter.");
            } else if (newCount >= 5 && "HIGH".equalsIgnoreCase(matchedMaster.getPriority())) {
                matchedMaster.setPriority("CRITICAL");
                matchedMaster.setPriorityExplanation("Priority escalated from HIGH to CRITICAL due to wide-area community impact (" + newCount + " corroborating citizen reports).");
            }
            challengeRepository.save(matchedMaster);

            return saved;
        } else {
            // New unique complaint cluster master
            challenge.setIsClusterMaster(true);
            challenge.setDuplicateCount(1);
            Challenge saved = challengeRepository.save(challenge);
            saved.setClusterId(saved.getId());
            return challengeRepository.save(saved);
        }
    }

    public List<Challenge> getClusterMasters() {
        return challengeRepository.findByIsClusterMasterTrueOrderByCreatedAtDesc();
    }

    public List<Challenge> getClusterReports(Long clusterId) {
        return challengeRepository.findByClusterIdOrderByCreatedAtAsc(clusterId);
    }

    public Challenge overridePriority(Long id, String newPriority, String reason, String adminEmail) {
        Challenge challenge = getChallengeById(id);
        challenge.setPriority(newPriority.toUpperCase());
        challenge.setPriorityOverrideReason(reason != null ? reason : "Administrative override");
        challenge.setPriorityOverriddenBy(adminEmail != null ? adminEmail : "admin@adhikar.gov.in");
        challenge.setUpdatedAt(LocalDateTime.now());
        return challengeRepository.save(challenge);
    }

    public Challenge separateFromCluster(Long id, String adminEmail) {
        Challenge challenge = getChallengeById(id);
        if (Boolean.TRUE.equals(challenge.getIsClusterMaster())) {
            return challenge;
        }
        Long oldClusterId = challenge.getClusterId();
        if (oldClusterId != null) {
            challengeRepository.findById(oldClusterId).ifPresent(master -> {
                int count = master.getDuplicateCount() != null ? master.getDuplicateCount() : 1;
                master.setDuplicateCount(Math.max(1, count - 1));
                challengeRepository.save(master);
            });
        }
        challenge.setClusterId(challenge.getId());
        challenge.setIsClusterMaster(true);
        challenge.setDuplicateCount(1);
        challenge.setPriorityOverrideReason("Separated from cluster #" + oldClusterId + " by admin " + (adminEmail != null ? adminEmail : "admin"));
        challenge.setUpdatedAt(LocalDateTime.now());
        return challengeRepository.save(challenge);
    }

    private static final double DUPLICATE_RADIUS_METERS = 200.0;

    public static double calculateHaversineDistanceMeters(Double lat1, Double lon1, Double lat2, Double lon2) {
        if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return Double.MAX_VALUE;
        double earthRadius = 6371000.0; // meters
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return earthRadius * c;
    }

    // Authoritative Server-Side Priority Evaluation
    public PriorityAssessment calculateAuthoritativePriority(String title, String description, String domain, Double modelConfidence, String rawPriority) {
        String text = ((title != null ? title : "") + " " + (description != null ? description : "")).toLowerCase();

        // 1. Critical Emergency & Safety Escalation Rules
        if (text.contains("sparking") || text.contains("exposed wire") || text.contains("electric shock") ||
            text.contains("fire") || text.contains("explosion") || text.contains("gas leak") ||
            (text.contains("fallen tree") && (text.contains("blocked road") || text.contains("emergency") || text.contains("highway") || text.contains("ambulance")))) {
            return new PriorityAssessment("CRITICAL", "CRITICAL - Immediate life-safety hazard or emergency blockage",
                    "Deterministic safety escalation triggered: critical electrical, fire, or emergency route hazard detected.",
                    false, "EMERGENCY_LIFE_SAFETY,ACCIDENT_RISK");
        }

        // 2. High Urgency Public Hazards
        if (text.contains("open manhole") || text.contains("road cave") || text.contains("deep crater") ||
            text.contains("pipeline burst") || text.contains("flooding") || text.contains("waterlogging") ||
            (text.contains("pothole") && (text.contains("deep") || text.contains("accident") || text.contains("main road") || text.contains("busy"))) ||
            text.contains("fallen tree")) {
            return new PriorityAssessment("HIGH", "HIGH - Severe road or public safety disruption",
                    "Safety rule applied: serious structural, drainage, or mobility impediment.",
                    false, "ROAD_HAZARD,MOBILITY_DISRUPTION");
        }

        // 3. Low Model Confidence / Ambiguity Check
        if (modelConfidence != null && modelConfidence < 0.35) {
            return new PriorityAssessment("MODERATE", "MODERATE - Uncertain prediction",
                    "Model confidence is below 35%. Conservative MODERATE assigned pending administrative inspection.",
                    true, "LOW_CONFIDENCE,NEEDS_INSPECTION");
        }

        // 4. Domain & Category Specific Policies
        if ("HEALTHCARE".equalsIgnoreCase(domain) || text.contains("garbage") || text.contains("trash") || text.contains("waste")) {
            if (text.contains("massive") || text.contains("dump") || text.contains("hospital") || text.contains("drain blocked")) {
                return new PriorityAssessment("MODERATE", "MODERATE - Accumulated waste impediment",
                        "Sanitation dispatch required for waste accumulation.", false, "SANITATION_RISK");
            }
            return new PriorityAssessment("LOW", "LOW - Localized waste collection",
                    "Standard municipal sanitation pickup scheduled.", false, "ROUTINE_MAINTENANCE");
        }

        if (text.contains("street light") || text.contains("streetlight") || text.contains("lamp")) {
            return new PriorityAssessment("MODERATE", "MODERATE - Night visibility disruption",
                    "Public lighting maintenance required for nocturnal safety.", false, "NIGHT_VISIBILITY");
        }

        if (text.contains("water leak") || text.contains("dripping") || text.contains("seepage")) {
            return new PriorityAssessment("MODERATE", "MODERATE - Municipal water loss",
                    "Plumbing inspection required to arrest treated water loss.", false, "RESOURCE_CONSERVATION");
        }

        if (text.contains("pothole")) {
            return new PriorityAssessment("MODERATE", "MODERATE - Road surface irregularity",
                    "Standard road repair required.", false, "ROAD_MAINTENANCE");
        }

        // Fallback to validated default
        if ("CRITICAL".equalsIgnoreCase(rawPriority) || "HIGH".equalsIgnoreCase(rawPriority) || "MODERATE".equalsIgnoreCase(rawPriority) || "LOW".equalsIgnoreCase(rawPriority)) {
            String norm = rawPriority.toUpperCase();
            if ("CRITICAL".equals(norm)) norm = "HIGH"; // Prevent unverified critical without safety triggers
            return new PriorityAssessment(norm, norm + " - Standard assessment", "Category default priority assigned.", false, "STANDARD_EVALUATION");
        }

        return new PriorityAssessment("MODERATE", "MODERATE - General civic issue", "Standard priority assigned for municipal inspection.", false, "GENERAL_CIVIC");
    }

    public record PriorityAssessment(String priority, String estimatedSeverity, String explanation, boolean needsHumanReview, String safetyFlags) {}

    public List<Challenge> getAllChallenges() {
        return challengeRepository.findAll();
    }

    public List<Challenge> getMyChallenges(String citizenEmail) {
        return challengeRepository.findByCitizenEmail(citizenEmail);
    }

    public Challenge getChallengeById(Long id) {
        return challengeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Societal challenge not found with ID: " + id));
    }

    public Challenge verifyPilot(Long id, PilotVerificationRequest request) {
        Challenge challenge = getChallengeById(id);
        challenge.setStatus(Challenge.Status.RESOLVED);
        challenge.setCitizenVerificationRequested(false);
        challenge.setCitizenFeedbackNotes(request.feedback() != null ? request.feedback() : "Citizen & Gram Panchayat verified successful field pilot.");
        challenge.setResidentSignOffStatus("VERIFIED");
        challenge.setUpdatedAt(LocalDateTime.now());

        if (challenge.getLinkedSocietyIssueId() != null && societyIssueRepository != null) {
            societyIssueRepository.findById(challenge.getLinkedSocietyIssueId()).ifPresent(issue -> {
                issue.setStatus("CLOSED");
                issue.setCivicStage("RESOLVED");
                issue.setResidentSignOffStatus("VERIFIED");
                issue.setResidentFeedback(challenge.getCitizenFeedbackNotes());
                issue.setUpdatedAt(LocalDateTime.now());
                societyIssueRepository.save(issue);
            });
        }

        return challengeRepository.save(challenge);
    }

    public Challenge updateStatus(Long id, Map<String, Object> body) {
        Challenge challenge = getChallengeById(id);
        if (body != null) {
            if (body.get("status") != null) {
                try {
                    challenge.setStatus(Challenge.Status.valueOf((String) body.get("status")));
                } catch (Exception e) {
                    // ignore invalid status enum
                }
            }
            if (body.get("assignedHei") != null) challenge.setAssignedHei((String) body.get("assignedHei"));
            if (body.get("assignedHeiDepartment") != null) challenge.setAssignedHeiDepartment((String) body.get("assignedHeiDepartment"));
            if (body.get("facultyMentor") != null) challenge.setFacultyMentor((String) body.get("facultyMentor"));
            if (body.get("studentTeam") != null) challenge.setStudentTeam((String) body.get("studentTeam"));
            if (body.get("industryPartner") != null) challenge.setIndustryPartner((String) body.get("industryPartner"));
            if (body.get("prototypeDetails") != null) challenge.setPrototypeDetails((String) body.get("prototypeDetails"));
            if (body.get("pilotResults") != null) challenge.setPilotResults((String) body.get("pilotResults"));
            if (body.get("citizenVerificationRequested") != null) {
                challenge.setCitizenVerificationRequested(Boolean.TRUE.equals(body.get("citizenVerificationRequested")));
            }
        }
        challenge.setUpdatedAt(LocalDateTime.now());
        Challenge saved = challengeRepository.save(challenge);

        if (saved.getLinkedSocietyIssueId() != null && societyIssueRepository != null) {
            societyIssueRepository.findById(saved.getLinkedSocietyIssueId()).ifPresent(issue -> {
                issue.setCivicStage(saved.getStatus().name());
                if (saved.getStatus() == Challenge.Status.PILOT) {
                    issue.setStatus("IN_PROGRESS");
                    if (issue.getResolutionNotes() == null || !issue.getResolutionNotes().contains("Pilot")) {
                        issue.setResolutionNotes("Community Field Pilot Prototype deployed by " + (saved.getAssignedHei() != null ? saved.getAssignedHei() : "University Team") + ".");
                    }
                } else if (saved.getStatus() == Challenge.Status.RESOLVED) {
                    issue.setStatus("RESOLVED");
                    issue.setResolvedAt(LocalDateTime.now());
                }
                issue.setUpdatedAt(LocalDateTime.now());
                societyIssueRepository.save(issue);
            });
        }

        return saved;
    }

    public Challenge allocateHei(Long id, String heiName, String labDepartment, String facultyMentor) {
        Challenge challenge = getChallengeById(id);
        challenge.setAssignedHei(heiName);
        challenge.setAssignedHeiDepartment(labDepartment);
        challenge.setFacultyMentor(facultyMentor);
        challenge.setStatus(Challenge.Status.ASSIGNED);
        challenge.setUpdatedAt(LocalDateTime.now());
        return challengeRepository.save(challenge);
    }

    public Challenge upvoteChallenge(Long id) {
        Challenge challenge = getChallengeById(id);
        challenge.setUpvotes((challenge.getUpvotes() != null ? challenge.getUpvotes() : 0) + 1);
        return challengeRepository.save(challenge);
    }

    private String getDomainDisplayName(String domain) {
        switch (domain) {
            case "WATER": return "Water Resources & Management";
            case "AGRICULTURE": return "Agriculture & Rural Livelihoods";
            case "HEALTHCARE": return "Healthcare & Sanitation";
            case "ENERGY_ENVIRONMENT": return "Clean Energy & Environment";
            case "MINING_REHAB": return "Mining & Environmental Rehabilitation";
            case "EDUCATION": return "Education & Skill Development";
            case "ACCESSIBILITY": return "Accessibility & Assistive Technology";
            case "INFRASTRUCTURE": return "Rural & Urban Infrastructure";
            case "PUBLIC_ADMIN": return "Public Administration & e-Governance";
            default: return "Societal Innovation";
        }
    }
}
