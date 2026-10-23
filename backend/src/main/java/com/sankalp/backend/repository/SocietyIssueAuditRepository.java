package com.sankalp.backend.repository;

import com.sankalp.backend.entity.SocietyIssueAudit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SocietyIssueAuditRepository extends JpaRepository<SocietyIssueAudit, Long> {
    List<SocietyIssueAudit> findByIssueIdOrderByCreatedAtDesc(Long issueId);
    List<SocietyIssueAudit> findByOrganizationIdOrderByCreatedAtDesc(Long organizationId);
}
