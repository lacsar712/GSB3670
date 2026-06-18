import React, { useState } from 'react';
import { Layout, Menu, Typography, Avatar, Dropdown, Space, Modal, Descriptions, Tag } from 'antd';
import {
    DashboardOutlined,
    MedicineBoxOutlined,
    CalendarOutlined,
    FileTextOutlined,
    UserOutlined,
    LogoutOutlined,
    HeartFilled
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

const SidebarLayout = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isProfileModalVisible, setIsProfileModalVisible] = useState(false);

    const role = localStorage.getItem('role');

    const menuItems = [
        ...(role === 'ADMIN' ? [{ key: '/dashboard', icon: <DashboardOutlined />, label: '数据概览' }] : []),
        { key: '/packages', icon: <MedicineBoxOutlined />, label: role === 'ADMIN' ? '套餐管理' : '预约体检' },
        { key: '/appointments', icon: <CalendarOutlined />, label: '预约管理' },
        { key: '/reports', icon: <FileTextOutlined />, label: '体检报告' },
    ];

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('realName');
        localStorage.removeItem('role');
        localStorage.removeItem('userId');
        navigate('/login');
    };

    const realName = localStorage.getItem('realName') || '系统管理员';

    const userMenu = {
        items: [
            { key: 'profile', icon: <UserOutlined />, label: '个人中心', onClick: () => setIsProfileModalVisible(true) },
            { type: 'divider' },
            { key: 'logout', icon: <LogoutOutlined />, label: '退出登录', onClick: handleLogout },
        ]
    };

    return (
        <Layout className="min-h-screen">
            <Sider
                theme="light"
                className="shadow-lg z-10"
                width={240}
                breakpoint="lg"
                collapsedWidth="0"
            >
                <div className="p-6 text-center border-b mb-4">
                    <div className="flex items-center justify-center space-x-2">
                        <HeartFilled className="text-red-500 text-2xl" />
                        <Title level={4} style={{ margin: 0 }} className="text-primary">悦康体检</Title>
                    </div>
                    <Text type="secondary" style={{ fontSize: '12px' }}>HarmonyHealth</Text>
                </div>
                <Menu
                    mode="inline"
                    selectedKeys={[location.pathname]}
                    items={menuItems}
                    onClick={({ key }) => navigate(key)}
                    className="border-none"
                />
            </Sider>
            <Layout>
                <Header className="bg-white px-8 flex justify-between items-center shadow-sm z-20">
                    <div>
                        <Text strong className="text-lg">美好生活，从健康体检开始</Text>
                    </div>
                    <Dropdown menu={userMenu} placement="bottomRight">
                        <Space className="cursor-pointer hover:bg-gray-50 px-3 py-1 rounded-lg transition-colors">
                            <Avatar icon={<UserOutlined />} className="bg-primary" />
                            <Text strong>{realName}</Text>
                        </Space>
                    </Dropdown>
                </Header>
                <Content className="m-6 bg-white rounded-2xl shadow-inner min-h-[280px]">
                    {children}
                </Content>
            </Layout>

            <Modal
                title="个人中心"
                open={isProfileModalVisible}
                onCancel={() => setIsProfileModalVisible(false)}
                footer={null}
            >
                <div className="flex flex-col items-center p-6 space-y-4">
                    <Avatar size={64} icon={<UserOutlined />} className="bg-primary" />
                    <Title level={4} className="m-0">{realName}</Title>
                    <Tag color={role === 'ADMIN' ? 'red' : 'blue'}>
                        {role === 'ADMIN' ? '系统管理员' : '普通用户'}
                    </Tag>
                </div>
            </Modal>
        </Layout>
    );
};

export default SidebarLayout;
