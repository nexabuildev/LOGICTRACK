package com.logictrack.backend.service;

import com.logictrack.backend.model.Product;
import org.springframework.stereotype.Service;

import java.io.StringWriter;
import java.util.List;

@Service
public class CsvExportService {

    public String exportProductsToCsv(List<Product> products) {
        StringWriter writer = new StringWriter();
        
        // Agregar UTF-8 BOM para soporte correcto de caracteres (ñ, acentos) en Excel
        writer.append("\uFEFF");
        
        // Encabezados con punto y coma (;) y espacio para legibilidad como texto plano
        writer.append("SKU; Nombre; Descripción; Precio; Stock; Alerta Mínima; N.º Serie; Estado; Características JSON; Propietario\n");

        for (Product p : products) {
            writer.append(escapeCsvField(p.getSku())).append("; ");
            writer.append(escapeCsvField(p.getName())).append("; ");
            writer.append(escapeCsvField(p.getDescription())).append("; ");
            writer.append(String.valueOf(p.getPrice())).append("; ");
            writer.append(String.valueOf(p.getStockQuantity())).append("; ");
            writer.append(String.valueOf(p.getMinStockAlert())).append("; ");
            writer.append(escapeCsvField(p.getSerialNumber())).append("; ");
            writer.append(escapeCsvField(p.getCondition())).append("; ");
            writer.append(escapeCsvField(p.getFeatures())).append("; ");
            writer.append(p.getUser() != null ? escapeCsvField(p.getUser().getEmail()) : "Sin asignar");
            writer.append("\n");
        }

        return writer.toString();
    }

    private String escapeCsvField(String field) {
        if (field == null) {
            return "";
        }
        String escaped = field.replace("\"", "\"\"");
        if (escaped.contains(";") || escaped.contains("\n") || escaped.contains("\"")) {
            return "\"" + escaped + "\"";
        }
        return escaped;
    }
}
