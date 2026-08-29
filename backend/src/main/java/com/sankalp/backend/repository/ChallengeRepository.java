package com.sankalp.backend.repository;

import com.sankalp.backend.entity.Challenge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChallengeRepository extends JpaRepository<Challenge, Long> {

    List<Challenge> findByCitizenEmail(String citizenEmail);

    List<Challenge> findByDistrict(String district);

    List<Challenge> findByDomain(String domain);

    List<Challenge> findByStatus(Challenge.Status status);
}
