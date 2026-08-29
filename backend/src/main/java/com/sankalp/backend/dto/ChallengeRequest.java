package com.sankalp.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ChallengeRequest(
        @NotBlank(message = "Title is required")
        String title,

        @NotBlank(message = "Description is required")
        String description,

        String domain,

        String urgency,

        @NotBlank(message = "Submitter type is required")
        String submitterType,

        @NotBlank(message = "Submitter name is required")
        String submitterName,

        @NotBlank(message = "District is required")
        String district,

        @NotBlank(message = "Block is required")
        String block,

        @NotBlank(message = "Panchayat is required")
        String panchayat,

        String locationText,

        Double latitude,

        Double longitude,

        Integer affectedPopulation,

        String evidenceImageUrl
) {}
