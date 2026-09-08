package com.logictrack.backend.service;

import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    public void sendLowStockAlertEmail(String to, String subject, String text, byte[] pdfAttachment, String attachmentName) {
        if (mailSender == null) {
            System.out.println("[EMAIL MOCK] JavaMailSender no disponible. El correo no pudo enviarse.");
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(text);
            helper.setFrom("alertas@logitrack.com");

            if (pdfAttachment != null) {
                helper.addAttachment(attachmentName, new ByteArrayResource(pdfAttachment));
            }

            mailSender.send(message);
            System.out.println("📬 [EMAIL] Alerta enviada con éxito a: " + to);
        } catch (Exception e) {
            System.err.println("❌ [EMAIL ERROR] Error al enviar correo de alerta: " + e.getMessage());
            e.printStackTrace();
        }
    }

    public void sendPlainEmail(String to, String subject, String text) {
        sendLowStockAlertEmail(to, subject, text, null, null);
    }

    public void sendPurchaseConfirmationEmail(String to, String subject, String text, byte[] pdfInvoice) {
        if (mailSender == null) {
            System.out.println("[EMAIL MOCK] Factura para: " + to);
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(text);
            helper.setFrom("ventas@logitrack.com");

            if (pdfInvoice != null) {
                helper.addAttachment("Factura.pdf", new ByteArrayResource(pdfInvoice));
            }

            mailSender.send(message);
            System.out.println("📬 [EMAIL] Confirmación de compra enviada con éxito a: " + to);
        } catch (Exception e) {
            System.err.println("❌ [EMAIL ERROR] Error al enviar confirmación: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
