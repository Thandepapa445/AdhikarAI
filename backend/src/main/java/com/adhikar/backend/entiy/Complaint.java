package com.adhikar.backend.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "complaints")
public class Complaint {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String category;

    @Column(nullable = false)
    private String location;

    // GPS coordinates
    @Column
    private Double latitude;

    @Column
    private Double longitude;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status;

    @Column(nullable = false)
    private String citizenEmail;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    // AI-generated fields
    @Column
    private String aiCategory;

    @Column
    private String priority;

    // Evidence image URL
    @Column
    private String evidenceImageUrl;

    public Complaint() {
    }

    public Complaint(
            String title,
            String description,
            String category,
            String location,
            String citizenEmail
    ) {
        this.title = title;
        this.description = description;
        this.category = category;
        this.location = location;
        this.citizenEmail = citizenEmail;

        this.status = Status.PENDING;
        this.createdAt = LocalDateTime.now();

        this.aiCategory = category;
        this.priority = "MEDIUM";
    }

    // Safety defaults for JPA
    @PrePersist
    public void setDefaults() {

        if (this.status == null) {
            this.status = Status.PENDING;
        }

        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }

        if (this.aiCategory == null ||
                this.aiCategory.isBlank()) {
            this.aiCategory = this.category;
        }

        if (this.priority == null ||
                this.priority.isBlank()) {
            this.priority = "MEDIUM";
        }
    }

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public String getCategory() {
        return category;
    }

    public String getLocation() {
        return location;
    }

    public Double getLatitude() {
        return latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public Status getStatus() {
        return status;
    }

    public String getCitizenEmail() {
        return citizenEmail;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public String getAiCategory() {
        return aiCategory;
    }

    public String getPriority() {
        return priority;
    }

    public String getEvidenceImageUrl() {
        return evidenceImageUrl;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public void setStatus(Status status) {
        this.status = status;
    }

    public void setAiCategory(String aiCategory) {
        this.aiCategory = aiCategory;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public void setEvidenceImageUrl(
            String evidenceImageUrl
    ) {
        this.evidenceImageUrl = evidenceImageUrl;
    }

    public enum Status {
        PENDING,
        IN_PROGRESS,
        RESOLVED,
        REJECTED
    }
}