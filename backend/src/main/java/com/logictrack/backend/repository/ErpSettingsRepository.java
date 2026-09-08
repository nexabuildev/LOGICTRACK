package com.logictrack.backend.repository;

import com.logictrack.backend.model.ErpSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ErpSettingsRepository extends JpaRepository<ErpSettings, Long> {}
