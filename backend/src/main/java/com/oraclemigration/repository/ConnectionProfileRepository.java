package com.oraclemigration.repository;

import com.oraclemigration.domain.ConnectionProfile;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ConnectionProfileRepository extends JpaRepository<ConnectionProfile, Long> {}
