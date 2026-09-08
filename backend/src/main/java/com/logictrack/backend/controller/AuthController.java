package com.logictrack.backend.controller;

import com.logictrack.backend.model.AuditLog;
import com.logictrack.backend.model.User;
import com.logictrack.backend.repository.AuditLogRepository;
import com.logictrack.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.HashMap;
import java.util.Optional;
import java.util.Random;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private com.logictrack.backend.service.JwtService jwtService;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody Map<String, Object> payload) {
        String email = (String) payload.get("email");
        String name = (String) payload.get("name");
        String password = (String) payload.get("password");
        String phoneNumber = (String) payload.get("phoneNumber");
        
        String role = (String) payload.get("devRole");
        if (role == null || role.trim().isEmpty()) {
            role = (String) payload.get("role");
        }
        if (role == null || role.trim().isEmpty()) {
            role = "USER";
        }
        
        Boolean autoEnable = (Boolean) payload.get("autoEnable");
        if (autoEnable == null) {
            autoEnable = (Boolean) payload.get("enabled");
        }
        if (autoEnable == null) {
            autoEnable = false;
        }

        if (userRepository.existsByEmail(email)) {
            return ResponseEntity.badRequest().body("Error: El email ya está registrado");
        }
        if (phoneNumber != null && !phoneNumber.trim().isEmpty() && 
            userRepository.existsByPhoneNumber(phoneNumber)) {
            return ResponseEntity.badRequest().body("Error: El número de teléfono ya está registrado");
        }

        User user = new User();
        user.setEmail(email);
        user.setName(name);
        user.setPassword(passwordEncoder.encode(password));
        user.setPhoneNumber(phoneNumber);
        user.setRole(role);
        user.setEnabled(autoEnable);

        String actCode = null;
        if (!autoEnable) {
            actCode = String.format("%06d", new Random().nextInt(999999));
            user.setOtpCode(actCode);
            user.setOtpExpiry(LocalDateTime.now().plusMinutes(15));
        }

        User saved = userRepository.save(user);

        if (!autoEnable) {
            // Simular envío de SMS de activación a la consola
            System.out.println("\n=======================================================");
            System.out.println("📱 [SMS MOCK] ENVIANDO CÓDIGO DE ACTIVACIÓN A " + saved.getPhoneNumber());
            System.out.println("🔑 CÓDIGO DE ACTIVACIÓN LOGITRACK: " + actCode);
            System.out.println("=======================================================\n");
        }

        // Registrar log de auditoría
        auditLogRepository.save(new AuditLog(
                saved.getEmail(),
                "USER_REGISTERED",
                "Usuario registrado con rol: " + saved.getRole() + " (Activado automáticamente: " + autoEnable + ")"
        ));

        return ResponseEntity.ok(Map.of(
                "status", autoEnable ? "SUCCESS" : "PENDING_VERIFICATION",
                "email", saved.getEmail(),
                "message", autoEnable ? "Cuenta creada y activada" : "Código de activación enviado por SMS."
        ));
    }

    @PostMapping("/verify-registration")
    public ResponseEntity<?> verifyRegistration(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String code = request.get("otpCode");

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Usuario no encontrado");
        }

        User user = userOpt.get();
        if (user.getOtpCode() == null || !user.getOtpCode().equals(code)) {
            return ResponseEntity.badRequest().body("Código de activación incorrecto");
        }

        if (user.getOtpExpiry() == null || user.getOtpExpiry().isBefore(LocalDateTime.now())) {
            return ResponseEntity.badRequest().body("El código ha expirado. Regístrate de nuevo.");
        }

        user.setOtpCode(null);
        user.setOtpExpiry(null);
        user.setEnabled(true); // Cuenta activada
        userRepository.save(user);

        // Registrar log de auditoría
        auditLogRepository.save(new AuditLog(
                user.getEmail(),
                "USER_ACTIVATED",
                "Cuenta de usuario verificada y activada exitosamente."
        ));

        return ResponseEntity.ok(Map.of(
                "status", "SUCCESS",
                "message", "Cuenta activada con éxito. Ya puedes iniciar sesión."
        ));
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody Map<String, String> loginRequest) {
        String email = loginRequest.get("email");
        String password = loginRequest.get("password");
        boolean skipOtp = Boolean.parseBoolean(loginRequest.get("skipOtp"));

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Usuario no encontrado");
        }

        User user = userOpt.get();
        if (!passwordEncoder.matches(password, user.getPassword())) {
            return ResponseEntity.badRequest().body("Contraseña incorrecta");
        }

        if (!user.isEnabled()) {
            return ResponseEntity.badRequest().body("Tu cuenta no está activada. Por favor, verifica tu teléfono con el código SMS recibido.");
        }

        if (!user.isActive()) {
            return ResponseEntity.status(403).body("Tu cuenta ha sido desactivada por un administrador. Contacta con soporte.");
        }


        // Si se marca la casilla de desarrollo "Saltar 2FA", devolvemos el token directamente
        if (skipOtp) {
            auditLogRepository.save(new AuditLog(
                    user.getEmail(),
                    "USER_LOGIN",
                    "Inicio de sesión exitoso (Saltando SMS 2FA en Modo Desarrollador)"
            ));

            String token = jwtService.generateToken(user.getEmail(), user.getRole(), user.getName());
            return ResponseEntity.ok(buildUserResponse(user, token, "SUCCESS"));
        }

        // Generar OTP de 6 dígitos para el 2FA de login
        String otp = String.format("%06d", new Random().nextInt(999999));
        user.setOtpCode(otp);
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(5));
        userRepository.save(user);

        // Simular envío de SMS a la consola
        System.out.println("\n=======================================================");
        System.out.println("📱 [SMS MOCK] ENVIANDO OTP A " + user.getPhoneNumber());
        System.out.println("🔑 CÓDIGO DE VERIFICACIÓN LOGITRACK: " + otp);
        System.out.println("=======================================================\n");

        return ResponseEntity.ok(Map.of(
                "status", "PENDING_OTP",
                "email", user.getEmail(),
                "message", "Código OTP enviado al número: " + user.getPhoneNumber()
        ));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> otpRequest) {
        String email = otpRequest.get("email");
        String code = otpRequest.get("otpCode");

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Usuario no encontrado");
        }

        User user = userOpt.get();
        if (user.getOtpCode() == null || !user.getOtpCode().equals(code)) {
            return ResponseEntity.badRequest().body("Código de verificación incorrecto");
        }

        if (user.getOtpExpiry() == null || user.getOtpExpiry().isBefore(LocalDateTime.now())) {
            return ResponseEntity.badRequest().body("El código ha expirado. Por favor, solicita uno nuevo.");
        }

        // Limpiar el código usado
        user.setOtpCode(null);
        user.setOtpExpiry(null);
        userRepository.save(user);

        // Registrar log de auditoría de login exitoso
        auditLogRepository.save(new AuditLog(
                user.getEmail(),
                "USER_LOGIN",
                "Inicio de sesión exitoso mediante SMS 2FA"
        ));

        // Retornar información del perfil y el token JWT
        String token = jwtService.generateToken(user.getEmail(), user.getRole(), user.getName());
        Map<String, Object> response = new HashMap<>();
        response.put("status", "SUCCESS");
        response.put("token", token);
        response.put("name", user.getName());
        response.put("email", user.getEmail());
        response.put("phoneNumber", user.getPhoneNumber() != null ? user.getPhoneNumber() : "");
        response.put("role", user.getRole());
        response.put("dni", user.getDni() != null ? user.getDni() : "");
        response.put("lastName", user.getLastName() != null ? user.getLastName() : "");
        response.put("streetAddress", user.getStreetAddress() != null ? user.getStreetAddress() : "");
        response.put("postalCode", user.getPostalCode() != null ? user.getPostalCode() : "");
        response.put("city", user.getCity() != null ? user.getCity() : "");
        response.put("country", user.getCountry() != null ? user.getCountry() : "");
        return ResponseEntity.ok(response);
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody Map<String, String> profileRequest) {
        String email = profileRequest.get("email");
        String name = profileRequest.get("name");
        String phoneNumber = profileRequest.get("phoneNumber");

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Usuario no encontrado");
        }

        User user = userOpt.get();
        user.setName(name);
        user.setPhoneNumber(phoneNumber);
        user.setDni(profileRequest.get("dni"));
        user.setLastName(profileRequest.get("lastName"));
        user.setStreetAddress(profileRequest.get("streetAddress"));
        user.setPostalCode(profileRequest.get("postalCode"));
        user.setCity(profileRequest.get("city"));
        user.setCountry(profileRequest.get("country"));
        userRepository.save(user);

        // Registrar log de auditoría
        auditLogRepository.save(new AuditLog(
                user.getEmail(),
                "PROFILE_UPDATED",
                "Perfil de usuario actualizado (Nombre: " + name + ", Teléfono: " + phoneNumber + ")"
        ));

        String token = jwtService.generateToken(user.getEmail(), user.getRole(), user.getName());
        return ResponseEntity.ok(buildUserResponse(user, token, "SUCCESS"));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        String phoneNumber = request.get("phoneNumber");

        Optional<User> userOpt = userRepository.findByPhoneNumber(phoneNumber);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("No existe ninguna cuenta asociada a este número de teléfono.");
        }

        User user = userOpt.get();
        String resetCode = String.format("%06d", new Random().nextInt(999999));
        user.setResetPasswordCode(resetCode);
        user.setResetPasswordExpiry(LocalDateTime.now().plusMinutes(10));
        userRepository.save(user);

        // Simular envío de SMS de recuperación
        System.out.println("\n=======================================================");
        System.out.println("🔑 [SMS RESET MOCK] ENVIANDO CÓDIGO DE RECUPERACIÓN A " + user.getPhoneNumber());
        System.out.println("🔑 CÓDIGO DE RESTABLECIMIENTO LOGITRACK: " + resetCode);
        System.out.println("=======================================================\n");

        return ResponseEntity.ok(Map.of(
                "status", "PENDING_RESET",
                "phoneNumber", user.getPhoneNumber(),
                "message", "Código de recuperación enviado con éxito."
        ));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        String phoneNumber = request.get("phoneNumber");
        String code = request.get("otpCode");
        String newPassword = request.get("newPassword");

        Optional<User> userOpt = userRepository.findByPhoneNumber(phoneNumber);
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Usuario no encontrado.");
        }

        User user = userOpt.get();
        if (user.getResetPasswordCode() == null || !user.getResetPasswordCode().equals(code)) {
            return ResponseEntity.badRequest().body("Código de recuperación incorrecto.");
        }

        if (user.getResetPasswordExpiry() == null || user.getResetPasswordExpiry().isBefore(LocalDateTime.now())) {
            return ResponseEntity.badRequest().body("El código ha expirado.");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetPasswordCode(null);
        user.setResetPasswordExpiry(null);
        userRepository.save(user);

        auditLogRepository.save(new AuditLog(
                user.getEmail(),
                "PASSWORD_RESET",
                "Contraseña restablecida exitosamente mediante recuperación por SMS"
        ));

        return ResponseEntity.ok(Map.of(
                "status", "SUCCESS",
                "message", "Contraseña restablecida con éxito. Ya puedes iniciar sesión."
        ));
    }

    private java.util.Map<String, Object> buildUserResponse(User user, String token, String statusMsg) {
        java.util.Map<String, Object> response = new java.util.HashMap<>();
        if (statusMsg != null) response.put("status", statusMsg);
        if (token != null) response.put("token", token);
        response.put("name", user.getName());
        response.put("email", user.getEmail());
        response.put("phoneNumber", user.getPhoneNumber() != null ? user.getPhoneNumber() : "");
        response.put("role", user.getRole());
        response.put("dni", user.getDni() != null ? user.getDni() : "");
        response.put("lastName", user.getLastName() != null ? user.getLastName() : "");
        response.put("streetAddress", user.getStreetAddress() != null ? user.getStreetAddress() : "");
        response.put("postalCode", user.getPostalCode() != null ? user.getPostalCode() : "");
        response.put("city", user.getCity() != null ? user.getCity() : "");
        response.put("country", user.getCountry() != null ? user.getCountry() : "");
        return response;
    }

}
