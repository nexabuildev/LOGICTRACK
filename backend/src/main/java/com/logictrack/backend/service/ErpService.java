package com.logictrack.backend.service;

import com.logictrack.backend.dto.*;
import com.logictrack.backend.model.*;
import com.logictrack.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ErpService {

    @Autowired private CategoryRepository categoryRepository;
    @Autowired private StockTransactionRepository stockTransactionRepository;
    @Autowired private StockTransferRepository stockTransferRepository;
    @Autowired private ProductRepository productRepository;
    @Autowired private StoreRepository storeRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private OrderRepository orderRepository;
    @Autowired private SalesReturnRepository salesReturnRepository;
    @Autowired private RegisterClosureRepository registerClosureRepository;
    @Autowired private SupplierRepository supplierRepository;
    @Autowired private SupplierOrderRepository supplierOrderRepository;
    @Autowired private ErpSettingsRepository erpSettingsRepository;
    @Autowired private TimeEntryRepository timeEntryRepository;
    @Autowired private AuditLogRepository auditLogRepository;

    // ─── Categories ───────────────────────────────────────────

    public List<Category> getAllCategories() {
        return categoryRepository.findAllByOrderByNameAsc().stream()
                .filter(c -> c.getDeleted() == null || !c.getDeleted())
                .collect(Collectors.toList());
    }

    @Transactional
    public Category createCategory(CategoryRequestDTO dto) {
        Category c = new Category();
        c.setName(dto.name());
        c.setType(dto.type() != null ? dto.type() : "CATEGORY");
        c.setParentId(dto.parentId());
        c.setActive(dto.active() == null || dto.active());
        return categoryRepository.save(c);
    }

    @Transactional
    public Category updateCategory(Long id, CategoryRequestDTO dto) {
        Category c = categoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Categoría no encontrada"));
        c.setName(dto.name());
        if (dto.type() != null) c.setType(dto.type());
        c.setParentId(dto.parentId());
        if (dto.active() != null) c.setActive(dto.active());
        return categoryRepository.save(c);
    }

    @Transactional
    public void deleteCategory(Long id) {
        categoryRepository.findById(id).ifPresent(c -> {
            c.setDeleted(true);
            categoryRepository.save(c);
        });
    }

    // ─── Stock adjustments ────────────────────────────────────

    public List<StockTransactionViewDTO> getAllStockTransactions() {
        return stockTransactionRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::toTransactionView)
                .collect(Collectors.toList());
    }

    public List<StockTransactionViewDTO> getAdjustments() {
        return stockTransactionRepository.findAllByOrderByCreatedAtDesc().stream()
                .filter(t -> "ADJUSTMENT".equals(t.getType()) || "MERMA".equals(t.getType()) || "ROTURA".equals(t.getType()))
                .map(this::toTransactionView)
                .collect(Collectors.toList());
    }

    @Transactional
    public StockTransactionViewDTO createAdjustment(StockAdjustmentRequestDTO dto, String userEmail) {
        Product product = productRepository.findById(dto.productId())
                .orElseThrow(() -> new IllegalArgumentException("Producto no encontrado"));
        if (dto.quantityChange() == null || dto.quantityChange() == 0) {
            throw new IllegalArgumentException("La cantidad debe ser distinta de cero");
        }
        int newStock = product.getStockQuantity() + dto.quantityChange();
        if (newStock < 0) throw new IllegalArgumentException("Stock resultante no puede ser negativo");

        User user = userRepository.findByEmail(userEmail).orElse(null);
        String type = dto.adjustmentType() != null ? dto.adjustmentType() : "ADJUSTMENT";
        String reason = dto.reason() != null ? dto.reason() : "Ajuste manual de inventario";

        product.setStockQuantity(newStock);
        productRepository.save(product);

        StockTransaction tx = new StockTransaction(product, user, dto.quantityChange(), type, reason);
        stockTransactionRepository.save(tx);

        auditLogRepository.save(new AuditLog(userEmail, "STOCK_ADJUSTMENT",
                "Ajuste en " + product.getSku() + ": " + dto.quantityChange() + " uds. Motivo: " + reason));

        return toTransactionView(tx);
    }

    // ─── Stock transfers ──────────────────────────────────────

    public List<StockTransfer> getAllTransfers() {
        return stockTransferRepository.findAllByOrderByCreatedAtDesc();
    }

    @Transactional
    public StockTransfer createTransfer(StockTransferRequestDTO dto, String userEmail) {
        if (dto.fromStoreId() == null || dto.toStoreId() == null) {
            throw new IllegalArgumentException("Debe indicar tienda origen y destino");
        }
        if (dto.fromStoreId().equals(dto.toStoreId())) {
            throw new IllegalArgumentException("Origen y destino deben ser distintos");
        }
        Store from = storeRepository.findById(dto.fromStoreId())
                .orElseThrow(() -> new IllegalArgumentException("Tienda origen no encontrada"));
        Store to = storeRepository.findById(dto.toStoreId())
                .orElseThrow(() -> new IllegalArgumentException("Tienda destino no encontrada"));
        Product product = productRepository.findById(dto.productId())
                .orElseThrow(() -> new IllegalArgumentException("Producto no encontrado"));
        if (dto.quantity() == null || dto.quantity() <= 0) {
            throw new IllegalArgumentException("Cantidad inválida");
        }
        if (product.getStockQuantity() < dto.quantity()) {
            throw new IllegalArgumentException("Stock insuficiente para el traspaso");
        }

        User user = userRepository.findByEmail(userEmail).orElse(null);

        StockTransfer transfer = new StockTransfer();
        transfer.setFromStore(from);
        transfer.setToStore(to);
        transfer.setProduct(product);
        transfer.setQuantity(dto.quantity());
        transfer.setNotes(dto.notes());
        transfer.setUser(user);
        transfer.setStatus("PENDING");
        stockTransferRepository.save(transfer);
        return transfer;
    }

    @Transactional
    public StockTransfer completeTransfer(Long id, String userEmail) {
        StockTransfer transfer = stockTransferRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Traspaso no encontrado"));
        if (!"PENDING".equals(transfer.getStatus())) {
            throw new IllegalArgumentException("El traspaso ya fue procesado");
        }
        Product product = transfer.getProduct();
        if (product.getStockQuantity() < transfer.getQuantity()) {
            throw new IllegalArgumentException("Stock insuficiente");
        }

        User user = userRepository.findByEmail(userEmail).orElse(null);
        product.setStore(transfer.getToStore());
        productRepository.save(product);

        stockTransactionRepository.save(new StockTransaction(
                product, user, -transfer.getQuantity(), "OUTPUT",
                "Traspaso a tienda " + transfer.getToStore().getName()));
        stockTransactionRepository.save(new StockTransaction(
                product, user, transfer.getQuantity(), "INPUT",
                "Traspaso desde tienda " + transfer.getFromStore().getName()));

        transfer.setStatus("COMPLETED");
        stockTransferRepository.save(transfer);

        auditLogRepository.save(new AuditLog(userEmail, "STOCK_TRANSFER",
                "Traspaso #" + id + ": " + transfer.getQuantity() + " uds de " + product.getSku()));
        return transfer;
    }

    @Transactional
    public StockTransfer updateTransfer(Long id, StockTransferRequestDTO dto, String userEmail) {
        StockTransfer transfer = stockTransferRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Traspaso no encontrado"));
        Store from = storeRepository.findById(dto.fromStoreId())
                .orElseThrow(() -> new IllegalArgumentException("Tienda origen no encontrada"));
        Store to = storeRepository.findById(dto.toStoreId())
                .orElseThrow(() -> new IllegalArgumentException("Tienda destino no encontrada"));
        Product product = productRepository.findById(dto.productId())
                .orElseThrow(() -> new IllegalArgumentException("Producto no encontrado"));
        if (dto.quantity() == null || dto.quantity() <= 0) {
            throw new IllegalArgumentException("Cantidad inválida");
        }
        transfer.setFromStore(from);
        transfer.setToStore(to);
        transfer.setProduct(product);
        transfer.setQuantity(dto.quantity());
        transfer.setNotes(dto.notes());
        auditLogRepository.save(new AuditLog(userEmail, "STOCK_TRANSFER_UPDATED",
                "Traspaso #" + id + " modificado: " + transfer.getQuantity() + " uds de " + product.getSku()));
        return stockTransferRepository.save(transfer);
    }

    // ─── Sales returns ────────────────────────────────────────

    public List<SalesReturn> getAllReturns() {
        return salesReturnRepository.findAllByOrderByCreatedAtDesc();
    }

    @Transactional
    public SalesReturn createReturn(SalesReturnRequestDTO dto, String userEmail) {
        Order order = orderRepository.findByIdWithItems(dto.orderId())
                .orElseThrow(() -> new IllegalArgumentException("Ticket no encontrado"));
        User user = userRepository.findByEmail(userEmail).orElse(null);

        SalesReturn salesReturn = new SalesReturn();
        salesReturn.setOrder(order);
        salesReturn.setUser(user);
        salesReturn.setReason(dto.reason());

        BigDecimal refund = BigDecimal.ZERO;
        for (SalesReturnRequestDTO.ReturnItemDTO itemDto : dto.items()) {
            Product product = productRepository.findById(itemDto.productId())
                    .orElseThrow(() -> new IllegalArgumentException("Producto no encontrado en devolución"));
            OrderItem orderItem = order.getItems().stream()
                    .filter(i -> i.getProduct().getId().equals(itemDto.productId()))
                    .findFirst()
                    .orElseThrow(() -> new IllegalArgumentException("Producto no pertenece al ticket"));

            SalesReturnItem ri = new SalesReturnItem();
            ri.setProduct(product);
            ri.setQuantity(itemDto.quantity());
            ri.setUnitPrice(orderItem.getUnitPrice());
            salesReturn.addItem(ri);

            product.setStockQuantity(product.getStockQuantity() + itemDto.quantity());
            productRepository.save(product);
            stockTransactionRepository.save(new StockTransaction(
                    product, user, itemDto.quantity(), "INPUT", "Devolución ticket #" + order.getId()));

            refund = refund.add(orderItem.getUnitPrice().multiply(BigDecimal.valueOf(itemDto.quantity())));
        }

        salesReturn.setRefundAmount(refund);
        salesReturnRepository.save(salesReturn);
        auditLogRepository.save(new AuditLog(userEmail, "SALES_RETURN", "Devolución ticket #" + order.getId()));
        return salesReturn;
    }

    // ─── Register closures ────────────────────────────────────

    public List<RegisterClosure> getAllClosures() {
        return registerClosureRepository.findAllByOrderByClosedAtDesc();
    }

    public Map<String, Object> getTodaySummary(Long storeId) {
        LocalDateTime start = LocalDate.now().atStartOfDay();
        LocalDateTime end = LocalDate.now().atTime(LocalTime.MAX);
        List<Order> orders = orderRepository.findAllByOrderByCreatedAtDesc().stream()
                .filter(o -> !o.getCreatedAt().isBefore(start) && !o.getCreatedAt().isAfter(end))
                .filter(o -> storeId == null || (o.getStore() != null && o.getStore().getId().equals(storeId)))
                .collect(Collectors.toList());

        BigDecimal total = BigDecimal.ZERO;
        BigDecimal cash = BigDecimal.ZERO;
        BigDecimal card = BigDecimal.ZERO;
        for (Order o : orders) {
            total = total.add(o.getTotalAmount());
            String pm = o.getPaymentMethod() != null ? o.getPaymentMethod() : "CASH";
            if ("CARD".equals(pm)) card = card.add(o.getTotalAmount());
            else if ("MIXED".equals(pm)) {
                cash = cash.add(o.getTotalAmount().divide(BigDecimal.valueOf(2), 2, java.math.RoundingMode.HALF_UP));
                card = card.add(o.getTotalAmount().divide(BigDecimal.valueOf(2), 2, java.math.RoundingMode.HALF_UP));
            } else cash = cash.add(o.getTotalAmount());
        }

        Map<String, Object> summary = new HashMap<>();
        summary.put("ordersCount", orders.size());
        summary.put("totalSales", total);
        summary.put("cashTotal", cash);
        summary.put("cardTotal", card);
        summary.put("date", LocalDate.now().toString());
        return summary;
    }

    @Transactional
    public RegisterClosure createClosure(RegisterClosureRequestDTO dto, String userEmail) {
        User user = userRepository.findByEmail(userEmail).orElse(null);
        Map<String, Object> summary = getTodaySummary(dto.storeId());

        RegisterClosure closure = new RegisterClosure();
        closure.setUser(user);
        if (dto.storeId() != null) {
            storeRepository.findById(dto.storeId()).ifPresent(closure::setStore);
        }
        closure.setOrdersCount((Integer) summary.get("ordersCount"));
        closure.setTotalSales((BigDecimal) summary.get("totalSales"));
        closure.setCashTotal((BigDecimal) summary.get("cashTotal"));
        closure.setCardTotal((BigDecimal) summary.get("cardTotal"));
        closure.setCashCounted(dto.cashCounted() != null ? dto.cashCounted() : BigDecimal.ZERO);
        closure.setDifference(closure.getCashCounted().subtract(closure.getCashTotal()));
        closure.setNotes(dto.notes());
        registerClosureRepository.save(closure);
        return closure;
    }

    // ─── Supplier orders ──────────────────────────────────────

    public List<SupplierOrder> getAllSupplierOrders() {
        return supplierOrderRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<SupplierOrder> getPendingSupplierOrders() {
        return supplierOrderRepository.findByStatusInOrderByCreatedAtDesc(
                List.of("SENT", "PARTIAL", "DRAFT"));
    }

    @Transactional
    public SupplierOrder createSupplierOrder(SupplierOrderRequestDTO dto) {
        Supplier supplier = supplierRepository.findById(dto.supplierId())
                .orElseThrow(() -> new IllegalArgumentException("Proveedor no encontrado"));

        SupplierOrder order = new SupplierOrder();
        order.setSupplier(supplier);
        order.setExpectedDate(dto.expectedDate());
        order.setNotes(dto.notes());
        order.setStatus(dto.status() != null ? dto.status() : "DRAFT");

        BigDecimal total = BigDecimal.ZERO;
        for (SupplierOrderRequestDTO.SupplierOrderItemDTO itemDto : dto.items()) {
            SupplierOrderItem item = new SupplierOrderItem();
            item.setProductId(itemDto.productId());
            item.setProductName(itemDto.productName());
            item.setSku(itemDto.sku());
            item.setQuantityOrdered(itemDto.quantityOrdered());
            item.setUnitCost(itemDto.unitCost());
            order.addItem(item);
            total = total.add(itemDto.unitCost().multiply(BigDecimal.valueOf(itemDto.quantityOrdered())));
        }
        order.setTotalAmount(total);
        return supplierOrderRepository.save(order);
    }

    @Transactional
    public SupplierOrder updateSupplierOrderStatus(Long id, String status) {
        SupplierOrder order = supplierOrderRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Orden no encontrada"));
        order.setStatus(status);
        return supplierOrderRepository.save(order);
    }

    @Transactional
    public SupplierOrder receiveGoods(Long orderId, GoodsReceiveRequestDTO dto, String userEmail) {
        SupplierOrder order = supplierOrderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Orden de compra no encontrada"));
        User user = userRepository.findByEmail(userEmail).orElse(null);

        boolean allReceived = true;
        for (GoodsReceiveRequestDTO.ReceiveItemDTO recv : dto.items()) {
            SupplierOrderItem item = order.getItems().stream()
                    .filter(i -> i.getId().equals(recv.itemId()))
                    .findFirst()
                    .orElseThrow(() -> new IllegalArgumentException("Línea no encontrada"));

            int newReceived = item.getQuantityReceived() + recv.quantityReceived();
            if (newReceived > item.getQuantityOrdered()) {
                throw new IllegalArgumentException("Cantidad recibida excede lo pedido para " + item.getProductName());
            }
            item.setQuantityReceived(newReceived);
            if (newReceived < item.getQuantityOrdered()) allReceived = false;

            if (item.getProductId() != null) {
                Product product = productRepository.findById(item.getProductId()).orElse(null);
                if (product != null) {
                    product.setStockQuantity(product.getStockQuantity() + recv.quantityReceived());
                    productRepository.save(product);
                    stockTransactionRepository.save(new StockTransaction(
                            product, user, recv.quantityReceived(), "INPUT",
                            "Recepción OC #" + orderId));
                }
            }
        }

        order.setStatus(allReceived ? "RECEIVED" : "PARTIAL");
        supplierOrderRepository.save(order);
        auditLogRepository.save(new AuditLog(userEmail, "GOODS_RECEIVED", "Recepción OC #" + orderId));
        return order;
    }

    // ─── ERP Settings ─────────────────────────────────────────

    public ErpSettings getSettings() {
        return erpSettingsRepository.findById(1L).orElseGet(() -> {
            ErpSettings s = new ErpSettings();
            return erpSettingsRepository.save(s);
        });
    }

    @Transactional
    public ErpSettings updateSettings(ErpSettings settings) {
        ErpSettings existing = getSettings();
        existing.setCompanyName(settings.getCompanyName());
        existing.setTaxId(settings.getTaxId());
        existing.setAddress(settings.getAddress());
        existing.setCity(settings.getCity());
        existing.setCountry(settings.getCountry());
        existing.setPhone(settings.getPhone());
        existing.setEmail(settings.getEmail());
        existing.setLogoUrl(settings.getLogoUrl());
        existing.setPosTicketMessage(settings.getPosTicketMessage());
        existing.setCurrency(settings.getCurrency());
        existing.setTaxRate(settings.getTaxRate());
        existing.setStockAlertsEnabled(settings.getStockAlertsEnabled());
        existing.setStockAlertEmail(settings.getStockAlertEmail());
        existing.setDefaultMinStockAlert(settings.getDefaultMinStockAlert());
        return erpSettingsRepository.save(existing);
    }

    // ─── Time tracking ────────────────────────────────────────

    public List<TimeEntry> getAllTimeEntries() {
        return timeEntryRepository.findAllByOrderByClockInDesc();
    }

    @Transactional
    public TimeEntry clockIn(TimeEntryRequestDTO dto, String userEmail) {
        User user;
        if (dto.userId() != null) {
            user = userRepository.findById(dto.userId())
                    .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
        } else {
            user = userRepository.findByEmail(userEmail)
                    .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
        }
        timeEntryRepository.findFirstByUserIdAndClockOutIsNullOrderByClockInDesc(user.getId())
                .ifPresent(e -> { throw new IllegalArgumentException("El usuario ya tiene un fichaje abierto"); });

        TimeEntry entry = new TimeEntry();
        entry.setUser(user);
        entry.setClockIn(LocalDateTime.now());
        entry.setNotes(dto.notes());
        if (dto.storeId() != null) {
            storeRepository.findById(dto.storeId()).ifPresent(entry::setStore);
        }
        return timeEntryRepository.save(entry);
    }

    @Transactional
    public TimeEntry clockOut(Long userId, String userEmail) {
        Long targetUserId = userId;
        if (targetUserId == null) {
            User user = userRepository.findByEmail(userEmail)
                    .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
            targetUserId = user.getId();
        }
        TimeEntry entry = timeEntryRepository.findFirstByUserIdAndClockOutIsNullOrderByClockInDesc(targetUserId)
                .orElseThrow(() -> new IllegalArgumentException("No hay fichaje abierto"));
        entry.setClockOut(LocalDateTime.now());
        return timeEntryRepository.save(entry);
    }

    // ─── Analytics ────────────────────────────────────────────

    public List<Map<String, Object>> getStoreAnalytics() {
        List<Store> stores = storeRepository.findAll();
        List<Product> products = productRepository.findAll();
        List<Order> orders = orderRepository.findAllByOrderByCreatedAtDesc();

        List<Map<String, Object>> result = new ArrayList<>();
        for (Store store : stores) {
            List<Product> storeProducts = products.stream()
                    .filter(p -> p.getStore() != null && p.getStore().getId().equals(store.getId()))
                    .collect(Collectors.toList());
            BigDecimal inventoryValue = storeProducts.stream()
                    .map(p -> p.getPrice().multiply(BigDecimal.valueOf(p.getStockQuantity())))
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            long lowStock = storeProducts.stream()
                    .filter(p -> p.getStockQuantity() <= p.getMinStockAlert()).count();
            BigDecimal sales = orders.stream()
                    .filter(o -> o.getStore() != null && o.getStore().getId().equals(store.getId()))
                    .map(Order::getTotalAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            Map<String, Object> row = new HashMap<>();
            row.put("storeId", store.getId());
            row.put("storeName", store.getName());
            row.put("productCount", storeProducts.size());
            row.put("inventoryValue", inventoryValue);
            row.put("lowStockCount", lowStock);
            row.put("totalSales", sales);
            row.put("active", store.isActive());
            result.add(row);
        }
        return result;
    }

    public Map<String, List<String>> getRolePermissionsMatrix() {
        Map<String, List<String>> matrix = new LinkedHashMap<>();
        matrix.put("ADMIN", List.of(
                "Panel ERP completo", "Gestión usuarios y roles", "Auditoría",
                "Configuración empresa", "TPV", "Compras a proveedores", "Todas las tiendas"));
        matrix.put("TECNICO", List.of(
                "Inventario y productos", "Proveedores y compras", "Tiendas",
                "Equipo (lectura/edición)", "Ajustes de stock", "Traspasos"));
        matrix.put("GESTOR_TIENDA", List.of(
                "TPV y ventas", "Productos de su tienda", "Directorio tiendas",
                "Historial ventas", "Cierre de caja"));
        matrix.put("COMERCIAL", List.of(
                "TPV", "Historial ventas", "Devoluciones"));
        matrix.put("USER", List.of(
                "Marketplace", "Mi cuenta", "Historial compras"));
        return matrix;
    }

    private StockTransactionViewDTO toTransactionView(StockTransaction tx) {
        Product p = tx.getProduct();
        String email = tx.getUser() != null ? tx.getUser().getEmail() : "Sistema";
        return new StockTransactionViewDTO(
                tx.getId(),
                p != null ? p.getId() : null,
                p != null ? p.getName() : "—",
                p != null ? p.getSku() : "—",
                email,
                tx.getQuantityChange(),
                tx.getType(),
                tx.getReason(),
                tx.getCreatedAt()
        );
    }
}
