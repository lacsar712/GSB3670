package com.harmony.health.controller;

import com.harmony.health.common.Result;
import com.harmony.health.entity.Appointment;
import com.harmony.health.service.AppointmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {

    @Autowired
    private AppointmentService appointmentService;

    @GetMapping("/daily-count")
    public Result<Integer> getDailyCount(@RequestParam String date) {
        LocalDate localDate = LocalDate.parse(date);
        int remaining = appointmentService.getRemainingSlots(localDate);
        return Result.success(remaining);
    }

    @GetMapping
    public Result<List<Appointment>> list(@RequestParam(required = false) Integer userId,
                                          @AuthenticationPrincipal String currentUsername) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        boolean isAdmin = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        List<Appointment> appointments = appointmentService.listAppointments(userId, isAdmin, currentUsername);
        return Result.success(appointments);
    }

    @PostMapping
    public Result<String> book(@RequestBody Appointment appointment) {
        try {
            String result = appointmentService.bookAppointment(appointment);
            return Result.success(result);
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }

    @PutMapping("/{id}/status")
    public Result<String> updateStatus(@PathVariable Integer id,
                                       @RequestParam String status,
                                       @AuthenticationPrincipal String currentUsername) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        boolean isAdmin = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        try {
            String result = appointmentService.updateAppointmentStatus(id, status, isAdmin, currentUsername);
            return Result.success(result);
        } catch (Exception e) {
            return Result.error(e.getMessage());
        }
    }
}
