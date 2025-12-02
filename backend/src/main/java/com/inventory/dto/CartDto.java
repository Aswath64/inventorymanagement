package com.inventory.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CartDto {
    private Long id;
    private Long productId;
    private String productName;
    private BigDecimal productPrice;
    private String productImage;
    private Integer quantity;
    private BigDecimal subtotal;
}

