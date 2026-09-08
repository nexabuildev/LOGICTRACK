package com.logictrack.backend.controller;

import com.logictrack.backend.model.AuditLog;
import com.logictrack.backend.model.User;
import com.logictrack.backend.repository.AuditLogRepository;
import com.logictrack.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
public class UserManagementController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    private String getRole(Authentication auth) {
        return auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .map(r -> r.replace("ROLE_", ""))
                .findFirst().orElse("USER");
    }

    @GetMapping
    public ResponseEntity<?> getAllUsers(Authentication auth) {
        String role = getRole(auth);
        if (!List.of("ADMIN", "TECNICO").contains(role)) {
            return ResponseEntity.status(403).body("Acceso denegado");
        }
        List<User> users = userRepository.findAll().stream().filter(u -> u.getDeleted() == null || !u.getDeleted()).toList();
        List<Map<String, Object>> result = users.stream().map(u -> {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", u.getId());
            map.put("name", u.getName());
            map.put("lastName", u.getLastName());
            map.put("email", u.getEmail());
            map.put("role", u.getRole());
            map.put("active", u.isActive());
            map.put("enabled", u.isEnabled());
            map.put("createdAt", u.getCreatedAt());
            map.put("phoneNumber", u.getPhoneNumber());
            map.put("city", u.getCity());
            map.put("country", u.getCountry());
            return map;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getUserStats(Authentication auth) {
        String role = getRole(auth);
        if (!List.of("ADMIN", "TECNICO").contains(role)) {
            return ResponseEntity.status(403).body("Acceso denegado");
        }
        List<User> users = userRepository.findAll();
        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("total", users.size());
        stats.put("active", users.stream().filter(User::isActive).count());
        stats.put("inactive", users.stream().filter(u -> !u.isActive()).count());
        Map<String, Long> byRole = users.stream()
                .collect(Collectors.groupingBy(User::getRole, Collectors.counting()));
        stats.put("byRole", byRole);
        return ResponseEntity.ok(stats);
    }

    @PostMapping
    public ResponseEntity<?> createUser(@RequestBody Map<String, Object> payload, Authentication auth) {
        String callerRole = getRole(auth);
        String callerEmail = auth.getName();
        if (!List.of("ADMIN", "TECNICO").contains(callerRole)) {
            return ResponseEntity.status(403).body("Acceso denegado");
        }
        
        String email = (String) payload.get("email");
        if (email == null || email.isBlank()) return ResponseEntity.badRequest().body("Email requerido");
        if (userRepository.existsByEmail(email)) return ResponseEntity.badRequest().body("El email ya está registrado");
        
        String password = (String) payload.get("password");
        if (password == null || password.isBlank()) return ResponseEntity.badRequest().body("Contraseña requerida");
        
        User user = new User();
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        if (payload.containsKey("name")) user.setName((String) payload.get("name"));
        if (payload.containsKey("lastName")) user.setLastName((String) payload.get("lastName"));
        if (payload.containsKey("phoneNumber")) user.setPhoneNumber((String) payload.get("phoneNumber"));
        if (payload.containsKey("city")) user.setCity((String) payload.get("city"));
        if (payload.containsKey("country")) user.setCountry((String) payload.get("country"));
        if (payload.containsKey("role") && "ADMIN".equals(callerRole)) {
            user.setRole((String) payload.get("role"));
        } else {
            user.setRole("USER");
        }
        user.setActive(payload.containsKey("active") ? (Boolean) payload.get("active") : true);
        user.setEnabled(true);
        
        userRepository.save(user);
        auditLogRepository.save(new AuditLog(callerEmail, "USER_CREATED", "Usuario creado manualmente: " + email));
        
        return ResponseEntity.ok(Map.of("message", "Usuario creado correctamente"));
    }

    @PatchMapping("/{id}/active")
    public ResponseEntity<?> setUserActive(@PathVariable Long id, @RequestBody Map<String, Object> payload, Authentication auth) {
        String callerRole = getRole(auth);
        String callerEmail = auth.getName();
        if (!List.of("ADMIN", "TECNICO").contains(callerRole)) {
            return ResponseEntity.status(403).body("Acceso denegado");
        }
        User user = userRepository.findById(id).orElse(null);
        if (user == null) return ResponseEntity.badRequest().body("Usuario no encontrado");
        if ("TECNICO".equals(callerRole) && "ADMIN".equals(user.getRole())) {
            return ResponseEntity.status(403).body("Un TECNICO no puede modificar a un ADMIN");
        }
        boolean active = (Boolean) payload.get("active");
        user.setActive(active);
        userRepository.save(user);
        auditLogRepository.save(new AuditLog(
                callerEmail,
                active ? "USER_ACTIVATED" : "USER_DEACTIVATED",
                "Usuario " + (active ? "activado" : "desactivado") + ": " + user.getEmail()
        ));
        return ResponseEntity.ok(Map.of("message", "Estado actualizado correctamente", "active", active));
    }

    @PatchMapping("/{id}/role")
    public ResponseEntity<?> setUserRole(@PathVariable Long id, @RequestBody Map<String, Object> payload, Authentication auth) {
        String callerRole = getRole(auth);
        String callerEmail = auth.getName();
        if (!"ADMIN".equals(callerRole)) {
            return ResponseEntity.status(403).body("Solo ADMIN puede cambiar roles");
        }
        User user = userRepository.findById(id).orElse(null);
        if (user == null) return ResponseEntity.badRequest().body("Usuario no encontrado");
        String newRole = (String) payload.get("role");
        List<String> validRoles = List.of("ADMIN", "TECNICO", "GESTOR_TIENDA", "COMERCIAL", "USER");
        if (!validRoles.contains(newRole)) {
            return ResponseEntity.badRequest().body("Rol no valido: " + newRole);
        }
        String oldRole = user.getRole();
        user.setRole(newRole);
        userRepository.save(user);
        auditLogRepository.save(new AuditLog(
                callerEmail,
                "USER_ROLE_CHANGED",
                "Rol cambiado de " + oldRole + " a " + newRole + " para: " + user.getEmail()
        ));
        return ResponseEntity.ok(Map.of("message", "Rol actualizado correctamente", "role", newRole));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody Map<String, Object> payload, Authentication auth) {
        String callerRole = getRole(auth);
        String callerEmail = auth.getName();
        if (!List.of("ADMIN", "TECNICO").contains(callerRole)) {
            return ResponseEntity.status(403).body("Acceso denegado");
        }
        User user = userRepository.findById(id).orElse(null);
        if (user == null) return ResponseEntity.badRequest().body("Usuario no encontrado");
        if ("TECNICO".equals(callerRole) && "ADMIN".equals(user.getRole())) {
            return ResponseEntity.status(403).body("Un TECNICO no puede modificar a un ADMIN");
        }
        if (payload.containsKey("name")) user.setName((String) payload.get("name"));
        if (payload.containsKey("lastName")) user.setLastName((String) payload.get("lastName"));
        if (payload.containsKey("phoneNumber")) user.setPhoneNumber((String) payload.get("phoneNumber"));
        if (payload.containsKey("city")) user.setCity((String) payload.get("city"));
        if (payload.containsKey("country")) user.setCountry((String) payload.get("country"));
        if (payload.containsKey("active")) user.setActive((Boolean) payload.get("active"));
        if (payload.containsKey("role") && "ADMIN".equals(callerRole)) {
            user.setRole((String) payload.get("role"));
        }
        userRepository.save(user);
        auditLogRepository.save(new AuditLog(callerEmail, "USER_UPDATED", "Usuario editado: " + user.getEmail()));
        return ResponseEntity.ok(Map.of("message", "Usuario actualizado correctamente"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id, Authentication auth) {
        String callerRole = getRole(auth);
        String callerEmail = auth.getName();
        if (!"ADMIN".equals(callerRole)) {
            return ResponseEntity.status(403).body("Solo ADMIN puede eliminar usuarios");
        }
        User user = userRepository.findById(id).orElse(null);
        if (user == null) return ResponseEntity.badRequest().body("Usuario no encontrado");
        if (user.getEmail().equals(callerEmail)) {
            return ResponseEntity.badRequest().body("No puedes eliminar tu propia cuenta");
        }
        user.setDeleted(true);
        userRepository.save(user);
        auditLogRepository.save(new AuditLog(callerEmail, "USER_DELETED", "Usuario eliminado: " + user.getEmail()));
        return ResponseEntity.ok(Map.of("message", "Usuario eliminado correctamente"));
    }

    @GetMapping("/export/csv")
    public ResponseEntity<byte[]> exportUsersCsv(Authentication auth) {
        String role = getRole(auth);
        if (!List.of("ADMIN", "TECNICO").contains(role)) {
            return ResponseEntity.status(403).build();
        }
        List<User> users = userRepository.findAll();
        StringBuilder sb = new StringBuilder();
        sb.append("\uFEFF"); // BOM
        sb.append("ID; Nombre; Apellido; Email; Rol; Activo; Telefono; Ciudad; Pais; FechaRegistro\n");
        for (User u : users) {
            sb.append(u.getId()).append("; ");
            sb.append(u.getName() != null ? u.getName() : "").append("; ");
            sb.append(u.getLastName() != null ? u.getLastName() : "").append("; ");
            sb.append(u.getEmail()).append("; ");
            sb.append(u.getRole()).append("; ");
            sb.append(u.isActive()).append("; ");
            sb.append(u.getPhoneNumber() != null ? u.getPhoneNumber() : "").append("; ");
            sb.append(u.getCity() != null ? u.getCity() : "").append("; ");
            sb.append(u.getCountry() != null ? u.getCountry() : "").append("; ");
            sb.append(u.getCreatedAt() != null ? u.getCreatedAt().toLocalDate().toString() : "").append("\n");
        }
        byte[] bytes = sb.toString().getBytes(java.nio.charset.StandardCharsets.UTF_8);
        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=usuarios.csv")
                .header("Content-Type", "text/csv; charset=UTF-8")
                .body(bytes);
    }

    @Autowired
    private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @PostMapping("/import/csv")
    public ResponseEntity<?> importUsersCsv(
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file,
            Authentication auth) {
        String role = getRole(auth);
        String callerEmail = auth.getName();
        if (!List.of("ADMIN", "TECNICO").contains(role)) {
            return ResponseEntity.status(403).body("Acceso denegado");
        }
        if (file.isEmpty()) return ResponseEntity.badRequest().body("Archivo CSV vacío");
        try (java.io.BufferedReader reader = new java.io.BufferedReader(
                new java.io.InputStreamReader(file.getInputStream(), java.nio.charset.StandardCharsets.UTF_8))) {
            String line;
            boolean first = true;
            int count = 0;
            while ((line = reader.readLine()) != null) {
                if (line.trim().isEmpty()) continue;
                if (first) { first = false; continue; }
                String[] parts = line.split(";", -1);
                if (parts.length < 5) continue;
                String name = parts[0].trim();
                String lastName = parts[1].trim();
                String email = parts[2].trim();
                String plainPassword = parts[3].trim();
                String userRole = parts[4].trim().toUpperCase();
                
                if (name.isEmpty() || email.isEmpty() || plainPassword.isEmpty()) continue;
                if (userRepository.existsByEmail(email)) continue;

                User u = new User();
                u.setName(name);
                u.setLastName(lastName);
                u.setEmail(email);
                u.setPassword(passwordEncoder.encode(plainPassword));
                u.setRole(List.of("ADMIN", "TECNICO", "GESTOR_TIENDA", "COMERCIAL", "USER").contains(userRole) ? userRole : "USER");
                u.setActive(true);
                u.setEnabled(true); // Auto-activate imported users
                
                if (parts.length > 5 && !parts[5].trim().isEmpty()) u.setPhoneNumber(parts[5].trim());
                if (parts.length > 6 && !parts[6].trim().isEmpty()) u.setCity(parts[6].trim());
                if (parts.length > 7 && !parts[7].trim().isEmpty()) u.setCountry(parts[7].trim());

                userRepository.save(u);
                count++;
            }
            auditLogRepository.save(new AuditLog(callerEmail, "USERS_IMPORTED",
                "Importación CSV de usuarios: " + count + " creados"));
            return ResponseEntity.ok("Importados " + count + " usuarios correctamente");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error importando: " + e.getMessage());
        }
    }
}