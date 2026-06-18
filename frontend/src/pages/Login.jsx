import React, { useState } from 'react';
import { Button, Form, Input, Card, Typography, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const { Title } = Typography;

const Login = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const onFinish = async (values) => {
        setLoading(true);
        try {
            const res = await api.post('/auth/login', values);
            localStorage.setItem('token', res.token);
            localStorage.setItem('realName', res.user.realName);
            localStorage.setItem('role', res.user.role);
            localStorage.setItem('userId', res.user.id);
            message.success('登录成功');
            navigate('/dashboard');
        } catch (error) {
            console.error('Login error:', error);
            // Error message is already handled by api.js interceptor
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-subtle-gradient">
            <Card className="w-full max-w-md shadow-xl rounded-2xl p-8">
                <div className="text-center mb-10">
                    <Title level={2}>悦康体检中心</Title>
                    <p className="text-gray-500">HarmonyHealth Management System</p>
                </div>
                <Form
                    name="login_form"
                    className="login-form"
                    initialValues={{ remember: true }}
                    onFinish={onFinish}
                    size="large"
                >
                    <Form.Item
                        name="username"
                        rules={[{ required: true, message: '请输入用户名!' }]}
                    >
                        <Input prefix={<UserOutlined />} placeholder="用户名" />
                    </Form.Item>
                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: '请输入密码!' }]}
                    >
                        <Input
                            prefix={<LockOutlined />}
                            type="password"
                            placeholder="密码"
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" className="w-full h-12 text-lg" loading={loading}>
                            登 录
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default Login;
