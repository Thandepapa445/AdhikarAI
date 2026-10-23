package com.sankalp.backend.repository;

import com.sankalp.backend.entity.MaintenanceStaff;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MaintenanceStaffRepository extends JpaRepository<MaintenanceStaff, Long> {
    List<MaintenanceStaff> findByOrganizationId(Long organizationId);
    List<MaintenanceStaff> findByOrganizationIdAndIsAvailableTrue(Long organizationId);
}
