package com.sankalp.backend.service;

import com.sankalp.backend.dto.SocietyDashboardMetrics;
import com.sankalp.backend.dto.SocietyIssueRequest;
import com.sankalp.backend.dto.SocietyIssueStatusUpdateRequest;
import com.sankalp.backend.entity.Organization;
import com.sankalp.backend.entity.SocietyIssue;
import com.sankalp.backend.repository.MaintenanceStaffRepository;
import com.sankalp.backend.repository.OrganizationRepository;
import com.sankalp.backend.repository.SocietyIssueAuditRepository;
import com.sankalp.backend.repository.SocietyIssueRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class SocietyIssueServiceTest {

    @Mock
    private SocietyIssueRepository issueRepository;
    @Mock
    private SocietyIssueAuditRepository auditRepository;
    @Mock
    private OrganizationRepository organizationRepository;
    @Mock
    private MaintenanceStaffRepository staffRepository;

    private SocietyIssueService societyIssueService;
    private Organization sampleOrg;

    @BeforeEach
    void setUp() {
        societyIssueService = new SocietyIssueService(
                issueRepository,
                auditRepository,
                organizationRepository,
                staffRepository
        );
        sampleOrg = new Organization("Greenwood Heights", "RESIDENTIAL_SOCIETY", "SOC-GREENWOOD", "Kanke Rd", "Ranchi");
        sampleOrg.setId(2L);
    }

    @Test
    @DisplayName("Society Life Safety Rule: Sparking wire escalates to CRITICAL with emergency guidance")
    void testCriticalElectricalSafetyEscalation() {
        when(organizationRepository.findById(2L)).thenReturn(Optional.of(sampleOrg));
        when(issueRepository.findActiveByBuildingAndCategory(any(), any(), any())).thenReturn(Collections.emptyList());
        when(issueRepository.save(any(SocietyIssue.class))).thenAnswer(inv -> {
            SocietyIssue s = inv.getArgument(0);
            if (s.getId() == null) s.setId(501L);
            return s;
        });

        SocietyIssueRequest request = new SocietyIssueRequest(
                2L,
                "Sparking wire in corridor",
                "Sparks coming from exposed electrical wire near flat 302",
                "WIRING_HAZARD",
                "Tower A",
                "3rd Floor",
                "Rohan Roy",
                "9876543210",
                "https://img.jpg",
                "Exposed wire sparking",
                "LOW" // resident tried low, server must escalate!
        );

        SocietyIssue created = societyIssueService.createIssue(request, "rohan@greenwood.in");

        assertEquals("CRITICAL", created.getPriority());
        assertEquals("ELECTRICAL_LIFE_SAFETY", created.getSafetyFlags());
        assertTrue(created.getEmergencyGuidance().contains("CRITICAL ELECTRICAL RISK"));
        assertTrue(created.getIsClusterMaster());
    }

    @Test
    @DisplayName("Society Elevator Rule: Elevator stuck with trapped passenger triggers CRITICAL")
    void testElevatorEntrapmentCriticalRule() {
        when(organizationRepository.findById(2L)).thenReturn(Optional.of(sampleOrg));
        when(issueRepository.findActiveByBuildingAndCategory(any(), any(), any())).thenReturn(Collections.emptyList());
        when(issueRepository.save(any(SocietyIssue.class))).thenAnswer(inv -> {
            SocietyIssue s = inv.getArgument(0);
            if (s.getId() == null) s.setId(502L);
            return s;
        });

        SocietyIssueRequest request = new SocietyIssueRequest(
                2L,
                "Lift stopped between floors",
                "2 elderly residents stuck in lift cabin with alarm sounding",
                "ELEVATOR_LIFT",
                "Tower B",
                "Between 4th & 5th Floor",
                "Kavita Sen",
                "9876543211",
                null,
                "Elevator trapped passenger",
                "HIGH"
        );

        SocietyIssue created = societyIssueService.createIssue(request, "kavita@greenwood.in");

        assertEquals("CRITICAL", created.getPriority());
        assertEquals("PASSENGER_ENTRAPMENT", created.getSafetyFlags());
        assertTrue(created.getEmergencyGuidance().contains("ELEVATOR ENTRAPMENT EMERGENCY"));
    }

    @Test
    @DisplayName("Tower Duplicate Clustering: Multiple reports for same elevator in same tower group into master")
    void testTowerDuplicateClustering() {
        SocietyIssue master = new SocietyIssue();
        master.setId(100L);
        master.setOrganizationId(2L);
        master.setBuildingTower("Tower B");
        master.setCategory("ELEVATOR_LIFT");
        master.setIsClusterMaster(true);
        master.setDuplicateCount(1);
        master.setPriority("HIGH");
        master.setStatus("REPORTED");

        when(organizationRepository.findById(2L)).thenReturn(Optional.of(sampleOrg));
        when(issueRepository.findActiveByBuildingAndCategory(2L, "Tower B", "ELEVATOR_LIFT"))
                .thenReturn(List.of(master));
        when(issueRepository.save(any(SocietyIssue.class))).thenAnswer(inv -> inv.getArgument(0));

        SocietyIssueRequest secondReport = new SocietyIssueRequest(
                2L,
                "Tower B Lift not working",
                "Lift is stationary at ground floor not taking calls",
                "ELEVATOR_LIFT",
                "Tower B",
                "Ground Floor",
                "Neighbor Bob",
                "9876543212",
                null,
                null,
                "HIGH"
        );

        SocietyIssue created = societyIssueService.createIssue(secondReport, "bob@greenwood.in");

        assertFalse(created.getIsClusterMaster());
        assertEquals(100L, created.getClusterId());
        assertEquals(2, master.getDuplicateCount());
    }

    @Test
    @DisplayName("Tenant Isolation: Accessing another society's issue is rejected with AccessDeniedException")
    void testCrossOrganizationIsolation() {
        SocietyIssue otherOrgIssue = new SocietyIssue();
        otherOrgIssue.setId(999L);
        otherOrgIssue.setOrganizationId(3L); // Palm Meadows

        when(issueRepository.findById(999L)).thenReturn(Optional.of(otherOrgIssue));

        // Greenwood manager (orgId: 2) attempts to access Palm Meadows issue (orgId: 3)
        assertThrows(AccessDeniedException.class, () ->
                societyIssueService.getIssueDetails(999L, 2L)
        );
    }

    @Test
    @DisplayName("Manager Workflow: Assign maintenance technician, update status, and record audit")
    void testManagerStaffAssignmentAndStatusUpdate() {
        SocietyIssue issue = new SocietyIssue();
        issue.setId(301L);
        issue.setOrganizationId(2L);
        issue.setStatus("REPORTED");

        when(issueRepository.findById(301L)).thenReturn(Optional.of(issue));
        when(issueRepository.save(any(SocietyIssue.class))).thenAnswer(inv -> inv.getArgument(0));

        SocietyIssueStatusUpdateRequest updateReq = new SocietyIssueStatusUpdateRequest(
                "IN_PROGRESS",
                "HIGH",
                "Ramesh Kumar",
                "Senior Electrician",
                "+91 98351 22345",
                "Technician on site replacing faulty circuit breaker"
        );

        SocietyIssue updated = societyIssueService.updateStatusAndStaff(301L, updateReq, "manager@greenwood.in", 2L);

        assertEquals("IN_PROGRESS", updated.getStatus());
        assertEquals("Ramesh Kumar", updated.getAssignedStaffName());
        verify(auditRepository, times(1)).save(any());
    }
}
