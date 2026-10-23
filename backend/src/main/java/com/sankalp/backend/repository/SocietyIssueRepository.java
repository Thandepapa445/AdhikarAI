package com.sankalp.backend.repository;

import com.sankalp.backend.entity.SocietyIssue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SocietyIssueRepository extends JpaRepository<SocietyIssue, Long> {
    List<SocietyIssue> findByOrganizationIdOrderByCreatedAtDesc(Long organizationId);
    List<SocietyIssue> findByOrganizationIdAndStatusNotOrderByCreatedAtDesc(Long organizationId, String status);
    List<SocietyIssue> findByOrganizationIdAndResidentEmailOrderByCreatedAtDesc(Long organizationId, String residentEmail);
    List<SocietyIssue> findByResidentEmailOrderByCreatedAtDesc(String residentEmail);
    List<SocietyIssue> findByOrganizationIdAndIsClusterMasterTrueOrderByCreatedAtDesc(Long organizationId);
    List<SocietyIssue> findByClusterId(Long clusterId);
    java.util.Optional<SocietyIssue> findByLinkedChallengeId(Long linkedChallengeId);
    
    long countByOrganizationId(Long organizationId);
    long countByOrganizationIdAndStatus(Long organizationId, String status);
    
    @Query("SELECT COUNT(s) FROM SocietyIssue s WHERE s.organizationId = :orgId AND s.status != 'RESOLVED' AND s.status != 'CLOSED' AND s.createdAt < :cutoff")
    long countOverdueIssues(@Param("orgId") Long orgId, @Param("cutoff") LocalDateTime cutoff);

    @Query("SELECT s FROM SocietyIssue s WHERE s.organizationId = :orgId AND s.buildingTower = :building AND s.category = :category AND s.status != 'RESOLVED' AND s.status != 'CLOSED'")
    List<SocietyIssue> findActiveByBuildingAndCategory(@Param("orgId") Long orgId, @Param("building") String building, @Param("category") String category);
}
