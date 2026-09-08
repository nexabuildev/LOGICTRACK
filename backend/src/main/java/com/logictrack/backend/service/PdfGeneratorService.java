package com.logictrack.backend.service;

import com.logictrack.backend.model.Product;
import com.logictrack.backend.model.PurchaseOrder;
import com.logictrack.backend.model.PurchaseOrderItem;
import com.logictrack.backend.model.Order;
import com.logictrack.backend.model.OrderItem;
import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.awt.Color;
import java.util.List;

@Service
public class PdfGeneratorService {

    public byte[] generateCatalogPdf(List<Product> products) {
        Document document = new Document(PageSize.A4);
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            // Título
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, Color.DARK_GRAY);
            Paragraph title = new Paragraph("LogiTrack ERP - Catálogo de Inventario", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(20);
            document.add(title);

            // Tabla
            PdfPTable table = new PdfPTable(6);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{1.5f, 2.5f, 1.5f, 1.5f, 1.5f, 1.5f});

            // Cabeceras de tabla
            Font headFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Color.WHITE);
            String[] headers = {"SKU", "Nombre", "Precio", "Stock Actual", "Mínimo", "Estado"};
            for (String header : headers) {
                PdfPCell cell = new PdfPCell(new Phrase(header, headFont));
                cell.setBackgroundColor(new Color(67, 56, 202)); // Indigo 700
                cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                cell.setPadding(6);
                table.addCell(cell);
            }

            // Filas
            Font bodyFont = FontFactory.getFont(FontFactory.HELVETICA, 9, Color.BLACK);
            for (Product p : products) {
                table.addCell(new PdfPCell(new Phrase(p.getSku(), bodyFont)));
                table.addCell(new PdfPCell(new Phrase(p.getName(), bodyFont)));
                table.addCell(new PdfPCell(new Phrase("€" + p.getPrice().toString(), bodyFont)));
                
                PdfPCell stockCell = new PdfPCell(new Phrase(String.valueOf(p.getStockQuantity()), bodyFont));
                if (p.getStockQuantity() <= p.getMinStockAlert()) {
                    stockCell.setBackgroundColor(new Color(254, 226, 226)); // Rojo suave
                }
                table.addCell(stockCell);

                table.addCell(new PdfPCell(new Phrase(String.valueOf(p.getMinStockAlert()), bodyFont)));

                String status = p.getStockQuantity() <= p.getMinStockAlert() ? "REPOSICIÓN" : "OK";
                PdfPCell statusCell = new PdfPCell(new Phrase(status, bodyFont));
                statusCell.setHorizontalAlignment(Element.ALIGN_CENTER);
                table.addCell(statusCell);
            }

            document.add(table);
            document.close();
        } catch (Exception e) {
            e.printStackTrace();
        }

        return out.toByteArray();
    }

    public byte[] generateLowStockReportPdf(List<Product> products) {
        Document document = new Document(PageSize.A4);
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            // Título
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, new Color(225, 29, 72)); // Rose 600
            Paragraph title = new Paragraph("🚨 INFORME DE REPOSICIÓN URGENTE", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(10);
            document.add(title);

            Font subtitleFont = FontFactory.getFont(FontFactory.HELVETICA, 10, Color.GRAY);
            Paragraph subtitle = new Paragraph("Generado automáticamente por el motor de auditoría de LogiTrack ERP", subtitleFont);
            subtitle.setAlignment(Element.ALIGN_CENTER);
            subtitle.setSpacingAfter(20);
            document.add(subtitle);

            // Tabla
            PdfPTable table = new PdfPTable(5);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{2f, 3f, 1.5f, 1.5f, 2f});

            // Cabeceras de tabla
            Font headFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Color.WHITE);
            String[] headers = {"SKU", "Nombre", "Stock Actual", "Mínimo", "Déficit"};
            for (String header : headers) {
                PdfPCell cell = new PdfPCell(new Phrase(header, headFont));
                cell.setBackgroundColor(new Color(190, 24, 74)); // Rose 700
                cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                cell.setPadding(6);
                table.addCell(cell);
            }

            // Filas
            Font bodyFont = FontFactory.getFont(FontFactory.HELVETICA, 9, Color.BLACK);
            for (Product p : products) {
                table.addCell(new PdfPCell(new Phrase(p.getSku(), bodyFont)));
                table.addCell(new PdfPCell(new Phrase(p.getName(), bodyFont)));
                table.addCell(new PdfPCell(new Phrase(String.valueOf(p.getStockQuantity()), bodyFont)));
                table.addCell(new PdfPCell(new Phrase(String.valueOf(p.getMinStockAlert()), bodyFont)));
                
                int deficit = p.getMinStockAlert() - p.getStockQuantity();
                table.addCell(new PdfPCell(new Phrase(String.valueOf(deficit), bodyFont)));
            }

            document.add(table);
            document.close();
        } catch (Exception e) {
            e.printStackTrace();
        }

        return out.toByteArray();
    }

    public byte[] generateInvoicePdf(PurchaseOrder order) {
        Document document = new Document(PageSize.A4);
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, new Color(249, 115, 22)); // Orange 500
            Paragraph title = new Paragraph("Factura de Compra - LogiTrack Shop", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(10);
            document.add(title);

            Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 11, Color.BLACK);
            document.add(new Paragraph("Orden #" + order.getId(), normalFont));
            document.add(new Paragraph("Fecha: " + order.getCreatedAt().toString(), normalFont));
            document.add(new Paragraph("Cliente: " + order.getBuyer().getName() + " (" + order.getBuyer().getEmail() + ")", normalFont));
            document.add(new Paragraph("Estado: " + order.getStatus(), normalFont));
            document.add(new Paragraph(" ")); // Spacing

            PdfPTable table = new PdfPTable(4);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{3f, 1f, 1.5f, 1.5f});

            Font headFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Color.WHITE);
            String[] headers = {"Producto", "Cant.", "Precio Unitario", "Subtotal"};
            for (String header : headers) {
                PdfPCell cell = new PdfPCell(new Phrase(header, headFont));
                cell.setBackgroundColor(new Color(249, 115, 22)); // Orange 500
                cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                cell.setPadding(6);
                table.addCell(cell);
            }

            Font bodyFont = FontFactory.getFont(FontFactory.HELVETICA, 9, Color.BLACK);
            for (PurchaseOrderItem item : order.getItems()) {
                table.addCell(new PdfPCell(new Phrase(item.getProductName() + "\n(SKU: " + item.getProductSku() + ")", bodyFont)));
                table.addCell(new PdfPCell(new Phrase(String.valueOf(item.getQuantity()), bodyFont)));
                table.addCell(new PdfPCell(new Phrase("€" + item.getUnitPrice(), bodyFont)));
                table.addCell(new PdfPCell(new Phrase("€" + item.getTotalPrice(), bodyFont)));
            }

            document.add(table);

            Font totalFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, Color.DARK_GRAY);
            Paragraph total = new Paragraph("Total Pagado: €" + order.getTotalAmount(), totalFont);
            total.setAlignment(Element.ALIGN_RIGHT);
            total.setSpacingBefore(15);
            document.add(total);

            document.close();
        } catch (Exception e) {
            e.printStackTrace();
        }

        return out.toByteArray();
    }

    public byte[] generatePosOrderInvoicePdf(Order order) {
        Document document = new Document(PageSize.A4);
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, new Color(0, 112, 243)); // Vercel Blue
            Paragraph title = new Paragraph("Factura Simplificada TPV - LogiTrack", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(10);
            document.add(title);

            Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 11, Color.BLACK);
            document.add(new Paragraph("Ticket / Factura #" + order.getId(), normalFont));
            document.add(new Paragraph("Fecha: " + order.getCreatedAt().toString(), normalFont));
            if (order.getCustomer() != null) {
                document.add(new Paragraph("Cliente: " + order.getCustomer().getName() + " (" + order.getCustomer().getEmail() + ")", normalFont));
                if (order.getCustomer().getTaxId() != null) {
                    document.add(new Paragraph("NIF/CIF: " + order.getCustomer().getTaxId(), normalFont));
                }
                if (order.getCustomer().getAddress() != null) {
                    document.add(new Paragraph("Dirección: " + order.getCustomer().getAddress(), normalFont));
                }
            } else {
                document.add(new Paragraph("Cliente: General / TPV", normalFont));
            }
            document.add(new Paragraph("Método de Pago: " + order.getPaymentMethod(), normalFont));
            document.add(new Paragraph(" ")); // Spacing

            PdfPTable table = new PdfPTable(4);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{3f, 1f, 1.5f, 1.5f});

            Font headFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Color.WHITE);
            String[] headers = {"Producto", "Cant.", "Precio Unitario", "Subtotal"};
            for (String header : headers) {
                PdfPCell cell = new PdfPCell(new Phrase(header, headFont));
                cell.setBackgroundColor(new Color(0, 112, 243));
                cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                cell.setPadding(6);
                table.addCell(cell);
            }

            Font bodyFont = FontFactory.getFont(FontFactory.HELVETICA, 9, Color.BLACK);
            for (OrderItem item : order.getItems()) {
                table.addCell(new PdfPCell(new Phrase(item.getProduct().getName() + "\n(SKU: " + item.getProduct().getSku() + ")", bodyFont)));
                table.addCell(new PdfPCell(new Phrase(String.valueOf(item.getQuantity()), bodyFont)));
                table.addCell(new PdfPCell(new Phrase("€" + item.getUnitPrice(), bodyFont)));
                java.math.BigDecimal sub = item.getUnitPrice().multiply(java.math.BigDecimal.valueOf(item.getQuantity()));
                table.addCell(new PdfPCell(new Phrase("€" + sub, bodyFont)));
            }

            document.add(table);

            Font totalFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, Color.DARK_GRAY);
            Paragraph total = new Paragraph("Total: €" + order.getTotalAmount(), totalFont);
            total.setAlignment(Element.ALIGN_RIGHT);
            total.setSpacingBefore(15);
            document.add(total);

            document.close();
        } catch (Exception e) {
            e.printStackTrace();
        }

        return out.toByteArray();
    }
}
