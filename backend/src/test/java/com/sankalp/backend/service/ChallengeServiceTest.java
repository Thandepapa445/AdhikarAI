package com.sankalp.backend.service;

import com.sankalp.backend.dto.ChallengeRequest;
import com.sankalp.backend.entity.Challenge;
import com.sankalp.backend.repository.ChallengeRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ChallengeServiceTest {

    @Mock
    private ChallengeRepository challengeRepository;

    @Mock
    private SocietalChallengeAIService aiService;

    private ChallengeService challengeService;

    @BeforeEach
    void setUp() {
        challengeService = new ChallengeService(challengeRepository, aiService);
    }

    @Test
    @DisplayName("Safety Rule Escalation: Exposed wiring triggers CRITICAL priority")
    void testCriticalSafetyEscalationForExposedWiring() {
        ChallengeService.PriorityAssessment assessment = challengeService.calculateAuthoritativePriority(
                "Sparking power cable",
                "Exposed wire hanging near road posing electric shock risk",
                "INFRASTRUCTURE",
                0.90,
                "LOW" // client attempted to submit LOW, but server must escalate!
        );

        assertEquals("CRITICAL", assessment.priority());
        assertTrue(assessment.safetyFlags().contains("EMERGENCY_LIFE_SAFETY"));
        assertFalse(assessment.needsHumanReview());
    }

    @Test
    @DisplayName("High Urgency Rule: Deep crater or open manhole triggers HIGH priority")
    void testHighUrgencyForDangerousRoadHazard() {
        ChallengeService.PriorityAssessment assessment = challengeService.calculateAuthoritativePriority(
                "Open manhole on main road",
                "Deep crater causing accident risk to vehicles",
                "INFRASTRUCTURE",
                0.88,
                "MODERATE"
        );

        assertEquals("HIGH", assessment.priority());
        assertTrue(assessment.safetyFlags().contains("ROAD_HAZARD"));
    }

    @Test
    @DisplayName("Conservative Fallback: Low model confidence triggers human review with MODERATE priority")
    void testLowConfidenceConservativeFallback() {
        ChallengeService.PriorityAssessment assessment = challengeService.calculateAuthoritativePriority(
                "Unidentified road object",
                "Something strange on the footpath",
                "INFRASTRUCTURE",
                0.22, // Low confidence < 0.35
                "CRITICAL" // client tried to submit CRITICAL without verification
        );

        assertEquals("MODERATE", assessment.priority());
        assertTrue(assessment.needsHumanReview());
        assertTrue(assessment.safetyFlags().contains("LOW_CONFIDENCE"));
    }

    @Test
    @DisplayName("Routine Civic Maintenance: Minor garbage accumulation defaults to LOW priority")
    void testRoutineSanitationPriority() {
        ChallengeService.PriorityAssessment assessment = challengeService.calculateAuthoritativePriority(
                "Small garbage pile",
                "Household waste accumulated on street corner",
                "HEALTHCARE",
                0.85,
                "LOW"
        );

        assertEquals("LOW", assessment.priority());
        assertTrue(assessment.safetyFlags().contains("ROUTINE_MAINTENANCE"));
    }

    @Test
    @DisplayName("Haversine Distance: Correctly detects reports within 200m geodesic perimeter")
    void testHaversineDistanceCalculation() {
        // Two points ~55 meters apart in New Delhi
        double lat1 = 28.6139;
        double lon1 = 77.2090;
        double lat2 = 28.6143;
        double lon2 = 77.2093;

        double distance = ChallengeService.calculateHaversineDistanceMeters(lat1, lon1, lat2, lon2);
        assertTrue(distance < 200.0, "Points should be within 200 meters");
        assertTrue(distance > 30.0, "Points should be around 50-60 meters");
    }

    @Test
    @DisplayName("Duplicate Clustering: Groups nearby reports and escalates corroborated master")
    void testDuplicateClusteringAndEscalation() {
        // Setup existing master
        Challenge existingMaster = new Challenge();
        existingMaster.setId(101L);
        existingMaster.setClusterId(101L);
        existingMaster.setIsClusterMaster(true);
        existingMaster.setDuplicateCount(2);
        existingMaster.setPriority("MODERATE");
        existingMaster.setDomain("INFRASTRUCTURE");
        existingMaster.setLatitude(28.6139);
        existingMaster.setLongitude(77.2090);
        existingMaster.setStatus(Challenge.Status.SUBMITTED);

        when(challengeRepository.findByStatusNot(Challenge.Status.RESOLVED))
                .thenReturn(List.of(existingMaster));
        when(aiService.recommendUniversityRouting(any(), any()))
                .thenReturn(Map.of("assignedHei", "DTU", "department", "Lab", "mentor", "Mentor", "industryPartner", "Partner"));
        when(challengeRepository.save(any(Challenge.class)))
                .thenAnswer(inv -> inv.getArgument(0));

        ChallengeRequest newReport = new ChallengeRequest(
                "Pothole on street",
                "Pothole is visible on the asphalt surface",
                "INFRASTRUCTURE",
                "MODERATE",
                "INDIVIDUAL_CITIZEN",
                "Citizen B",
                "Central Delhi",
                "Connaught Place",
                "Ward 1",
                "Barakhamba Rd",
                28.6141, // ~25m away
                77.2091,
                500,
                "http://img.jpg",
                "MODERATE",
                "MODERATE",
                0.85,
                "Pothole on street",
                "A pothole is visible",
                false,
                "ROAD_MAINTENANCE"
        );

        Challenge saved = challengeService.createChallenge(newReport, "citizen_b@gmail.com");

        // Verification
        assertFalse(saved.getIsClusterMaster());
        assertEquals(101L, saved.getClusterId());

        // Master should be escalated to 3 reports -> HIGH priority
        assertEquals(3, existingMaster.getDuplicateCount());
        assertEquals("HIGH", existingMaster.getPriority());
        assertTrue(existingMaster.getPriorityExplanation().contains("corroborating citizen reports"));
    }

    @Test
    @DisplayName("Admin Priority Override: Authoritative override with required reason")
    void testAdminPriorityOverride() {
        Challenge c = new Challenge();
        c.setId(42L);
        c.setPriority("LOW");

        when(challengeRepository.findById(42L)).thenReturn(Optional.of(c));
        when(challengeRepository.save(any(Challenge.class))).thenAnswer(inv -> inv.getArgument(0));

        Challenge updated = challengeService.overridePriority(42L, "CRITICAL", "Field inspection confirmed severe hazard", "officer@adhikar.gov.in");

        assertEquals("CRITICAL", updated.getPriority());
        assertEquals("Field inspection confirmed severe hazard", updated.getPriorityOverrideReason());
        assertEquals("officer@adhikar.gov.in", updated.getPriorityOverriddenBy());
    }
}
