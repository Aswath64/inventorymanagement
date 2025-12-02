package com.inventory.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StaffDashboardDto {
    private Long pendingOrdersCount;
    private Long completedOrdersCount;
    private List<OrderDto> todayOrders;
}

