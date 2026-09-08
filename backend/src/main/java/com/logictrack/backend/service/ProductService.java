package com.logictrack.backend.service;

import com.logictrack.backend.dto.ProductRequestDTO;
import com.logictrack.backend.model.AuditLog;
import com.logictrack.backend.model.Product;
import com.logictrack.backend.model.StockTransaction;
import com.logictrack.backend.model.User;
import com.logictrack.backend.repository.AuditLogRepository;
import com.logictrack.backend.repository.ProductRepository;
import com.logictrack.backend.repository.StockTransactionRepository;
import com.logictrack.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.math.BigDecimal;

import com.logictrack.backend.repository.StoreRepository;
import com.logictrack.backend.model.Store;

@Service
public class ProductService {

    @Autowired
    private StoreRepository storeRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private StockTransactionRepository stockTransactionRepository;

    @Transactional(readOnly = true)
    public List<Product> getAllProducts(String userEmail, String role) {
        List<Product> list;
        if ("ADMIN".equals(role) || "TECNICO".equals(role)) {
            list = productRepository.findAll();
        } else {
            if (userEmail == null || userEmail.isBlank()) {
                return List.of();
            }
            list = productRepository.findByUserEmail(userEmail);
        }
        return list.stream().filter(p -> p.getDeleted() == null || !p.getDeleted()).toList();
    }

    @Transactional
    public Product createProduct(ProductRequestDTO dto) {
        if (productRepository.existsBySku(dto.sku())) {
            throw new IllegalArgumentException("Ya existe un producto con el SKU: " + dto.sku());
        }

        if (dto.stockQuantity() < 0) {
            throw new IllegalArgumentException("El stock no puede ser inferior a 0");
        }

        Product product = new Product();
        product.setSku(dto.sku());
        product.setName(dto.name());
        product.setDescription(dto.description());
        product.setPrice(dto.price());
        product.setStockQuantity(dto.stockQuantity());
        if (dto.minStockAlert() != null) {
            product.setMinStockAlert(dto.minStockAlert());
        }
        product.setSerialNumber(dto.serialNumber());
        product.setCondition(dto.condition() != null ? dto.condition() : "NUEVO");
        product.setFeatures(dto.features());

        User owner = null;
        if (dto.userEmail() != null && !dto.userEmail().isBlank()) {
            owner = userRepository.findByEmail(dto.userEmail())
                    .orElseThrow(() -> new IllegalArgumentException("Usuario propietario no encontrado"));
            product.setUser(owner);
        }

        if (dto.storeId() != null) {
            Store store = storeRepository.findById(dto.storeId()).orElse(null);
            product.setStore(store);
        }

        Product saved = productRepository.save(product);

        // Registrar log de auditoría
        auditLogRepository.save(new AuditLog(
                dto.userEmail(),
                "PRODUCT_CREATED",
                "Producto creado: " + saved.getName() + " (SKU: " + saved.getSku() + ", Stock: " + saved.getStockQuantity() + ")"
        ));

        // Registrar movimiento inicial de stock (Kardex)
        stockTransactionRepository.save(new StockTransaction(
                saved,
                owner,
                saved.getStockQuantity(),
                "INPUT",
                "Carga inicial del producto en el catálogo"
        ));

        return saved;
    }

    @Transactional
    public Product updateProduct(Long id, ProductRequestDTO dto, String editorEmail, String editorRole) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Producto no encontrado"));

        // Validar permisos: ADMIN y TECNICO pueden modificar cualquier producto
        if (!"ADMIN".equals(editorRole) && !"TECNICO".equals(editorRole)) {
            if (product.getUser() == null || !product.getUser().getEmail().equals(editorEmail)) {
                throw new IllegalArgumentException("No tienes permisos para modificar este producto");
            }
        }

        if (productRepository.existsBySkuAndIdNot(dto.sku(), id)) {
            throw new IllegalArgumentException("Ya existe otro producto con el SKU: " + dto.sku());
        }

        if (dto.stockQuantity() < 0) {
            throw new IllegalArgumentException("El stock no puede ser inferior a 0");
        }

        int oldStock = product.getStockQuantity();
        int newStock = dto.stockQuantity();

        product.setSku(dto.sku());
        product.setName(dto.name());
        product.setDescription(dto.description());
        product.setPrice(dto.price());
        product.setStockQuantity(dto.stockQuantity());
        if (dto.minStockAlert() != null) {
            product.setMinStockAlert(dto.minStockAlert());
        }
        product.setSerialNumber(dto.serialNumber());
        product.setCondition(dto.condition() != null ? dto.condition() : "NUEVO");
        product.setFeatures(dto.features());

        if (dto.storeId() != null) {
            Store store = storeRepository.findById(dto.storeId()).orElse(null);
            product.setStore(store);
        } else {
            product.setStore(null);
        }

        Product updated = productRepository.save(product);

        // Registrar log de auditoría
        auditLogRepository.save(new AuditLog(
                editorEmail,
                "PRODUCT_UPDATED",
                "Producto modificado: " + updated.getName() + " (SKU: " + updated.getSku() + ", Stock: " + updated.getStockQuantity() + ")"
        ));

        // Registrar movimiento de stock si cambió (Kardex)
        if (oldStock != newStock) {
            int change = newStock - oldStock;
            String type = change > 0 ? "INPUT" : "OUTPUT";
            String reason = "Ajuste manual de stock por el usuario/admin";

            User editor = userRepository.findByEmail(editorEmail).orElse(null);
            stockTransactionRepository.save(new StockTransaction(
                    updated,
                    editor,
                    change,
                    type,
                    reason
            ));
        }

        return updated;
    }

    @Transactional
    public void deleteProduct(Long id, String editorEmail, String editorRole) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Producto no encontrado"));

        // Validar permisos: ADMIN y TECNICO pueden eliminar cualquier producto
        if (!"ADMIN".equals(editorRole) && !"TECNICO".equals(editorRole)) {
            if (product.getUser() == null || !product.getUser().getEmail().equals(editorEmail)) {
                throw new IllegalArgumentException("No tienes permisos para eliminar este producto");
            }
        }

        product.setDeleted(true);
        productRepository.save(product);

        // Registrar log de auditoría
        auditLogRepository.save(new AuditLog(
                editorEmail,
                "PRODUCT_DELETED",
                "Producto eliminado: " + product.getName() + " (SKU: " + product.getSku() + ")"
        ));
    }

    @Transactional(readOnly = true)
    public List<StockTransaction> getProductTransactions(Long productId, String userEmail, String role) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Producto no encontrado"));

        // Validar privacidad de transacciones
        if (!"ADMIN".equals(role)) {
            if (product.getUser() == null || !product.getUser().getEmail().equals(userEmail)) {
                throw new IllegalArgumentException("No tienes permisos para ver el historial de movimientos de este producto");
            }
        }

        return stockTransactionRepository.findByProductIdOrderByCreatedAtDesc(productId);
    }

    @Transactional
    public void importProductsFromCsv(List<String[]> rows, String userEmail, String role) {
        User editor = userRepository.findByEmail(userEmail).orElse(null);

        for (String[] row : rows) {
            if (row.length < 5) continue; // Requiere sku, nombre, descripción, precio, stock
            String sku = row[0].trim();
            String name = row[1].trim();
            String description = row[2].trim();
            BigDecimal price = new BigDecimal(row[3].trim());
            int stockQuantity = Integer.parseInt(row[4].trim());
            int minStockAlert = row.length > 5 && !row[5].trim().isEmpty() ? Integer.parseInt(row[5].trim()) : 5;
            String serialNumber = row.length > 6 && !row[6].trim().isEmpty() ? row[6].trim() : null;
            String condition = row.length > 7 && !row[7].trim().isEmpty() ? row[7].trim() : "NUEVO";
            String features = row.length > 8 && !row[8].trim().isEmpty() ? row[8].trim() : "{}";

            if (stockQuantity < 0) {
                throw new IllegalArgumentException("El stock no puede ser inferior a 0 para el producto: " + name + " (SKU: " + sku + ")");
            }

            System.out.println("🔍 [CSV IMPORT DEBUG] Procesando SKU: '" + sku + "', Nombre: '" + name + "', Stock: " + stockQuantity);

            Optional<Product> existingOpt = productRepository.findBySku(sku);
            if (existingOpt.isPresent()) {
                Product product = existingOpt.get();
                // Validar permisos
                if (!"ADMIN".equals(role)) {
                    if (product.getUser() == null || !product.getUser().getEmail().equals(userEmail)) {
                        throw new IllegalArgumentException("No tienes permisos para modificar el producto con SKU: " + sku);
                    }
                }
                int oldStock = product.getStockQuantity();
                product.setName(name);
                product.setDescription(description);
                product.setPrice(price);
                product.setStockQuantity(stockQuantity);
                product.setMinStockAlert(minStockAlert);
                product.setSerialNumber(serialNumber);
                product.setCondition(condition);
                product.setFeatures(features);
                productRepository.save(product);

                // Registrar Kardex si cambió
                if (oldStock != stockQuantity) {
                    int change = stockQuantity - oldStock;
                    String type = change > 0 ? "INPUT" : "OUTPUT";
                    stockTransactionRepository.save(new StockTransaction(
                            product, editor, change, type, "Actualizado mediante importación masiva de CSV"
                    ));
                }
            } else {
                Product product = new Product();
                product.setSku(sku);
                product.setName(name);
                product.setDescription(description);
                product.setPrice(price);
                product.setStockQuantity(stockQuantity);
                product.setMinStockAlert(minStockAlert);
                product.setSerialNumber(serialNumber);
                product.setCondition(condition);
                product.setFeatures(features);
                product.setUser(editor);
                Product saved = productRepository.save(product);

                // Registrar Kardex inicial
                stockTransactionRepository.save(new StockTransaction(
                        saved, editor, stockQuantity, "INPUT", "Creado mediante importación masiva de CSV"
                ));
            }
        }

        auditLogRepository.save(new AuditLog(
                userEmail,
                "CATALOG_IMPORTED",
                "Importación masiva realizada con éxito. Total productos procesados: " + rows.size()
        ));
    }

    @Transactional(readOnly = true)
    public List<Product> getAllMarketplaceProducts() {
        return productRepository.findAll().stream()
                .filter(p -> p.getDeleted() == null || !p.getDeleted())
                .filter(p -> p.getStore() == null || p.getStore().isActive())
                .collect(java.util.stream.Collectors.toList());
    }


    @Transactional
    public Product buyProduct(Long productId, int quantity, String clientEmail) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Producto no encontrado"));

        if (product.getStockQuantity() < quantity) {
            throw new IllegalArgumentException("Stock insuficiente para realizar la compra. Quedan: " + product.getStockQuantity() + " unidades.");
        }

        int oldStock = product.getStockQuantity();
        product.setStockQuantity(oldStock - quantity);
        Product updated = productRepository.save(product);

        User buyer = userRepository.findByEmail(clientEmail).orElse(null);

        // Registrar en Kardex
        stockTransactionRepository.save(new StockTransaction(
                updated,
                buyer,
                -quantity,
                "OUTPUT",
                "Compra de cliente: " + clientEmail
        ));

        // Registrar log de auditoría
        auditLogRepository.save(new AuditLog(
                clientEmail,
                "PRODUCT_PURCHASED",
                "Cliente compró " + quantity + " unidades de " + updated.getName() + " (SKU: " + updated.getSku() + ")"
        ));

        return updated;
    }
}