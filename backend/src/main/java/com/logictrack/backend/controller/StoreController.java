package com.logictrack.backend.controller;

import com.logictrack.backend.model.AuditLog;
import com.logictrack.backend.model.Store;
import com.logictrack.backend.repository.AuditLogRepository;
import com.logictrack.backend.service.StoreService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/stores")
public class StoreController {

    @Autowired
    private StoreService storeService;

    @Autowired
    private AuditLogRepository auditLogRepository;

    private String getRole(Authentication auth) {
        return auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .map(r -> r.replace("ROLE_", ""))
                .findFirst().orElse("USER");
    }

    @GetMapping
    public ResponseEntity<?> getAllStores(Authentication auth) {
        String role = getRole(auth);
        if (!List.of("ADMIN", "TECNICO", "GESTOR_TIENDA").contains(role)) {
            return ResponseEntity.status(403).body("Acceso denegado");
        }
        return ResponseEntity.ok(storeService.getAllStores());
    }

    @PostMapping
    public ResponseEntity<?> createStore(@RequestBody Map<String, String> payload, Authentication auth) {
        String role = getRole(auth);
        String callerEmail = auth.getName();
        if (!List.of("ADMIN", "TECNICO").contains(role)) {
            return ResponseEntity.status(403).body("Acceso denegado");
        }
        try {
            Store store = storeService.createStore(
                payload.get("name"),
                payload.get("address"),
                payload.get("city"),
                payload.get("phone"),
                payload.get("email")
            );
            auditLogRepository.save(new AuditLog(callerEmail, "STORE_CREATED",
                "Tienda creada: " + store.getName() + " (ID: " + store.getId() + ", Ciudad: " + (store.getCity() != null ? store.getCity() : "N/A") + ")"));
            return ResponseEntity.ok(store);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateStore(@PathVariable Long id, @RequestBody Map<String, Object> payload, Authentication auth) {
        String role = getRole(auth);
        String callerEmail = auth.getName();
        if (!List.of("ADMIN", "TECNICO").contains(role)) {
            return ResponseEntity.status(403).body("Acceso denegado");
        }
        try {
            Boolean isActive = payload.get("isActive") != null ? (Boolean) payload.get("isActive") : null;
            Store store = storeService.updateStore(
                id,
                (String) payload.get("name"),
                (String) payload.get("address"),
                (String) payload.get("city"),
                (String) payload.get("phone"),
                (String) payload.get("email"),
                isActive
            );
            String action = isActive != null
                ? (isActive ? "STORE_ACTIVATED" : "STORE_PAUSED")
                : "STORE_UPDATED";
            String detail = isActive != null
                ? "Tienda " + (isActive ? "activada" : "pausada") + ": " + store.getName()
                : "Tienda actualizada: " + store.getName() + " (ID: " + store.getId() + ")";
            auditLogRepository.save(new AuditLog(callerEmail, action, detail));
            return ResponseEntity.ok(store);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteStore(@PathVariable Long id, Authentication auth) {
        String role = getRole(auth);
        String callerEmail = auth.getName();
        if (!"ADMIN".equals(role)) {
            return ResponseEntity.status(403).body("Solo el ADMIN puede eliminar tiendas");
        }
        try {
            Store store = storeService.getStoreById(id);
            String storeName = store.getName();
            storeService.deleteStore(id);
            auditLogRepository.save(new AuditLog(callerEmail, "STORE_DELETED",
                "Tienda eliminada: " + storeName + " (ID: " + id + ")"));
            return ResponseEntity.ok("Tienda eliminada correctamente");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getStoreById(@PathVariable Long id, Authentication auth) {
        String role = getRole(auth);
        if (!List.of("ADMIN", "TECNICO", "GESTOR_TIENDA").contains(role)) {
            return ResponseEntity.status(403).body("Acceso denegado");
        }
        try {
            return ResponseEntity.ok(storeService.getStoreById(id));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/export/csv")
    public ResponseEntity<byte[]> exportStoresCsv(Authentication auth) {
        String role = getRole(auth);
        String callerEmail = auth.getName();
        if (!List.of("ADMIN", "TECNICO").contains(role)) {
            return ResponseEntity.status(403).build();
        }
        List<Store> stores = storeService.getAllStores();
        StringBuilder sb = new StringBuilder();
        sb.append("\uFEFF");
        sb.append("Nombre; Direccion; Ciudad; Telefono; Email; Activa\n");
        for (Store s : stores) {
            sb.append(s.getName() != null ? s.getName() : "").append("; ");
            sb.append(s.getAddress() != null ? s.getAddress() : "").append("; ");
            sb.append(s.getCity() != null ? s.getCity() : "").append("; ");
            sb.append(s.getPhone() != null ? s.getPhone() : "").append("; ");
            sb.append(s.getEmail() != null ? s.getEmail() : "").append("; ");
            sb.append(s.isActive()).append("\n");
        }
        auditLogRepository.save(new AuditLog(callerEmail, "STORES_EXPORTED",
            "Exportacion CSV de tiendas: " + stores.size() + " registros"));
        byte[] bytes = sb.toString().getBytes(java.nio.charset.StandardCharsets.UTF_8);
        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=tiendas.csv")
                .header("Content-Type", "text/csv; charset=UTF-8")
                .body(bytes);
    }

    @PostMapping("/import/csv")
    public ResponseEntity<?> importStoresCsv(
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file,
            Authentication auth) {
        String role = getRole(auth);
        String callerEmail = auth.getName();
        if (!List.of("ADMIN", "TECNICO").contains(role)) {
            return ResponseEntity.status(403).body("Acceso denegado");
        }
        if (file.isEmpty()) return ResponseEntity.badRequest().body("Archivo CSV vacio");
        try (java.io.BufferedReader reader = new java.io.BufferedReader(
                new java.io.InputStreamReader(file.getInputStream(), java.nio.charset.StandardCharsets.UTF_8))) {
            String line;
            boolean first = true;
            int count = 0;
            while ((line = reader.readLine()) != null) {
                if (line.trim().isEmpty()) continue;
                if (first) { first = false; continue; }
                String[] parts = line.split(";", -1);
                if (parts.length < 2) continue;
                String name = parts[0].trim();
                String address = parts.length > 1 ? parts[1].trim() : "";
                String city = parts.length > 2 ? parts[2].trim() : "";
                String phone = parts.length > 3 ? parts[3].trim() : "";
                String email = parts.length > 4 ? parts[4].trim() : "";
                if (name.isEmpty()) continue;
                storeService.createStore(name, address, city, phone, email);
                count++;
            }
            auditLogRepository.save(new AuditLog(callerEmail, "STORES_IMPORTED",
                "Importacion CSV de tiendas: " + count + " tiendas creadas"));
            return ResponseEntity.ok("Importadas " + count + " tiendas correctamente");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error importando: " + e.getMessage());
        }
    }
}