package com.harmony.health.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.harmony.health.common.Result;
import com.harmony.health.entity.Appointment;
import com.harmony.health.entity.User;
import com.harmony.health.mapper.AppointmentMapper;
import com.harmony.health.mapper.UserMapper;
import com.harmony.health.service.AppointmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {

    @Autowired
    private AppointmentService appointmentService;

    @Autowired
    private AppointmentMapper appointmentMapper;

    @Autowired
    private UserMapper userMapper;

    @GetMapping
    public Result<List<Appointment>> list(@RequestParam(required = false) Integer userId,
                                          @AuthenticationPrincipal String currentUsername) {
        LambdaQueryWrapper<Appointment> query = new LambdaQueryWrapper<>();

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        boolean isAdmin = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        if (!isAdmin) {
            if (userId != null) {
                query.eq(Appointment::getUserId, userId);
            } else {
                return Result.success(new ArrayList<>());
            }
        } else if (userId != null) {
            query.eq(Appointment::getUserId, userId);
        }

        return Result.success(appointmentMapper.selectList(query));
    }

    @GetMapping("/daily-count")
    public Result<Map<String, Object>> dailyCount(@RequestParam String date) {
        LocalDate localDate = LocalDate.parse(date);
        long bookedCount = appointmentService.countByDate(localDate);
        int remainingSlots = appointmentService.getRemainingSlots(localDate);

        Map<String, Object> data = new HashMap<>();
        data.put("date", date);
        data.put("bookedCount", bookedCount);
        data.put("remainingSlots", remainingSlots);
        data.put("dailyLimit", 5);

        return Result.success(data);
    }

    @PostMapping
    public Result<String> book(@RequestBody Appointment appointment) {
        try {
            appointmentService.book(appointment);
            return Result.success("预约成功");
        } catch (RuntimeException e) {
            return Result.error(e.getMessage());
        }
    }

    @PutMapping("/{id}/status")
    public Result<String> updateStatus(@PathVariable Integer id,
                                       @RequestParam String status,
                                       @AuthenticationPrincipal String currentUsername) {
        Appointment appointment = appointmentMapper.selectById(id);
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

        appointment.setStatus(status);
        appointmentMapper.updateById(appointment);
        return Result.success("更新成功");
    }
}
