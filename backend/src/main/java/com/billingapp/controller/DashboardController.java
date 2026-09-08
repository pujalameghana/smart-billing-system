package com.billingapp.controller;

import com.billingapp.dto.DashboardStatsDto;
import com.billingapp.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/business/{businessId}")
    public ResponseEntity<DashboardStatsDto> getStats(@PathVariable Long businessId) {
        DashboardStatsDto stats = dashboardService.getDashboardStats(businessId);
        return ResponseEntity.ok(stats);
    }
}
