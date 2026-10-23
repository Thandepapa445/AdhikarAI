package com.sankalp.backend.dto;

public record AuthResponse(
        String message,
        String token,
        Long id,
        String name,
        String email,
        String role,
        Long organizationId,
        String organizationName,
        String district
) {}
