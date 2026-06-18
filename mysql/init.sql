-- Create Database
SET NAMES utf8mb4;
CREATE DATABASE IF NOT EXISTS harmony_health DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE harmony_health;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    password VARCHAR(100) NOT NULL COMMENT '密码',
    real_name VARCHAR(50) COMMENT '真名',
    gender VARCHAR(10) COMMENT '性别',
    phone VARCHAR(20) COMMENT '联系电话',
    role VARCHAR(20) DEFAULT 'USER' COMMENT '角色: ADMIN, USER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Examination Packages Table
CREATE TABLE IF NOT EXISTS packages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL COMMENT '套餐名称',
    description TEXT COMMENT '套餐描述',
    items TEXT COMMENT '包含项目 (JSON 字符串或逗号分隔)',
    price DECIMAL(10, 2) NOT NULL COMMENT '价格',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Appointments Table
CREATE TABLE IF NOT EXISTS appointments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL COMMENT '用户ID',
    package_id INT NOT NULL COMMENT '套餐ID',
    appointment_date DATE NOT NULL COMMENT '预约日期',
    status VARCHAR(20) DEFAULT 'PENDING' COMMENT '状态: PENDING, CONFIRMED, COMPLETED, CANCELLED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (package_id) REFERENCES packages(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Examination Reports Table
CREATE TABLE IF NOT EXISTS reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    appointment_id INT NOT NULL UNIQUE COMMENT '预约ID',
    user_id INT NOT NULL COMMENT '用户ID',
    basic_data TEXT COMMENT '体检指标数据 (JSON)',
    ai_summary TEXT COMMENT 'AI 生成的健康分析总结',
    status VARCHAR(20) DEFAULT 'DRAFT' COMMENT '状态: DRAFT, FINALIZED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed Data
INSERT INTO users (username, password, real_name, gender, phone, role) VALUES 
('admin', '123456', '系统管理员', 'MALE', '13800000000', 'ADMIN'),
('user1', '123456', '张三', 'MALE', '13811111111', 'USER');

INSERT INTO packages (name, description, items, price) VALUES 
('基础入职体检', '适用于初入职场的员工，涵盖基础身体指标。', '身高,体重,血压,血常规,尿常规,心电图', 299.00),
('深度健康筛查', '全面深度体检，包含肿瘤筛查、CT、心脑血管评估。', '基础项目,肺部CT,胃镜,腹部彩超,肿瘤标志物,血脂分析', 1299.00),
('中老年关爱套餐', '针对中老年常见慢性病设计的专项体检。', '基础项目,骨密度,心功能检查,眼底检查,前列腺彩超', 899.00);
