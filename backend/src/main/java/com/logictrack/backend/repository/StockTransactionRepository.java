package com.logictrack.backend.repository;

import com.logictrack.backend.model.StockTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StockTransactionRepository extends JpaRepository<StockTransaction, Long> {
    List<StockTransaction> findByProductIdOrderByCreatedAtDesc(Long productId);
    List<StockTransaction> findAllByOrderByCreatedAtDesc();
    List<StockTransaction> findByTypeOrderByCreatedAtDesc(String type);
}
