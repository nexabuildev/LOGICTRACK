package com.logictrack.backend.repository;

import com.logictrack.backend.model.TimeEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TimeEntryRepository extends JpaRepository<TimeEntry, Long> {
    List<TimeEntry> findAllByOrderByClockInDesc();
    Optional<TimeEntry> findFirstByUserIdAndClockOutIsNullOrderByClockInDesc(Long userId);
    List<TimeEntry> findByUserIdOrderByClockInDesc(Long userId);
}
