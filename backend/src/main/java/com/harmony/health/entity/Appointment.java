package com.harmony.health.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("appointments")
public class Appointment {
    @TableId(type = IdType.AUTO)
    private Integer id;
    private Integer userId;
    private Integer packageId;
    private LocalDate appointmentDate;
    private String status;
    private LocalDateTime createdAt;
}
