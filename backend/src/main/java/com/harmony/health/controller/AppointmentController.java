package com.harmony.health.controller;

import com.harmony.health.common.Result;
import com.harmony.health.entity.Appointment;
import com.harmony.health.entity.User;
import com.harmony.health.mapper.UserMapper;
import com.harmony.health.service.AppointmentService;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {

    @Autowired
    private AppointmentService appointmentService;

    @Autowired
    private UserMapper userMapper;

    @GetMapping
    public Result<List<Appointment>> list(@RequestParam(required = false) Integer userId,
                                          @AuthenticationPrincipal String currentUsername) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        boolean isAdmin = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        return Result.success(appointmentService.listAppointments(userId, isAdmin));
    }

    @GetMapping("/daily-count")
    public Result<Map<String, Object>> dailyCount(@RequestParam String date) {
        LocalDate localDate = LocalDate.parse(date);
        int count = appointmentService.countByDate(localDate);
        int remaining = appointmentService.getRemainingSlots(localDate);
        return Result.success(Map.of(
                "date", date,
                "count", count,
                "remaining", remaining,
                "max", 5
        ));
    }

    @PostMapping
    public Result<String> book(@RequestBody Appointment appointment) {
        String error = appointmentService.bookAppointment(appointment);
        if (error != null) {
            return Result.error(error);
        }
        return Result.success("预约成功");
    }

    @PutMapping("/{id}/status")
    public Result<String> updateStatus(@PathVariable Integer id,
                                       @RequestParam String status,
                                       @AuthenticationPrincipal String currentUsername) {
        Appointment appointment = appointmentService.getAppointmentById(id);
        if (appointment == null) {
            return Result.error("预约未找到");
        }

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        boolean isAdmin = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        if (!isAdmin) {
            User currentUser = userMapper.selectOne(
                    new LambdaQueryWrapper<User>().eq(User::getUsername, currentUsername)
            );
            if (currentUser == null || !appointment.getUserId().equals(currentUser.getId())) {
                return Result.error("无权操作他人的预约");
            }
            if (!"CANCELLED".equals(status)) {
                return Result.error("您只能取消预约");
            }
            if (!"PENDING".equals(appointment.getStatus()) && !"CONFIRMED".equals(appointment.getStatus())) {
                return Result.error("当前预约状态无法取消");
            }
        }

        appointmentService.updateAppointmentStatus(appointment, status);
        return Result.success("更新成功");
    }
}
