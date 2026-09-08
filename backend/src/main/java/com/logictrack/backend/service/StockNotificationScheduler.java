package com.logictrack.backend.service;

import com.logictrack.backend.model.Product;
import com.logictrack.backend.model.User;
import com.logictrack.backend.repository.ProductRepository;
import com.logictrack.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class StockNotificationScheduler {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PdfGeneratorService pdfGeneratorService;

    @Autowired
    private EmailService emailService;

    // Ejecutar cada hora: "0 0 * * * *"
    // Para desarrollo/pruebas locales: se ejecuta cada 5 minutos
    @Scheduled(cron = "0 */5 * * * *")
    public void scheduleCheck() {
        System.out.println("⏰ [SCHEDULER] Iniciando revisión automática de stock mínimo...");
        checkStockAndSendNotifications();
    }

    public void checkStockAndSendNotifications() {
        List<Product> allProducts = productRepository.findAll();
        List<Product> lowStockProducts = allProducts.stream()
                .filter(p -> p.getStockQuantity() <= p.getMinStockAlert())
                .collect(Collectors.toList());

        if (lowStockProducts.isEmpty()) {
            System.out.println("✅ [SCHEDULER] Stock correcto en todos los productos. No se requiere reabastecimiento.");
            return;
        }

        System.out.println("⚠️ [SCHEDULER] Detectados " + lowStockProducts.size() + " productos con stock crítico.");

        // Obtener administradores del sistema
        List<User> admins = userRepository.findAll().stream()
                .filter(u -> "ADMIN".equals(u.getRole()))
                .collect(Collectors.toList());

        if (admins.isEmpty()) {
            System.out.println("❌ [SCHEDULER] No se encontraron administradores con correo activo para enviar la alerta.");
            return;
        }

        // Generar PDF del reporte
        byte[] pdfReport = pdfGeneratorService.generateLowStockReportPdf(lowStockProducts);

        StringBuilder emailBuilder = new StringBuilder();
        emailBuilder.append("Estimado Administrador,\n\n");
        emailBuilder.append("El sistema de control de existencias de LogiTrack ERP ha detectado que los siguientes productos han alcanzado o caído por debajo del nivel de stock mínimo especificado:\n\n");
        
        for (Product p : lowStockProducts) {
            emailBuilder.append("⚠️ ").append(p.getName()).append(" (SKU: ").append(p.getSku()).append(")\n");
            emailBuilder.append("   - Stock Actual: ").append(p.getStockQuantity()).append(" unidades\n");
            emailBuilder.append("   - Mínimo Requerido: ").append(p.getMinStockAlert()).append(" unidades\n\n");
        }
        
        emailBuilder.append("Adjunto a este correo encontrará el reporte detallado en PDF para gestionar las reposiciones necesarias de inmediato.\n\n");
        emailBuilder.append("Atentamente,\n");
        emailBuilder.append("LogiTrack ERP - Automatizaciones");
        
        String emailBody = emailBuilder.toString();

        for (User admin : admins) {
            if (admin.getEmail() != null && !admin.getEmail().isBlank()) {
                emailService.sendLowStockAlertEmail(
                        admin.getEmail(),
                        "🚨 ALERTA: Reposición de Inventario Requerida",
                        emailBody,
                        pdfReport,
                        "Reporte_Stock_Critico.pdf"
                );
            }
        }
    }
}
