package com.logictrack.backend.repository;

import com.logictrack.backend.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long>
{
    boolean existsBySku(String sku);
    boolean existsBySkuAndIdNot(String sku, Long id);
    java.util.List<Product> findByUserEmail(String email);
    java.util.Optional<Product> findBySku(String sku);
}
