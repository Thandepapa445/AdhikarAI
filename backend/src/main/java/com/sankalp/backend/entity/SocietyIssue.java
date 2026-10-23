package com.sankalp.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "society_issues")
public class SocietyIssue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "organization_id", nullable = false)
    private Long organizationId;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String category; // ELECTRICAL, WIRING_HAZARD, WATER_LEAKAGE, ELEVATOR_LIFT, WASTE_MANAGEMENT, HOUSEKEEPING, SECURITY_ACCESS, STRUCTURAL_CIVIL, COMMON_LIGHTING, OTHER

    @Column(nullable = false)
    private String priority = "MODERATE"; // LOW, MODERATE, HIGH, CRITICAL

    @Column(nullable = false)
    private String status = "REPORTED"; // REPORTED, ACKNOWLEDGED, IN_PROGRESS, RESOLVED, CLOSED

    @Column(name = "building_tower", nullable = false)
    private String buildingTower;

    @Column(name = "unit_floor", nullable = false)
    private String unitFloor;

    @Column(name = "resident_name", nullable = false)
    private String residentName;

    @Column(name = "resident_email", nullable = false)
    private String residentEmail;

    @Column(name = "resident_phone")
    private String residentPhone;

    @Column(name = "assigned_staff_name")
    private String assignedStaffName;

    @Column(name = "assigned_staff_role")
    private String assignedStaffRole;

    @Column(name = "assigned_staff_phone")
    private String assignedStaffPhone;

    @Column(name = "evidence_image_url", columnDefinition = "TEXT")
    private String evidenceImageUrl;

    @Column(name = "ai_suggested_description", columnDefinition = "TEXT")
    private String aiSuggestedDescription;

    @Column(name = "cluster_id")
    private Long clusterId;

    @Column(name = "is_cluster_master")
    private Boolean isClusterMaster = true;

    @Column(name = "duplicate_count")
    private Integer duplicateCount = 1;

    @Column(name = "safety_flags")
    private String safetyFlags;

    @Column(name = "emergency_guidance", columnDefinition = "TEXT")
    private String emergencyGuidance;

    @Column(name = "needs_human_review")
    private Boolean needsHumanReview = false;

    @Column(name = "resolution_notes", columnDefinition = "TEXT")
    private String resolutionNotes;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    // Dual-Workflow Civic Linking
    @Column(name = "linked_challenge_id")
    private Long linkedChallengeId;

    @Column(name = "is_escalated_to_civic")
    private Boolean isEscalatedToCivic = false;

    @Column(name = "civic_stage")
    private String civicStage;

    @Column(name = "resident_sign_off_status")
    private String residentSignOffStatus;

    @Column(name = "resident_rating")
    private Integer residentRating;

    @Column(name = "resident_feedback", columnDefinition = "TEXT")
    private String residentFeedback;

    public SocietyIssue() {}

    @PrePersist
    public void onPrePersist() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (updatedAt == null) updatedAt = LocalDateTime.now();
        if (isClusterMaster == null) isClusterMaster = true;
        if (duplicateCount == null) duplicateCount = 1;
        if (status == null) status = "REPORTED";
        if (priority == null) priority = "MODERATE";
    }

    @PreUpdate
    public void onPreUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getOrganizationId() { return organizationId; }
    public void setOrganizationId(Long organizationId) { this.organizationId = organizationId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getBuildingTower() { return buildingTower; }
    public void setBuildingTower(String buildingTower) { this.buildingTower = buildingTower; }

    public String getUnitFloor() { return unitFloor; }
    public void setUnitFloor(String unitFloor) { this.unitFloor = unitFloor; }

    public String getResidentName() { return residentName; }
    public void setResidentName(String residentName) { this.residentName = residentName; }

    public String getResidentEmail() { return residentEmail; }
    public void setResidentEmail(String residentEmail) { this.residentEmail = residentEmail; }

    public String getResidentPhone() { return residentPhone; }
    public void setResidentPhone(String residentPhone) { this.residentPhone = residentPhone; }

    public String getAssignedStaffName() { return assignedStaffName; }
    public void setAssignedStaffName(String assignedStaffName) { this.assignedStaffName = assignedStaffName; }

    public String getAssignedStaffRole() { return assignedStaffRole; }
    public void setAssignedStaffRole(String assignedStaffRole) { this.assignedStaffRole = assignedStaffRole; }

    public String getAssignedStaffPhone() { return assignedStaffPhone; }
    public void setAssignedStaffPhone(String assignedStaffPhone) { this.assignedStaffPhone = assignedStaffPhone; }

    public String getEvidenceImageUrl() { return evidenceImageUrl; }
    public void setEvidenceImageUrl(String evidenceImageUrl) { this.evidenceImageUrl = evidenceImageUrl; }

    public String getAiSuggestedDescription() { return aiSuggestedDescription; }
    public void setAiSuggestedDescription(String aiSuggestedDescription) { this.aiSuggestedDescription = aiSuggestedDescription; }

    public Long getClusterId() { return clusterId; }
    public void setClusterId(Long clusterId) { this.clusterId = clusterId; }

    public Boolean getIsClusterMaster() { return isClusterMaster; }
    public void setIsClusterMaster(Boolean isClusterMaster) { this.isClusterMaster = isClusterMaster; }

    public Integer getDuplicateCount() { return duplicateCount; }
    public void setDuplicateCount(Integer duplicateCount) { this.duplicateCount = duplicateCount; }

    public String getSafetyFlags() { return safetyFlags; }
    public void setSafetyFlags(String safetyFlags) { this.safetyFlags = safetyFlags; }

    public String getEmergencyGuidance() { return emergencyGuidance; }
    public void setEmergencyGuidance(String emergencyGuidance) { this.emergencyGuidance = emergencyGuidance; }

    public Boolean getNeedsHumanReview() { return needsHumanReview; }
    public void setNeedsHumanReview(Boolean needsHumanReview) { this.needsHumanReview = needsHumanReview; }

    public String getResolutionNotes() { return resolutionNotes; }
    public void setResolutionNotes(String resolutionNotes) { this.resolutionNotes = resolutionNotes; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public LocalDateTime getResolvedAt() { return resolvedAt; }
    public void setResolvedAt(LocalDateTime resolvedAt) { this.resolvedAt = resolvedAt; }

    public Long getLinkedChallengeId() { return linkedChallengeId; }
    public void setLinkedChallengeId(Long linkedChallengeId) { this.linkedChallengeId = linkedChallengeId; }

    public Boolean getIsEscalatedToCivic() { return isEscalatedToCivic; }
    public void setIsEscalatedToCivic(Boolean isEscalatedToCivic) { this.isEscalatedToCivic = isEscalatedToCivic; }

    public String getCivicStage() { return civicStage; }
    public void setCivicStage(String civicStage) { this.civicStage = civicStage; }

    public String getResidentSignOffStatus() { return residentSignOffStatus; }
    public void setResidentSignOffStatus(String residentSignOffStatus) { this.residentSignOffStatus = residentSignOffStatus; }

    public Integer getResidentRating() { return residentRating; }
    public void setResidentRating(Integer residentRating) { this.residentRating = residentRating; }

    public String getResidentFeedback() { return residentFeedback; }
    public void setResidentFeedback(String residentFeedback) { this.residentFeedback = residentFeedback; }
}
