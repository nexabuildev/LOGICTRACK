package com.logictrack.backend.controller;

import com.logictrack.backend.dto.*;
import com.logictrack.backend.model.*;
import com.logictrack.backend.service.ErpService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/erp")
public class ErpController {

    @Autowired
    private ErpService erpService;

    private String email(Authentication auth) {
        return auth != null ? auth.getName() : null;
    }

    // Categories
    @GetMapping("/categories")
    public ResponseEntity<List<Category>> getCategories() {
        return ResponseEntity.ok(erpService.getAllCategories());
    }

    @PostMapping("/categories")
    public ResponseEntity<?> createCategory(@RequestBody CategoryRequestDTO dto) {
        try {
            return ResponseEntity.ok(erpService.createCategory(dto));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/categories/{id}")
    public ResponseEntity<?> updateCategory(@PathVariable Long id, @RequestBody CategoryRequestDTO dto) {
        try {
            return ResponseEntity.ok(erpService.updateCategory(id, dto));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/categories/{id}")
    public ResponseEntity<?> deleteCategory(@PathVariable Long id) {
        erpService.deleteCategory(id);
        return ResponseEntity.ok().build();
    }

    // Stock
    @GetMapping("/stock/transactions")
    public ResponseEntity<List<StockTransactionViewDTO>> getTransactions() {
        return ResponseEntity.ok(erpService.getAllStockTransactions());
    }

    @GetMapping("/stock/adjustments")
    public ResponseEntity<List<StockTransactionViewDTO>> getAdjustments() {
        return ResponseEntity.ok(erpService.getAdjustments());
    }

    @PostMapping("/stock/adjustments")
    public ResponseEntity<?> createAdjustment(@RequestBody StockAdjustmentRequestDTO dto, Authentication auth) {
        try {
            return ResponseEntity.ok(erpService.createAdjustment(dto, email(auth)));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/stock/transfers")
    public ResponseEntity<List<StockTransfer>> getTransfers() {
        return ResponseEntity.ok(erpService.getAllTransfers());
    }

    @PostMapping("/stock/transfers")
    public ResponseEntity<?> createTransfer(@RequestBody StockTransferRequestDTO dto, Authentication auth) {
        try {
            return ResponseEntity.ok(erpService.createTransfer(dto, email(auth)));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/stock/transfers/{id}/complete")
    public ResponseEntity<?> completeTransfer(@PathVariable Long id, Authentication auth) {
        try {
            return ResponseEntity.ok(erpService.completeTransfer(id, email(auth)));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/stock/transfers/{id}")
    public ResponseEntity<?> updateTransfer(@PathVariable Long id, @RequestBody StockTransferRequestDTO dto, Authentication auth) {
        try {
            return ResponseEntity.ok(erpService.updateTransfer(id, dto, email(auth)));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Returns
    @GetMapping("/returns")
    public ResponseEntity<List<SalesReturn>> getReturns() {
        return ResponseEntity.ok(erpService.getAllReturns());
    }

    @PostMapping("/returns")
    public ResponseEntity<?> createReturn(@RequestBody SalesReturnRequestDTO dto, Authentication auth) {
        try {
            return ResponseEntity.ok(erpService.createReturn(dto, email(auth)));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Register closures
    @GetMapping("/register-closures")
    public ResponseEntity<List<RegisterClosure>> getClosures() {
        return ResponseEntity.ok(erpService.getAllClosures());
    }

    @GetMapping("/register-closures/today-summary")
    public ResponseEntity<Map<String, Object>> getTodaySummary(@RequestParam(required = false) Long storeId) {
        return ResponseEntity.ok(erpService.getTodaySummary(storeId));
    }

    @PostMapping("/register-closures")
    public ResponseEntity<?> createClosure(@RequestBody RegisterClosureRequestDTO dto, Authentication auth) {
        try {
            return ResponseEntity.ok(erpService.createClosure(dto, email(auth)));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Supplier orders
    @GetMapping("/supplier-orders")
    public ResponseEntity<List<SupplierOrder>> getSupplierOrders() {
        return ResponseEntity.ok(erpService.getAllSupplierOrders());
    }

    @GetMapping("/supplier-orders/pending")
    public ResponseEntity<List<SupplierOrder>> getPendingOrders() {
        return ResponseEntity.ok(erpService.getPendingSupplierOrders());
    }

    @PostMapping("/supplier-orders")
    public ResponseEntity<?> createSupplierOrder(@RequestBody SupplierOrderRequestDTO dto) {
        try {
            return ResponseEntity.ok(erpService.createSupplierOrder(dto));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PatchMapping("/supplier-orders/{id}/status")
    public ResponseEntity<?> updateOrderStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        try {
            return ResponseEntity.ok(erpService.updateSupplierOrderStatus(id, body.get("status")));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/supplier-orders/{id}/receive")
    public ResponseEntity<?> receiveGoods(@PathVariable Long id, @RequestBody GoodsReceiveRequestDTO dto, Authentication auth) {
        try {
            return ResponseEntity.ok(erpService.receiveGoods(id, dto, email(auth)));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Settings
    @GetMapping("/settings")
    public ResponseEntity<ErpSettings> getSettings() {
        return ResponseEntity.ok(erpService.getSettings());
    }

    @PutMapping("/settings")
    public ResponseEntity<ErpSettings> updateSettings(@RequestBody ErpSettings settings) {
        return ResponseEntity.ok(erpService.updateSettings(settings));
    }

    // Time entries
    @GetMapping("/time-entries")
    public ResponseEntity<List<TimeEntry>> getTimeEntries() {
        return ResponseEntity.ok(erpService.getAllTimeEntries());
    }

    @PostMapping("/time-entries/clock-in")
    public ResponseEntity<?> clockIn(@RequestBody TimeEntryRequestDTO dto, Authentication auth) {
        try {
            return ResponseEntity.ok(erpService.clockIn(dto, email(auth)));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/time-entries/clock-out")
    public ResponseEntity<?> clockOut(@RequestBody(required = false) Map<String, Long> body, Authentication auth) {
        try {
            Long userId = body != null ? body.get("userId") : null;
            return ResponseEntity.ok(erpService.clockOut(userId, email(auth)));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Analytics & permissions
    @GetMapping("/analytics/stores")
    public ResponseEntity<List<Map<String, Object>>> getStoreAnalytics() {
        return ResponseEntity.ok(erpService.getStoreAnalytics());
    }

    @GetMapping("/roles/permissions-matrix")
    public ResponseEntity<Map<String, List<String>>> getPermissionsMatrix() {
        return ResponseEntity.ok(erpService.getRolePermissionsMatrix());
    }
}
