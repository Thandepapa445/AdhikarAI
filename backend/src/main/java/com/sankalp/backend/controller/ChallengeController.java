package com.sankalp.backend.controller;

import com.sankalp.backend.dto.ChallengeRequest;
import com.sankalp.backend.dto.PilotVerificationRequest;
import com.sankalp.backend.entity.Challenge;
import com.sankalp.backend.service.ChallengeService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/challenges")
public class ChallengeController {

    private final ChallengeService challengeService;

    public ChallengeController(ChallengeService challengeService) {
        this.challengeService = challengeService;
    }

    @PostMapping
    public ResponseEntity<Challenge> createChallenge(
            @Valid @RequestBody ChallengeRequest request,
            Authentication authentication
    ) {
        String userEmail = authentication != null ? authentication.getName() : "citizen@jharkhand.gov.in";
        Challenge created = challengeService.createChallenge(request, userEmail);
        return ResponseEntity.ok(created);
    }

    @GetMapping
    public ResponseEntity<List<Challenge>> getAllChallenges() {
        return ResponseEntity.ok(challengeService.getAllChallenges());
    }

    @GetMapping("/my")
    public ResponseEntity<List<Challenge>> getMyChallenges(Authentication authentication) {
        String userEmail = authentication != null ? authentication.getName() : "citizen@jharkhand.gov.in";
        return ResponseEntity.ok(challengeService.getMyChallenges(userEmail));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Challenge> getChallengeById(@PathVariable Long id) {
        return ResponseEntity.ok(challengeService.getChallengeById(id));
    }

    @PostMapping("/{id}/verify-pilot")
    public ResponseEntity<Challenge> verifyPilot(
            @PathVariable Long id,
            @RequestBody(required = false) PilotVerificationRequest request
    ) {
        PilotVerificationRequest req = request != null ? request : new PilotVerificationRequest("Field pilot verified by Citizen / Gram Panchayat.");
        return ResponseEntity.ok(challengeService.verifyPilot(id, req));
    }

    @PostMapping("/{id}/upvote")
    public ResponseEntity<Challenge> upvoteChallenge(@PathVariable Long id) {
        return ResponseEntity.ok(challengeService.upvoteChallenge(id));
    }
}
