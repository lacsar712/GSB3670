package com.harmony.health.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("reports")
public class Report {
    @TableId(type = IdType.AUTO)
    private Integer id;
    private Integer appointmentId;
    private Integer userId;
    private String basicData;
    private String aiSummary;
    private String status;
    private LocalDateTime createdAt;
}
