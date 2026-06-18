package com.harmony.health.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.harmony.health.entity.Appointment;
import com.harmony.health.mapper.AppointmentMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
public class AppointmentService {

    private static final int DAILY_LIMIT = 5;

    @Autowired
    private AppointmentMapper appointmentMapper;

    public long countByDate(LocalDate date) {
        LambdaQueryWrapper<Appointment> query = new LambdaQueryWrapper<>();
        query.eq(Appointment::getAppointmentDate, date)
             .in(Appointment::getStatus, "PENDING", "CONFIRMED");
        return appointmentMapper.selectCount(query);
    }

    public int getRemainingSlots(LocalDate date) {
        long count = countByDate(date);
        return Math.max(0, DAILY_LIMIT - (int) count);
    }

    public boolean canBook(LocalDate date) {
        return countByDate(date) < DAILY_LIMIT;
    }

    public Appointment book(Appointment appointment) {
        LocalDate date = appointment.getAppointmentDate();
        if (!canBook(date)) {
            throw new RuntimeException("该日期预约名额已满（每日限" + DAILY_LIMIT + "人）");
        }
        appointment.setStatus("PENDING");
        appointment.setCreatedAt(LocalDateTime.now());
        appointmentMapper.insert(appointment);
        return appointment;
    }
}
