package com.harmony.health.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.harmony.health.entity.Appointment;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface AppointmentMapper extends BaseMapper<Appointment> {
}
