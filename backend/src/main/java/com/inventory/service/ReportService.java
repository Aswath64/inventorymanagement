package com.inventory.service;

import com.inventory.entity.Order;
import com.inventory.entity.Product;
import com.inventory.entity.User;
import com.inventory.repository.*;

import com.inventory.entity.Order.OrderStatus;

import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Element;
import com.lowagie.text.pdf.PdfWriter;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReportService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;

    public ReportService(OrderRepository orderRepository,
                         ProductRepository productRepository,
                         UserRepository userRepository,
                         CategoryRepository categoryRepository) {

        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    // ------------------------------------------------------------
    // PDF REPORTS
    // ------------------------------------------------------------

    public byte[] generateSalesReportPDF() throws DocumentException, IOException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document document = new Document();

        PdfWriter.getInstance(document, baos);
        document.open();

        Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
        Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 10);

        Paragraph title = new Paragraph("Sales Report", titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        document.add(title);
        document.add(new Paragraph("\n"));

        List<Order> orders = orderRepository.findAll().stream()
                .filter(o -> o.getStatus() == OrderStatus.DELIVERED)
                .collect(Collectors.toList());

        BigDecimal totalSales = orders.stream()
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        document.add(new Paragraph("Total Orders: " + orders.size(), normalFont));
        document.add(new Paragraph("Total Sales: $" + totalSales, normalFont));
        document.add(new Paragraph("\n"));

        document.close();
        return baos.toByteArray();
    }


    public byte[] generateProductStockReportPDF() throws DocumentException, IOException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document document = new Document();

        PdfWriter.getInstance(document, baos);
        document.open();

        Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
        Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 10);

        Paragraph title = new Paragraph("Product Stock Report", titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        document.add(title);
        document.add(new Paragraph("\n"));

        List<Product> products = productRepository.findAll();
        for (Product product : products) {
            document.add(new Paragraph(
                    product.getName() + " - Stock: " + product.getStock(),
                    normalFont
            ));
        }

        document.close();
        return baos.toByteArray();
    }


    public byte[] generateOrderHistoryPDF(Long userId) throws DocumentException, IOException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document document = new Document();

        PdfWriter.getInstance(document, baos);
        document.open();

        Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
        Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 10);

        Paragraph title = new Paragraph("Order History", titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        document.add(title);
        document.add(new Paragraph("\n"));

        User user = userRepository.findById(userId).orElse(null);
        if (user != null) {
            List<Order> orders = orderRepository.findByUser(user);
            for (Order order : orders) {
                document.add(new Paragraph(
                        "Order #" + order.getId() +
                                " - $" + order.getTotalAmount() +
                                " - " + order.getStatus(),
                        normalFont
                ));
            }
        }

        document.close();
        return baos.toByteArray();
    }

    // ------------------------------------------------------------
    // EXCEL REPORTS
    // ------------------------------------------------------------

    public byte[] generateSalesReportExcel() throws IOException {

        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Sales Report");

        Row headerRow = sheet.createRow(0);
        headerRow.createCell(0).setCellValue("Order ID");
        headerRow.createCell(1).setCellValue("Customer");
        headerRow.createCell(2).setCellValue("Total Amount");
        headerRow.createCell(3).setCellValue("Status");
        headerRow.createCell(4).setCellValue("Date");

        List<Order> orders = orderRepository.findAll().stream()
                .filter(o -> o.getStatus() == OrderStatus.DELIVERED)
                .collect(Collectors.toList());

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

        int rowNum = 1;
        for (Order order : orders) {
            Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue(order.getId());
            row.createCell(1).setCellValue(order.getUser().getName());
            row.createCell(2).setCellValue(order.getTotalAmount().doubleValue());
            row.createCell(3).setCellValue(order.getStatus().name());
            row.createCell(4).setCellValue(order.getCreatedAt().format(formatter));
        }

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        workbook.write(baos);
        workbook.close();
        return baos.toByteArray();
    }


    public byte[] generateProductStockReportExcel() throws IOException {
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Product Stock Report");

        Row headerRow = sheet.createRow(0);
        headerRow.createCell(0).setCellValue("Product ID");
        headerRow.createCell(1).setCellValue("Product Name");
        headerRow.createCell(2).setCellValue("Category");
        headerRow.createCell(3).setCellValue("Price");
        headerRow.createCell(4).setCellValue("Stock");

        int rowNum = 1;
        for (Product product : productRepository.findAll()) {
            Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue(product.getId());
            row.createCell(1).setCellValue(product.getName());
            row.createCell(2).setCellValue(product.getCategory().getName());
            row.createCell(3).setCellValue(product.getPrice().doubleValue());
            row.createCell(4).setCellValue(product.getStock());
        }

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        workbook.write(baos);
        workbook.close();
        return baos.toByteArray();
    }


    public byte[] generateOrderHistoryExcel(Long userId) throws IOException {
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Order History");

        Row headerRow = sheet.createRow(0);
        headerRow.createCell(0).setCellValue("Order ID");
        headerRow.createCell(1).setCellValue("Total Amount");
        headerRow.createCell(2).setCellValue("Status");
        headerRow.createCell(3).setCellValue("Date");

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

        User user = userRepository.findById(userId).orElse(null);
        if (user != null) {
            int rowNum = 1;
            for (Order order : orderRepository.findByUser(user)) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(order.getId());
                row.createCell(1).setCellValue(order.getTotalAmount().doubleValue());
                row.createCell(2).setCellValue(order.getStatus().name());
                row.createCell(3).setCellValue(order.getCreatedAt().format(formatter));
            }
        }

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        workbook.write(baos);
        workbook.close();
        return baos.toByteArray();
    }


    public byte[] generateStaffActivityReportExcel(Long staffId) throws IOException {
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Staff Activity Report");

        Row headerRow = sheet.createRow(0);
        headerRow.createCell(0).setCellValue("Order ID");
        headerRow.createCell(1).setCellValue("Customer");
        headerRow.createCell(2).setCellValue("Status");
        headerRow.createCell(3).setCellValue("Total Amount");
        headerRow.createCell(4).setCellValue("Date");

        User staff = userRepository.findById(staffId).orElse(null);
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

        if (staff != null) {
            int rowNum = 1;
            for (Order order : orderRepository.findByStaff(staff)) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(order.getId());
                row.createCell(1).setCellValue(order.getUser().getName());
                row.createCell(2).setCellValue(order.getStatus().name());
                row.createCell(3).setCellValue(order.getTotalAmount().doubleValue());
                row.createCell(4).setCellValue(order.getCreatedAt().format(formatter));
            }
        }

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        workbook.write(baos);
        workbook.close();
        return baos.toByteArray();
    }
}
