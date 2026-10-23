package com.sankalp.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record SocietyIssueRequest(
        @NotNull(message = "Organization ID is required")
        Long organizationId,

        @NotBlank(message = "Title is required")
        String title,

        @NotBlank(message = "Description is required")
        String description,

        @NotBlank(message = "Category is required")
        String category,

        @NotBlank(message = "Building / Tower is required")
        String buildingTower,

        @NotBlank(message = "Unit / Floor is required")
        String unitFloor,

        @NotBlank(message = "Resident name is required")
        String residentName,

        String residentPhone,
        String evidenceImageUrl,
        String aiSuggestedDescription,
        String priority
) {}
