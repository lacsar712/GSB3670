import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Typography, Spin } from 'antd';
import {
    CalendarOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    MedicineBoxOutlined,
    FileTextOutlined,
    FileDoneOutlined
} from '@ant-design/icons';
import api from '../services/api';

const { Title } = Typography;

const Dashboard = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalAppointments: 0,
        pendingAppointments: 0,
        completedAppointments: 0,
        totalPackages: 0,
        totalReports: 0,
        finalizedReports: 0
    });

    const role = localStorage.getItem('role');
    const userId = localStorage.getItem('userId');

    useEffect(() => {
        fetchStatistics();
    }, []);

    const fetchStatistics = async () => {
        setLoading(true);
        const isAdmin = role === 'ADMIN';
        try {
            const params = isAdmin ? {} : { userId };
            const [appointments, packages, reports] = await Promise.all([
                api.get('/appointments', { params }),
                api.get('/packages'),
                api.get('/reports', { params })
            ]);

            const pendingCount = appointments.filter(a => a.status === 'PENDING').length;
            const completedCount = appointments.filter(a => a.status === 'COMPLETED').length;
            const finalizedCount = reports.filter(r => r.status === 'FINALIZED').length;

            setStats({
                totalAppointments: appointments.length,
                pendingAppointments: pendingCount,
                completedAppointments: completedCount,
                totalPackages: packages.length,
                totalReports: reports.length,
                finalizedReports: finalizedCount
            });
        } catch (error) {
            console.error('获取统计数据失败:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8">
            <Title level={2} className="mb-6">{role === 'ADMIN' ? '数据概览' : '我的概况'}</Title>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <Spin size="large" />
                </div>
            ) : (
                <Row gutter={[24, 24]}>
                    <Col xs={24} sm={12} lg={8}>
                        <Card bordered={false} className="shadow-md hover:shadow-lg transition-shadow">
                            <Statistic
                                title="总预约数"
                                value={stats.totalAppointments}
                                prefix={<CalendarOutlined className="text-blue-500" />}
                                valueStyle={{ color: '#1890ff' }}
                            />
                        </Card>
                    </Col>

                    <Col xs={24} sm={12} lg={8}>
                        <Card bordered={false} className="shadow-md hover:shadow-lg transition-shadow">
                            <Statistic
                                title="待处理预约"
                                value={stats.pendingAppointments}
                                prefix={<ClockCircleOutlined className="text-orange-500" />}
                                valueStyle={{ color: '#fa8c16' }}
                            />
                        </Card>
                    </Col>

                    <Col xs={24} sm={12} lg={8}>
                        <Card bordered={false} className="shadow-md hover:shadow-lg transition-shadow">
                            <Statistic
                                title="已完成预约"
                                value={stats.completedAppointments}
                                prefix={<CheckCircleOutlined className="text-green-500" />}
                                valueStyle={{ color: '#52c41a' }}
                            />
                        </Card>
                    </Col>

                    <Col xs={24} sm={12} lg={8}>
                        <Card bordered={false} className="shadow-md hover:shadow-lg transition-shadow">
                            <Statistic
                                title="体检套餐数"
                                value={stats.totalPackages}
                                prefix={<MedicineBoxOutlined className="text-purple-500" />}
                                valueStyle={{ color: '#722ed1' }}
                            />
                        </Card>
                    </Col>

                    <Col xs={24} sm={12} lg={8}>
                        <Card bordered={false} className="shadow-md hover:shadow-lg transition-shadow">
                            <Statistic
                                title="报告总数"
                                value={stats.totalReports}
                                prefix={<FileTextOutlined className="text-cyan-500" />}
                                valueStyle={{ color: '#13c2c2' }}
                            />
                        </Card>
                    </Col>

                    <Col xs={24} sm={12} lg={8}>
                        <Card bordered={false} className="shadow-md hover:shadow-lg transition-shadow">
                            <Statistic
                                title="已生成报告"
                                value={stats.finalizedReports}
                                prefix={<FileDoneOutlined className="text-green-500" />}
                                valueStyle={{ color: '#52c41a' }}
                            />
                        </Card>
                    </Col>
                </Row>
            )}
        </div>
    );
};

export default Dashboard;
