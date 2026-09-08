package com.billingapp.service;

import com.billingapp.model.Business;
import com.billingapp.model.Invoice;
import com.billingapp.model.InvoiceItem;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Properties;

@Service
public class EmailService {

    @Value("${spring.mail.host:}")
    private String defaultSmtpHost;

    @Value("${spring.mail.port:587}")
    private int defaultSmtpPort;

    @Value("${spring.mail.username:}")
    private String defaultSmtpUsername;

    @Value("${spring.mail.password:}")
    private String defaultSmtpPassword;

    public Map<String, Object> sendInvoiceEmail(Invoice invoice, String recipientEmail, String subject, String messageText) {
        Business business = invoice != null ? invoice.getBusiness() : null;

        // Resolve SMTP credentials (first check business entity, then fallback to application properties)
        String host = (business != null && business.getSmtpHost() != null && !business.getSmtpHost().trim().isEmpty())
                ? business.getSmtpHost().trim()
                : (defaultSmtpHost != null && !defaultSmtpHost.trim().isEmpty() ? defaultSmtpHost.trim() : "smtp.gmail.com");

        int port = (business != null && business.getSmtpPort() != null && business.getSmtpPort() > 0)
                ? business.getSmtpPort()
                : (defaultSmtpPort > 0 ? defaultSmtpPort : 587);

        String username = (business != null && business.getSmtpUsername() != null && !business.getSmtpUsername().trim().isEmpty())
                ? business.getSmtpUsername().trim()
                : (defaultSmtpUsername != null ? defaultSmtpUsername.trim() : "");

        String password = (business != null && business.getSmtpPassword() != null && !business.getSmtpPassword().trim().isEmpty())
                ? business.getSmtpPassword().trim()
                : (defaultSmtpPassword != null ? defaultSmtpPassword.trim() : "");

        String fromEmail = (business != null && business.getSmtpFromEmail() != null && !business.getSmtpFromEmail().trim().isEmpty())
                ? business.getSmtpFromEmail().trim()
                : (!username.isEmpty() ? username : (business != null && business.getEmail() != null ? business.getEmail() : "billing@smartbilling.com"));

        // If credentials are not configured, inform the caller with clear instructions
        if (username.isEmpty() || password.isEmpty()) {
            Map<String, Object> notConfigured = new HashMap<>();
            notConfigured.put("success", false);
            notConfigured.put("delivered", false);
            notConfigured.put("errorType", "SMTP_NOT_CONFIGURED");
            notConfigured.put("message", "SMTP server credentials are not configured on the server. " +
                    "To send automatic emails directly from the server, please configure your Gmail SMTP and 16-character App Password in Settings, " +
                    "OR click 'Open in Gmail' to deliver real email immediately in 1 click.");
            return notConfigured;
        }

        // Configure JavaMailSender dynamically
        try {
            JavaMailSenderImpl mailSender = new JavaMailSenderImpl();
            mailSender.setHost(host);
            mailSender.setPort(port);
            mailSender.setUsername(username);
            mailSender.setPassword(password);

            Properties props = mailSender.getJavaMailProperties();
            props.put("mail.transport.protocol", "smtp");
            props.put("mail.smtp.auth", "true");
            props.put("mail.smtp.starttls.enable", "true");
            props.put("mail.smtp.starttls.required", "true");
            props.put("mail.smtp.connectiontimeout", "10000");
            props.put("mail.smtp.timeout", "10000");
            props.put("mail.smtp.writetimeout", "10000");

            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            String companyName = (business != null && business.getName() != null) ? business.getName() : "Smart Billing";
            helper.setFrom(new InternetAddress(fromEmail, companyName));
            helper.setTo(recipientEmail);
            helper.setSubject(subject != null && !subject.trim().isEmpty()
                    ? subject.trim()
                    : "Invoice #" + invoice.getInvoiceNumber() + " from " + companyName);

            String htmlBody = buildInvoiceHtmlEmail(invoice, companyName, messageText);
            helper.setText(messageText != null ? messageText : "", htmlBody);

            // Execute real network send
            mailSender.send(mimeMessage);

            Map<String, Object> success = new HashMap<>();
            success.put("success", true);
            success.put("delivered", true);
            success.put("message", "Real email successfully delivered to " + recipientEmail + " via SMTP server!");
            return success;
        } catch (Exception ex) {
            System.err.println("SMTP send error: " + ex.getMessage());
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("delivered", false);
            error.put("errorType", "SMTP_SEND_FAILED");
            error.put("message", "SMTP Delivery Failed: " + ex.getMessage() + ". " +
                    "Tip: For Gmail, you must generate a 16-character 'App Password' at myaccount.google.com/apppasswords (normal Gmail password is not allowed by Google).");
            return error;
        }
    }

    private String buildInvoiceHtmlEmail(Invoice invoice, String companyName, String messageText) {
        String currency = (invoice.getCurrency() != null && !invoice.getCurrency().isEmpty()) ? invoice.getCurrency() : "₹";
        Business business = invoice.getBusiness();

        StringBuilder itemsRows = new StringBuilder();
        if (invoice.getItems() != null) {
            int idx = 1;
            for (InvoiceItem item : invoice.getItems()) {
                String qtyOrDim = (item.getWidth() != null && item.getHeight() != null && item.getWidth() > 0 && item.getHeight() > 0)
                        ? item.getWidth() + " × " + item.getHeight() + " (" + (item.getNosSft() != null ? item.getNosSft() : 1) + " nos)"
                        : item.getQuantity() + " " + (item.getUnit() != null ? item.getUnit() : "pcs");

                itemsRows.append("<tr>")
                        .append("<td style='padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: center; color: #64748b;'>").append(idx++).append("</td>")
                        .append("<td style='padding: 8px; border-bottom: 1px solid #e2e8f0;'><strong>").append(item.getProductName() != null ? item.getProductName() : "").append("</strong></td>")
                        .append("<td style='padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: center;'>").append(qtyOrDim).append("</td>")
                        .append("<td style='padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: right;'>").append(String.format("%.2f", item.getRate())).append("</td>")
                        .append("<td style='padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: bold;'>").append(String.format("%.2f", item.getAmount())).append("</td>")
                        .append("</tr>");
            }
        }

        String bankSection = "";
        if (business != null && (business.getBankName() != null || business.getAccountNumber() != null || business.getUpiId() != null)) {
            bankSection = "<div style='background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; margin-top: 20px;'>" +
                    "<h4 style='margin: 0 0 8px 0; color: #2563eb; font-size: 13px; text-transform: uppercase;'>Bank & Payment Instructions</h4>" +
                    (business.getBankName() != null ? "<p style='margin: 3px 0; font-size: 13px;'><strong>Bank:</strong> " + business.getBankName() + "</p>" : "") +
                    (business.getAccountNumber() != null ? "<p style='margin: 3px 0; font-size: 13px;'><strong>A/C Number:</strong> " + business.getAccountNumber() + "</p>" : "") +
                    (business.getIfscCode() != null ? "<p style='margin: 3px 0; font-size: 13px;'><strong>IFSC Code:</strong> " + business.getIfscCode() + "</p>" : "") +
                    (business.getUpiId() != null ? "<p style='margin: 3px 0; font-size: 13px;'><strong>UPI ID:</strong> " + business.getUpiId() + "</p>" : "") +
                    "</div>";
        }

        return "<!DOCTYPE html>" +
                "<html>" +
                "<body style='font-family: Arial, Helvetica, sans-serif; line-height: 1.5; color: #1e293b; background-color: #f1f5f9; padding: 20px;'>" +
                "<div style='max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);'>" +
                "<div style='background: #2563eb; color: #ffffff; padding: 25px; text-align: center;'>" +
                "<h2 style='margin: 0; font-size: 22px;'>" + companyName + "</h2>" +
                "<p style='margin: 5px 0 0 0; opacity: 0.9; font-size: 14px;'>Invoice #" + invoice.getInvoiceNumber() + "</p>" +
                "</div>" +
                "<div style='padding: 25px;'>" +
                (messageText != null && !messageText.trim().isEmpty()
                        ? "<p style='white-space: pre-line; color: #475569; font-size: 14px; margin-bottom: 20px;'>" + messageText + "</p>"
                        : "") +
                "<div style='display: flex; justify-content: space-between; margin-bottom: 20px;'>" +
                "<div>" +
                "<div style='font-size: 12px; font-weight: bold; color: #64748b; text-transform: uppercase;'>Billed To:</div>" +
                "<div style='font-size: 16px; font-weight: bold; margin-top: 2px;'>" + (invoice.getCustomerName() != null ? invoice.getCustomerName() : "Valued Customer") + "</div>" +
                (invoice.getCustomerEmail() != null ? "<div style='font-size: 13px; color: #64748b;'>" + invoice.getCustomerEmail() + "</div>" : "") +
                (invoice.getCustomerPhone() != null ? "<div style='font-size: 13px; color: #64748b;'>" + invoice.getCustomerPhone() + "</div>" : "") +
                "</div>" +
                "</div>" +
                "<table style='width: 100%; border-collapse: collapse; font-size: 13px; margin: 15px 0;'>" +
                "<thead>" +
                "<tr style='background-color: #f8fafc; color: #475569;'>" +
                "<th style='padding: 10px 8px; border-bottom: 2px solid #cbd5e1; text-align: center; width: 30px;'>#</th>" +
                "<th style='padding: 10px 8px; border-bottom: 2px solid #cbd5e1; text-align: left;'>Item Description</th>" +
                "<th style='padding: 10px 8px; border-bottom: 2px solid #cbd5e1; text-align: center;'>Qty / Dimensions</th>" +
                "<th style='padding: 10px 8px; border-bottom: 2px solid #cbd5e1; text-align: right;'>Rate</th>" +
                "<th style='padding: 10px 8px; border-bottom: 2px solid #cbd5e1; text-align: right;'>Amount</th>" +
                "</tr>" +
                "</thead>" +
                "<tbody>" + itemsRows.toString() + "</tbody>" +
                "</table>" +
                "<div style='text-align: right; margin-top: 15px; font-size: 14px;'>" +
                "<p style='margin: 4px 0; color: #64748b;'>Subtotal: " + currency + String.format("%.2f", invoice.getSubtotal()) + "</p>" +
                (invoice.getDiscountAmount() > 0 ? "<p style='margin: 4px 0; color: #16a34a;'>Discount: -" + currency + String.format("%.2f", invoice.getDiscountAmount()) + "</p>" : "") +
                (invoice.getTaxAmount() > 0 ? "<p style='margin: 4px 0; color: #64748b;'>Tax (" + invoice.getTaxRate() + "%): " + currency + String.format("%.2f", invoice.getTaxAmount()) + "</p>" : "") +
                (invoice.getShippingFee() > 0 ? "<p style='margin: 4px 0; color: #64748b;'>Shipping: " + currency + String.format("%.2f", invoice.getShippingFee()) + "</p>" : "") +
                "<h3 style='margin: 10px 0 0 0; color: #2563eb; font-size: 20px;'>Total: " + currency + String.format("%.2f", invoice.getTotalAmount()) + "</h3>" +
                "</div>" +
                bankSection +
                "</div>" +
                "<div style='background-color: #f8fafc; padding: 15px 25px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0;'>" +
                "Thank you for choosing " + companyName + "!" +
                "</div>" +
                "</div>" +
                "</body>" +
                "</html>";
    }
}
