package com.adhikar.backend.dto;

import jakarta.validation.constraints.NotBlank;

public record ComplaintRequest(

        @NotBlank
        String title,

        @NotBlank
        String description,

        @NotBlank
        String category,

        @NotBlank
        String location,

        Double latitude,

        Double longitude

) {
}