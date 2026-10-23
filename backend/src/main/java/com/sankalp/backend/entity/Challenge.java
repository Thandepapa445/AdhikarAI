package com.sankalp.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "societal_challenges")
public class Challenge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String domain;

    @Column(nullable = false)
    private String domainName;

    @Column(nullable = false)
    private String urgency; // CRITICAL, HIGH, MEDIUM, LOW

    // AI Priority & Civic Safety Triage
    @Column(nullable = false)
    private String priority; // LOW, MODERATE, HIGH, CRITICAL

    @Column
    private String estimatedSeverity;

    @Column
    private Double modelConfidence;

    @Column(columnDefinition = "TEXT")
    private String priorityExplanation;

    @Column(columnDefinition = "TEXT")
    private String aiSuggestedDescription;

    @Column
    private Boolean needsHumanReview;

    @Column
    private String safetyFlags;

    @Column(columnDefinition = "TEXT")
    private String priorityOverrideReason;

    @Column
    private String priorityOverriddenBy;

    // Duplicate Complaint Clustering
    @Column
    private Long clusterId;

    @Column
    private Boolean isClusterMaster;

    @Column
    private Integer duplicateCount;

    @Column(nullable = false)
    private String submitterType; // INDIVIDUAL_CITIZEN, GRAM_PANCHAYAT, COMMUNITY_SHG, LOCAL_BODY

    @Column(nullable = false)
    private String submitterName;

    @Column(nullable = false)
    private String citizenEmail;

    @Column(nullable = false)
    private String district;

    @Column(nullable = false)
    private String block;

    @Column(nullable = false)
    private String panchayat;

    @Column
    private String locationText;

    @Column
    private Double latitude;

    @Column
    private Double longitude;

    @Column
    private Integer affectedPopulation;

    @Column(columnDefinition = "TEXT")
    private String evidenceImageUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status; // 8-stage lifecycle

    // University (HEI) Assignment
    @Column
    private String assignedHei;

    @Column
    private String assignedHeiDepartment;

    @Column
    private String facultyMentor;

    @Column
    private String studentTeam;

    // Industry / CSR Partner
    @Column
    private String industryPartner;

    @Column(columnDefinition = "TEXT")
    private String prototypeDetails;

    @Column(columnDefinition = "TEXT")
    private String pilotResults;

    @Column
    private Boolean citizenVerificationRequested;

    @Column(columnDefinition = "TEXT")
    private String citizenFeedbackNotes;

    @Column
    private Integer upvotes;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column
    private LocalDateTime updatedAt;

    // Dual-Workflow Society Linking
    @Column(name = "linked_society_issue_id")
    private Long linkedSocietyIssueId;

    @Column(name = "origin_type")
    private String originType = "CIVIC_DIRECT";

    @Column(name = "resident_sign_off_status")
    private String residentSignOffStatus;

    public Challenge() {}

    @PrePersist
    public void setDefaults() {
        if (this.status == null) {
            this.status = Status.SUBMITTED;
        }
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        if (this.updatedAt == null) {
            this.updatedAt = LocalDateTime.now();
        }
        if (this.upvotes == null) {
            this.upvotes = 1;
        }
        if (this.citizenVerificationRequested == null) {
            this.citizenVerificationRequested = false;
        }
        if (this.priority == null) {
            this.priority = "MODERATE";
        }
        if (this.urgency == null) {
            this.urgency = this.priority;
        }
        if (this.isClusterMaster == null) {
            this.isClusterMaster = true;
        }
        if (this.duplicateCount == null) {
            this.duplicateCount = 1;
        }
        if (this.needsHumanReview == null) {
            this.needsHumanReview = false;
        }
    }

    public enum Status {
        SUBMITTED,
        VALIDATED,
        ASSIGNED,
        RESEARCH,
        PROTOTYPE,
        TESTING,
        PILOT,
        RESOLVED,
        REJECTED
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getDomain() { return domain; }
    public void setDomain(String domain) { this.domain = domain; }

    public String getDomainName() { return domainName; }
    public void setDomainName(String domainName) { this.domainName = domainName; }

    public String getUrgency() { return urgency; }
    public void setUrgency(String urgency) { this.urgency = urgency; }

    public String getSubmitterType() { return submitterType; }
    public void setSubmitterType(String submitterType) { this.submitterType = submitterType; }

    public String getSubmitterName() { return submitterName; }
    public void setSubmitterName(String submitterName) { this.submitterName = submitterName; }

    public String getCitizenEmail() { return citizenEmail; }
    public void setCitizenEmail(String citizenEmail) { this.citizenEmail = citizenEmail; }

    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }

    public String getBlock() { return block; }
    public void setBlock(String block) { this.block = block; }

    public String getPanchayat() { return panchayat; }
    public void setPanchayat(String panchayat) { this.panchayat = panchayat; }

    public String getLocationText() { return locationText; }
    public void setLocationText(String locationText) { this.locationText = locationText; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public Integer getAffectedPopulation() { return affectedPopulation; }
    public void setAffectedPopulation(Integer affectedPopulation) { this.affectedPopulation = affectedPopulation; }

    public String getEvidenceImageUrl() { return evidenceImageUrl; }
    public void setEvidenceImageUrl(String evidenceImageUrl) { this.evidenceImageUrl = evidenceImageUrl; }

    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }

    public String getAssignedHei() { return assignedHei; }
    public void setAssignedHei(String assignedHei) { this.assignedHei = assignedHei; }

    public String getAssignedHeiDepartment() { return assignedHeiDepartment; }
    public void setAssignedHeiDepartment(String assignedHeiDepartment) { this.assignedHeiDepartment = assignedHeiDepartment; }

    public String getFacultyMentor() { return facultyMentor; }
    public void setFacultyMentor(String facultyMentor) { this.facultyMentor = facultyMentor; }

    public String getStudentTeam() { return studentTeam; }
    public void setStudentTeam(String studentTeam) { this.studentTeam = studentTeam; }

    public String getIndustryPartner() { return industryPartner; }
    public void setIndustryPartner(String industryPartner) { this.industryPartner = industryPartner; }

    public String getPrototypeDetails() { return prototypeDetails; }
    public void setPrototypeDetails(String prototypeDetails) { this.prototypeDetails = prototypeDetails; }

    public String getPilotResults() { return pilotResults; }
    public void setPilotResults(String pilotResults) { this.pilotResults = pilotResults; }

    public Boolean getCitizenVerificationRequested() { return citizenVerificationRequested; }
    public void setCitizenVerificationRequested(Boolean citizenVerificationRequested) { this.citizenVerificationRequested = citizenVerificationRequested; }

    public String getCitizenFeedbackNotes() { return citizenFeedbackNotes; }
    public void setCitizenFeedbackNotes(String citizenFeedbackNotes) { this.citizenFeedbackNotes = citizenFeedbackNotes; }

    public Integer getUpvotes() { return upvotes; }
    public void setUpvotes(Integer upvotes) { this.upvotes = upvotes; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) {
        this.priority = priority;
        this.urgency = priority; // keep legacy urgency synchronized
    }

    public String getEstimatedSeverity() { return estimatedSeverity; }
    public void setEstimatedSeverity(String estimatedSeverity) { this.estimatedSeverity = estimatedSeverity; }

    public Double getModelConfidence() { return modelConfidence; }
    public void setModelConfidence(Double modelConfidence) { this.modelConfidence = modelConfidence; }

    public String getPriorityExplanation() { return priorityExplanation; }
    public void setPriorityExplanation(String priorityExplanation) { this.priorityExplanation = priorityExplanation; }

    public String getAiSuggestedDescription() { return aiSuggestedDescription; }
    public void setAiSuggestedDescription(String aiSuggestedDescription) { this.aiSuggestedDescription = aiSuggestedDescription; }

    public Boolean getNeedsHumanReview() { return needsHumanReview; }
    public void setNeedsHumanReview(Boolean needsHumanReview) { this.needsHumanReview = needsHumanReview; }

    public String getSafetyFlags() { return safetyFlags; }
    public void setSafetyFlags(String safetyFlags) { this.safetyFlags = safetyFlags; }

    public String getPriorityOverrideReason() { return priorityOverrideReason; }
    public void setPriorityOverrideReason(String priorityOverrideReason) { this.priorityOverrideReason = priorityOverrideReason; }

    public String getPriorityOverriddenBy() { return priorityOverriddenBy; }
    public void setPriorityOverriddenBy(String priorityOverriddenBy) { this.priorityOverriddenBy = priorityOverriddenBy; }

    public Long getClusterId() { return clusterId; }
    public void setClusterId(Long clusterId) { this.clusterId = clusterId; }

    public Boolean getIsClusterMaster() { return isClusterMaster; }
    public void setIsClusterMaster(Boolean isClusterMaster) { this.isClusterMaster = isClusterMaster; }

    public Integer getDuplicateCount() { return duplicateCount; }
    public void setDuplicateCount(Integer duplicateCount) { this.duplicateCount = duplicateCount; }

    public Long getLinkedSocietyIssueId() { return linkedSocietyIssueId; }
    public void setLinkedSocietyIssueId(Long linkedSocietyIssueId) { this.linkedSocietyIssueId = linkedSocietyIssueId; }

    public String getOriginType() { return originType; }
    public void setOriginType(String originType) { this.originType = originType; }

    public String getResidentSignOffStatus() { return residentSignOffStatus; }
    public void setResidentSignOffStatus(String residentSignOffStatus) { this.residentSignOffStatus = residentSignOffStatus; }
}
