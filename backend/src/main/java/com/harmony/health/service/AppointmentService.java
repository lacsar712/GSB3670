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

    public static final int DAILY_LIMIT = 5;

    @Autowired
    private AppointmentMapper appointmentMapper;

    /**
     * 统计指定日期已预约人数（不含已取消）
     */
    public long countByDate(LocalDate date) {
        if (date == null) {
            return 0L;
        }
        LambdaQueryWrapper<Appointment> query = new LambdaQueryWrapper<>();
        query.eq(Appointment::getAppointmentDate, date)
                .ne(Appointment::getStatus, "CANCELLED");
        return appointmentMapper.selectCount(query);
    }

    /**
     * 计算指定日期剩余名额
     */
    public long remainingByDate(LocalDate date) {
        long used = countByDate(date);
        long remaining = DAILY_LIMIT - used;
        return Math.max(remaining, 0L);
    }

    /**
     * 创建预约前进行名额校验，校验通过则写入数据库
     */
    public void book(Appointment appointment) {
        if (appointment == null || appointment.getAppointmentDate() == null) {
            throw new IllegalArgumentException("预约日期不能为空");
        }
        long count = countByDate(appointment.getAppointmentDate());
        if (count >= DAILY_LIMIT) {
            throw new IllegalStateException("该日期预约已满，请选择其他日期");
        }
        appointment.setStatus("PENDING");
        appointment.setCreatedAt(LocalDateTime.now());
        appointmentMapper.insert(appointment);
    }

    public List<Appointment> list(LambdaQueryWrapper<Appointment> query) {
        return appointmentMapper.selectList(query);
    }

    public Appointment getById(Integer id) {
        return appointmentMapper.selectById(id);
    }

    public void updateById(Appointment appointment) {
        appointmentMapper.updateById(appointment);
    }
}
