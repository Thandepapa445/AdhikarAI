package com.sankalp.backend.service;

import com.sankalp.backend.dto.ChallengeRequest;
import com.sankalp.backend.dto.PilotVerificationRequest;
import com.sankalp.backend.entity.Challenge;
import com.sankalp.backend.repository.ChallengeRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
public class ChallengeService {

    private final ChallengeRepository challengeRepository;
    private final SocietalChallengeAIService aiService;

    public ChallengeService(ChallengeRepository challengeRepository, SocietalChallengeAIService aiService) {
        this.challengeRepository = challengeRepository;
        this.aiService = aiService;
    }

    public Challenge createChallenge(ChallengeRequest request, String citizenEmail) {
        String combinedText = request.title() + " " + request.description();

        String domain = (request.domain() != null && !request.domain().isBlank())
                ? request.domain()
                : aiService.predictDomain(combinedText);

        String urgency = (request.urgency() != null && !request.urgency().isBlank())
                ? request.urgency()
                : aiService.predictUrgency(combinedText);

        Map<String, String> routing = aiService.recommendUniversityRouting(domain, request.district());

        Challenge challenge = new Challenge();
        challenge.setTitle(request.title());
        challenge.setDescription(request.description());
        challenge.setDomain(domain);
        challenge.setDomainName(getDomainDisplayName(domain));
        challenge.setUrgency(urgency);
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

        return challengeRepository.save(challenge);
    }

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
