package com.inventory.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashboardDto {
    private Long totalProducts;
    private Long totalCustomers;
    private Long totalStaff;
    private BigDecimal totalSales;
    private Map<String, BigDecimal> monthlyRevenue;
    private List<ProductDto> lowStockProducts;
    private List<ProductDto> mostSoldProducts;
    private Map<String, Long> categoryPerformance;
}

