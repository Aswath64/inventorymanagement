package com.inventory.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.scheduling.annotation.Async;

@Service
public class EmailService {
    
    private final JavaMailSender mailSender;
    
    @Value("${app.email.sender.address}")
    private String senderAddress;
    
    @Value("${app.email.sender.name}")
    private String senderName;
    
    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }
    
    @Async
    public void sendOtpEmail(String to, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(senderAddress);
        message.setTo(to);
        message.setSubject("Password Reset OTP - Inventory Management System");
        message.setText("Your OTP for password reset is: " + otp + "\n\n" +
                       "This OTP will expire in 5 minutes.\n\n" +
                       "If you didn't request this, please ignore this email.");
        mailSender.send(message);
    }
    
    @Async
    public void sendOrderConfirmationEmail(String to, String orderId, String totalAmount) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(senderAddress);
        message.setTo(to);
        message.setSubject("Order Confirmation - Order #" + orderId);
        message.setText("Thank you for your order!\n\n" +
                       "Order ID: " + orderId + "\n" +
                       "Total Amount: $" + totalAmount + "\n\n" +
                       "We will process your order shortly.");
        mailSender.send(message);
    }
    
    @Async
    public void sendOrderNotificationEmail(String to, String orderId, String customerName) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(senderAddress);
        message.setTo(to);
        message.setSubject("New Order Received - Order #" + orderId);
        message.setText("A new order has been placed:\n\n" +
                       "Order ID: " + orderId + "\n" +
                       "Customer: " + customerName + "\n\n" +
                       "Please process this order.");
        mailSender.send(message);
    }
    
    @Async
    public void sendLowStockAlertEmail(String to, String productName, Integer stock) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(senderAddress);
        message.setTo(to);
        message.setSubject("Low Stock Alert - " + productName);
        message.setText("Low stock alert!\n\n" +
                       "Product: " + productName + "\n" +
                       "Current Stock: " + stock + "\n\n" +
                       "Please restock this product.");
        mailSender.send(message);
    }
    
    @Async
    public void sendOrderStatusUpdateEmail(String to, String orderId, String status) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(senderAddress);
        message.setTo(to);
        message.setSubject("Order Status Updated - Order #" + orderId);
        message.setText("Your order status has been updated.\n\n" +
                       "Order ID: " + orderId + "\n" +
                       "New Status: " + status + "\n\n" +
                       "Thank you for shopping with us.");
        mailSender.send(message);
    }
}

