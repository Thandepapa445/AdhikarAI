package com.sankalp.backend.dto;

public record SocietyDashboardMetrics(
        long totalIssues,
        long openIssues,
        long inProgressIssues,
        long resolvedIssues,
        long overdueIssues,
        long criticalIssues,
        double averageResolutionHours,
        long totalClusters
) {}
