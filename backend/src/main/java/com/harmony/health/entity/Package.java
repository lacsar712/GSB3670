package com.harmony.health.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("packages")
public class Package {
    @TableId(type = IdType.AUTO)
    private Integer id;
    private String name;
    private String description;
    private String items;
    private BigDecimal price;
    private LocalDateTime createdAt;
}
