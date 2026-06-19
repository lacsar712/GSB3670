package com.harmony.health.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.harmony.health.entity.Appointment;
import com.harmony.health.entity.User;
import com.harmony.health.mapper.AppointmentMapper;
import com.harmony.health.mapper.UserMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class AppointmentService {

    private static final int MAX_DAILY_APPOINTMENTS = 5;

    @Autowired
    private AppointmentMapper appointmentMapper;

    @Autowired
    private UserMapper userMapper;

    public int getDailyAppointmentCount(LocalDate date) {
        LambdaQueryWrapper<Appointment> query = new LambdaQueryWrapper<>();
        query.eq(Appointment::getAppointmentDate, date)
             .ne(Appointment::getStatus, "CANCELLED");
        return Math.toIntExact(appointmentMapper.selectCount(query));
    }

    public int getRemainingSlots(LocalDate date) {
        int count = getDailyAppointmentCount(date);
        return Math.max(0, MAX_DAILY_APPOINTMENTS - count);
    }

    public String bookAppointment(Appointment appointment) throws Exception {
        LocalDate appointmentDate = appointment.getAppointmentDate();
        if (appointmentDate == null) {
            throw new Exception("请选择预约日期");
        }

        int remaining = getRemainingSlots(appointmentDate);
        if (remaining <= 0) {
            throw new Exception("该日期预约已满，请选择其他日期");
        }

        appointment.setStatus("PENDING");
        appointment.setCreatedAt(LocalDateTime.now());
        appointmentMapper.insert(appointment);
        return "预约成功";
    }

    public List<Appointment> listAppointments(Integer userId, boolean isAdmin, String currentUsername) {
        LambdaQueryWrapper<Appointment> query = new LambdaQueryWrapper<>();

        if (!isAdmin) {
            User currentUser = userMapper.selectOne(
                    new LambdaQueryWrapper<User>().eq(User::getUsername, currentUsername)
            );
            if (currentUser == null) {
                return new ArrayList<>();
            }
            query.eq(Appointment::getUserId, currentUser.getId());
        } else {
            if (userId != null) {
                query.eq(Appointment::getUserId, userId);
            }
        }

        return appointmentMapper.selectList(query);
    }

    public String updateAppointmentStatus(Integer id, String status, boolean isAdmin, String currentUsername) throws Exception {
        Appointment appointment = appointmentMapper.selectById(id);
        if (appointment == null) {
            throw new Exception("预约未找到");
        }

        if (!isAdmin) {
            User currentUser = userMapper.selectOne(
                    new LambdaQueryWrapper<User>().eq(User::getUsername, currentUsername)
            );
            if (currentUser == null || !appointment.getUserId().equals(currentUser.getId())) {
                throw new Exception("无权操作他人的预约");
            }
            if (!"CANCELLED".equals(status)) {
                throw new Exception("您只能取消预约");
            }
            if (!"PENDING".equals(appointment.getStatus()) && !"CONFIRMED".equals(appointment.getStatus())) {
                throw new Exception("当前预约状态无法取消");
            }
        }

        appointment.setStatus(status);
        appointmentMapper.updateById(appointment);
        return "更新成功";
    }
}
