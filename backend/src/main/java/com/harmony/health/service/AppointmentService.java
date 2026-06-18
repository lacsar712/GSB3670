package com.harmony.health.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.harmony.health.entity.Appointment;
import com.harmony.health.mapper.AppointmentMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class AppointmentService {

    private static final int MAX_DAILY_APPOINTMENTS = 5;

    @Autowired
    private AppointmentMapper appointmentMapper;

    public List<Appointment> listAppointments(Integer userId, boolean isAdmin) {
        LambdaQueryWrapper<Appointment> query = new LambdaQueryWrapper<>();
        if (!isAdmin) {
            if (userId != null) {
                query.eq(Appointment::getUserId, userId);
            } else {
                return List.of();
            }
        } else if (userId != null) {
            query.eq(Appointment::getUserId, userId);
        }
        return appointmentMapper.selectList(query);
    }

    public int countByDate(LocalDate date) {
        LambdaQueryWrapper<Appointment> query = new LambdaQueryWrapper<>();
        query.eq(Appointment::getAppointmentDate, date)
             .in(Appointment::getStatus, "PENDING", "CONFIRMED");
        return Math.toIntExact(appointmentMapper.selectCount(query));
    }

    public int getRemainingSlots(LocalDate date) {
        return Math.max(0, MAX_DAILY_APPOINTMENTS - countByDate(date));
    }

    public String bookAppointment(Appointment appointment) {
        LocalDate appointmentDate = appointment.getAppointmentDate();
        if (appointmentDate == null) {
            return "请选择预约日期";
        }
        int currentCount = countByDate(appointmentDate);
        if (currentCount >= MAX_DAILY_APPOINTMENTS) {
            return "该日期预约已满，请选择其他日期";
        }
        appointment.setStatus("PENDING");
        appointment.setCreatedAt(LocalDateTime.now());
        appointmentMapper.insert(appointment);
        return null;
    }

    public Appointment getAppointmentById(Integer id) {
        return appointmentMapper.selectById(id);
    }

    public void updateAppointmentStatus(Appointment appointment, String status) {
        appointment.setStatus(status);
        appointmentMapper.updateById(appointment);
    }
}
