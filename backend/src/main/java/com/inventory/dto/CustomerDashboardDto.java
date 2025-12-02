package com.inventory.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CustomerDashboardDto {
    private Long totalOrders;
    private List<OrderDto> recentOrders;
    private Long wishlistCount;
    private ProfileDto profile;
}

