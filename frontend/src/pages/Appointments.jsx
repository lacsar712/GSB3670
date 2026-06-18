import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, message, Card, Typography, Tag, Select } from 'antd';
import { ReloadOutlined, StopOutlined } from '@ant-design/icons';
import api from '../services/api';

const { Title } = Typography;
const { confirm } = Modal;
const { Option } = Select;

const Appointments = () => {
    const [data, setData] = useState([]);
    const [packages, setPackages] = useState({});
    const [loading, setLoading] = useState(false);

    const role = localStorage.getItem('role');
    const userId = localStorage.getItem('userId');

    const fetchData = async () => {
        setLoading(true);
        try {
            const [res, pkgRes] = await Promise.all([
                api.get('/appointments', {
                    params: role === 'ADMIN' ? {} : { userId: userId }
                }),
                api.get('/packages')
            ]);

            const pkgMap = {};
            if (pkgRes && Array.isArray(pkgRes)) {
                pkgRes.forEach(p => {
                    pkgMap[p.id] = p.name;
                });
            }
            setPackages(pkgMap);
            setData(res);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleStatusUpdate = async (id, status) => {
        try {
            await api.put(`/appointments/${id}/status?status=${status}`);
            message.success('状态更新成功');
            fetchData();
        } catch (error) {
            message.error('状态更新失败');
        }
    };

    const handleUserCancel = (record) => {
        confirm({
            title: '确认取消预约',
            content: `确定要取消【${packages[record.packageId] || '该套餐'}】的预约吗？取消后不可恢复。`,
            okText: '确认取消',
            okType: 'danger',
            cancelText: '返回',
            onOk: async () => {
                try {
                    await api.put(`/appointments/${record.id}/status?status=CANCELLED`);
                    message.success('预约已取消');
                    fetchData();
                } catch (error) {
                    message.error('取消失败，请稍后再试');
                }
            }
        });
    };

    const getStatusTag = (status) => {
        const colors = {
            PENDING: 'gold',
            CONFIRMED: 'blue',
            COMPLETED: 'green',
            CANCELLED: 'red',
        };
        const texts = {
            PENDING: '待处理',
            CONFIRMED: '已确认',
            COMPLETED: '已完成',
            CANCELLED: '已取消',
        };
        return <Tag color={colors[status] || 'default'}>{texts[status] || status}</Tag>;
    };

    const columns = [
        { title: '预约ID', dataIndex: 'id', key: 'id' },
        ...(role === 'ADMIN' ? [{ title: '用户ID', dataIndex: 'userId', key: 'userId' }] : []),
        {
            title: '预约套餐',
            dataIndex: 'packageId',
            key: 'packageId',
            render: (packageId) => packages[packageId] || packageId
        },
        { title: '预约日期', dataIndex: 'appointmentDate', key: 'appointmentDate' },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            render: (status) => getStatusTag(status)
        },
        {
            title: '操作',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    {role === 'ADMIN' ? (
                        <Select
                            defaultValue={record.status}
                            style={{ width: 120 }}
                            onChange={(val) => handleStatusUpdate(record.id, val)}
                            size="small"
                        >
                            <Option value="PENDING">待处理</Option>
                            <Option value="CONFIRMED">确认预约</Option>
                            <Option value="COMPLETED">体检完成</Option>
                            <Option value="CANCELLED">取消预约</Option>
                        </Select>
                    ) : (
                        record.status === 'PENDING' || record.status === 'CONFIRMED' ? (
                            <Button
                                danger
                                size="small"
                                icon={<StopOutlined />}
                                onClick={() => handleUserCancel(record)}
                            >
                                取消预约
                            </Button>
                        ) : (
                            <span className="text-gray-400 text-sm">—</span>
                        )
                    )}
                </Space>
            )
        }
    ];

    return (
        <div className="p-8">
            <Card
                title={<Title level={3}>预约管理</Title>}
                className="shadow-md rounded-xl"
                extra={
                    <Button icon={<ReloadOutlined />} onClick={fetchData} loading={loading}>
                        刷新
                    </Button>
                }
            >
                <Table columns={columns} dataSource={data} rowKey="id" loading={loading} />
            </Card>
        </div>
    );
};

export default Appointments;
