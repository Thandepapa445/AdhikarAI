package com.sankalp.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "society_issue_audits")
public class SocietyIssueAudit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "issue_id", nullable = false)
    private Long issueId;

    @Column(name = "organization_id", nullable = false)
    private Long organizationId;

    @Column(name = "actor_email", nullable = false)
    private String actorEmail;

    @Column(name = "actor_role", nullable = false)
    private String actorRole;

    @Column(nullable = false)
    private String action; // STATUS_CHANGE, STAFF_ASSIGNMENT, PRIORITY_OVERRIDE, RESOLUTION

    @Column(name = "previous_status")
    private String previousStatus;

    @Column(name = "new_status")
    private String newStatus;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public SocietyIssueAudit() {}

    public SocietyIssueAudit(Long issueId, Long organizationId, String actorEmail, String actorRole, String action, String previousStatus, String newStatus, String notes) {
        this.issueId = issueId;
        this.organizationId = organizationId;
        this.actorEmail = actorEmail;
        this.actorRole = actorRole;
        this.action = action;
        this.previousStatus = previousStatus;
        this.newStatus = newStatus;
        this.notes = notes;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getIssueId() { return issueId; }
    public void setIssueId(Long issueId) { this.issueId = issueId; }

    public Long getOrganizationId() { return organizationId; }
    public void setOrganizationId(Long organizationId) { this.organizationId = organizationId; }

    public String getActorEmail() { return actorEmail; }
    public void setActorEmail(String actorEmail) { this.actorEmail = actorEmail; }

    public String getActorRole() { return actorRole; }
    public void setActorRole(String actorRole) { this.actorRole = actorRole; }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public String getPreviousStatus() { return previousStatus; }
    public void setPreviousStatus(String previousStatus) { this.previousStatus = previousStatus; }

    public String getNewStatus() { return newStatus; }
    public void setNewStatus(String newStatus) { this.newStatus = newStatus; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
