package com.logictrack.backend.controller;

import com.logictrack.backend.dto.ProductRequestDTO;
import com.logictrack.backend.model.Product;
import com.logictrack.backend.model.StockTransaction;
import com.logictrack.backend.service.CsvExportService;
import com.logictrack.backend.service.PdfGeneratorService;
import com.logictrack.backend.service.ProductService;
import com.logictrack.backend.service.StockNotificationScheduler;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private ProductService productService;

    @Autowired
    private CsvExportService csvExportService;

    @Autowired
    private PdfGeneratorService pdfGeneratorService;

    @Autowired
    private StockNotificationScheduler stockNotificationScheduler;

    private String getEmail(Authentication auth) {
        return auth.getName();
    }

    private String getRole(Authentication auth) {
        return auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .map(role -> role.replace("ROLE_", ""))
                .findFirst().orElse("USER");
    }

    @GetMapping
    public ResponseEntity<List<Product>> getAllProducts(Authentication authentication) {
        return ResponseEntity.ok(productService.getAllProducts(getEmail(authentication), getRole(authentication)));
    }

    @PostMapping
    public ResponseEntity<?> createProduct(@Valid @RequestBody ProductRequestDTO dto) {
        try {
            Product savedProduct = productService.createProduct(dto);
            return ResponseEntity.ok(savedProduct);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody ProductRequestDTO dto,
            Authentication authentication) {
        try {
            Product updatedProduct = productService.updateProduct(id, dto, getEmail(authentication), getRole(authentication));
            return ResponseEntity.ok(updatedProduct);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProduct(
            @PathVariable Long id,
            Authentication authentication) {
        try {
            productService.deleteProduct(id, getEmail(authentication), getRole(authentication));
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/export/csv")
    public ResponseEntity<byte[]> exportCsv(Authentication authentication) {
        List<Product> products = productService.getAllProducts(getEmail(authentication), getRole(authentication));
        String csvContent = csvExportService.exportProductsToCsv(products);
        byte[] csvBytes = csvContent.getBytes(java.nio.charset.StandardCharsets.UTF_8);

        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=inventario.csv")
                .header("Content-Type", "text/csv; charset=UTF-8")
                .body(csvBytes);
    }

    @GetMapping("/export/pdf")
    public ResponseEntity<byte[]> exportPdf(Authentication authentication) {
        List<Product> products = productService.getAllProducts(getEmail(authentication), getRole(authentication));
        byte[] pdfBytes = pdfGeneratorService.generateCatalogPdf(products);

        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=inventario.pdf")
                .header("Content-Type", "application/pdf")
                .body(pdfBytes);
    }

    @PostMapping("/trigger-stock-check")
    public ResponseEntity<String> triggerStockCheck() {
        stockNotificationScheduler.checkStockAndSendNotifications();
        return ResponseEntity.ok("Revisión manual de stock e informe ejecutado con éxito.");
    }

    @GetMapping("/{id}/transactions")
    public ResponseEntity<?> getProductTransactions(@PathVariable Long id, Authentication authentication) {
        try {
            List<StockTransaction> txs = productService.getProductTransactions(id, getEmail(authentication), getRole(authentication));
            return ResponseEntity.ok(txs);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/import/csv")
    public ResponseEntity<?> importCsv(
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file,
            Authentication authentication) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("El archivo CSV está vacío o no se seleccionó correctamente.");
        }
        try (java.io.BufferedReader reader = new java.io.BufferedReader(new java.io.InputStreamReader(file.getInputStream(), java.nio.charset.StandardCharsets.UTF_8))) {
            java.util.List<String[]> rows = new java.util.ArrayList<>();
            String line;
            boolean firstLine = true;
            while ((line = reader.readLine()) != null) {
                if (line.trim().isEmpty()) continue;
                
                // Limpiar BOM invisible al inicio del archivo si existe
                if (firstLine && line.startsWith("\uFEFF")) {
                    line = line.substring(1);
                }

                // Omitir cabecera
                if (firstLine) {
                    firstLine = false;
                    if (line.toLowerCase().contains("sku") || line.toLowerCase().contains("nombre")) {
                        continue;
                    }
                }

                // Detectar delimitador (punto y coma ';' o coma ',')
                String delimiter = ";";
                if (line.contains(",") && !line.contains(";")) {
                    delimiter = ",";
                }

                // Dividir línea respetando comillas
                String regex = delimiter + "(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)";
                String[] parts = line.split(regex, -1);
                
                for (int i = 0; i < parts.length; i++) {
                    String p = parts[i].trim();
                    if (p.startsWith("\"") && p.endsWith("\"") && p.length() >= 2) {
                        p = p.substring(1, p.length() - 1);
                        p = p.replace("\"\"", "\"");
                    }
                    parts[i] = p;
                }
                rows.add(parts);
            }
            productService.importProductsFromCsv(rows, getEmail(authentication), getRole(authentication));
            return ResponseEntity.ok("Catálogo importado y actualizado exitosamente. " + rows.size() + " productos procesados.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error de importación: " + e.getMessage());
        }
    }

    @GetMapping("/marketplace")
    public ResponseEntity<List<Product>> getMarketplaceProducts() {
        return ResponseEntity.ok(productService.getAllMarketplaceProducts());
    }

    @PostMapping("/{id}/buy")
    public ResponseEntity<?> buyProduct(
            @PathVariable Long id,
            @RequestBody java.util.Map<String, Integer> payload,
            Authentication authentication) {
        int quantity = payload.getOrDefault("quantity", 1);
        try {
            Product updated = productService.buyProduct(id, quantity, getEmail(authentication));
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
