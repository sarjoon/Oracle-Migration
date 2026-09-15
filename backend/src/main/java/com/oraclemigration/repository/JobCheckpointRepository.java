package com.oraclemigration.repository;

import com.oraclemigration.domain.JobCheckpoint;
import java.util.*;
import org.springframework.data.jpa.repository.JpaRepository;

public interface JobCheckpointRepository extends JpaRepository<JobCheckpoint, Long> {
  List<JobCheckpoint> findByJobIdOrderByPhaseAscObjectTypeAscObjectNameAscChunkNumberAsc(Long id);

  List<JobCheckpoint> findByJobIdAndStatusIn(Long id, Collection<JobCheckpoint.Status> s);

  Optional<JobCheckpoint> findByJobIdAndPhaseAndObjectTypeAndObjectNameAndChunkNumber(
      Long j, String p, String t, String n, int c);
}
