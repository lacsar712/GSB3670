package com.harmony.health;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@MapperScan("com.harmony.health.mapper")
public class HarmonyHealthApplication {
    public static void main(String[] args) {
        SpringApplication.run(HarmonyHealthApplication.class, args);
    }
}
