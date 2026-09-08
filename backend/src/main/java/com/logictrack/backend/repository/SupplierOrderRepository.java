package com.logictrack.backend.repository;

import com.logictrack.backend.model.SupplierOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SupplierOrderRepository extends JpaRepository<SupplierOrder, Long> {
    List<SupplierOrder> findAllByOrderByCreatedAtDesc();
    List<SupplierOrder> findByStatusInOrderByCreatedAtDesc(List<String> statuses);
}
