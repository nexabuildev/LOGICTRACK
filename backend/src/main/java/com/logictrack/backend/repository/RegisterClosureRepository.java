package com.logictrack.backend.repository;

import com.logictrack.backend.model.RegisterClosure;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RegisterClosureRepository extends JpaRepository<RegisterClosure, Long> {
    List<RegisterClosure> findAllByOrderByClosedAtDesc();
}
