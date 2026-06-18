import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Form, Input, InputNumber, message, Card, Typography, DatePicker } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import api from '../services/api';

const { Title } = Typography;
const { confirm } = Modal;

const Packages = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [form] = Form.useForm();

    // 预约日期选择
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [bookingPkg, setBookingPkg] = useState(null);
    const [bookingDate, setBookingDate] = useState(null);
    const [bookingLoading, setBookingLoading] = useState(false);

    const role = localStorage.getItem('role');
    const userId = localStorage.getItem('userId');

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await api.get('/packages');
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

    const handleAdd = () => {
        setEditingItem(null);
        form.resetFields();
        setIsModalOpen(true);
    };

    const handleEdit = (record) => {
        setEditingItem(record);
        form.setFieldsValue(record);
        setIsModalOpen(true);
    };

    const handleBook = (pkg) => {
        setBookingPkg(pkg);
        setBookingDate(null);
        setIsBookingModalOpen(true);
    };

    const handleBookingConfirm = async () => {
        if (!bookingDate) {
            message.warning('请选择预约日期');
            return;
        }
        setBookingLoading(true);
        try {
            await api.post('/appointments', {
                userId: parseInt(userId),
                packageId: bookingPkg.id,
                appointmentDate: bookingDate.format('YYYY-MM-DD')
            });
            message.success('预约成功！请在预约管理中查看');
            setIsBookingModalOpen(false);
        } catch (error) {
            message.error('预约失败');
        } finally {
            setBookingLoading(false);
        }
    };

    const handleDelete = (id) => {
        confirm({
            title: '确认删除',
            icon: <ExclamationCircleOutlined />,
            content: '确定要删除这个体检套餐吗？此操作不可撤销。',
            okText: '确认',
            okType: 'danger',
            cancelText: '取消',
            onOk: async () => {
                try {
                    await api.delete(`/packages/${id}`);
                    message.success('删除成功');
                    fetchData();
                } catch (error) {
                    message.error('删除失败');
                }
            },
        });
    };

    const handleModalOk = async () => {
        try {
            const values = await form.validateFields();
            if (editingItem) {
                await api.put('/packages', { ...editingItem, ...values });
                message.success('更新成功');
            } else {
                await api.post('/packages', values);
                message.success('添加成功');
            }
            setIsModalOpen(false);
            fetchData();
        } catch (error) {
            console.error(error);
        }
    };

    const columns = [
        { title: '套餐名称', dataIndex: 'name', key: 'name' },
        { title: '描述', dataIndex: 'description', key: 'description' },
        { title: '包含项目', dataIndex: 'items', key: 'items' },
        { title: '价格 (¥)', dataIndex: 'price', key: 'price', render: (val) => val.toFixed(2) },
        {
            title: '操作',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    {role === 'ADMIN' ? (
                        <>
                            <Button icon={<EditOutlined />} onClick={() => handleEdit(record)}>编辑</Button>
                            <Button icon={<DeleteOutlined />} danger onClick={() => handleDelete(record.id)}>删除</Button>
                        </>
                    ) : (
                        <Button type="primary" onClick={() => handleBook(record)}>立即预约</Button>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <div className="p-8">
            <Card
                title={<Title level={3}>{role === 'ADMIN' ? '体检套餐管理' : '热门体检套餐'}</Title>}
                extra={role === 'ADMIN' && <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>添加套餐</Button>}
                className="shadow-md rounded-xl"
            >
                <Table columns={columns} dataSource={data} rowKey="id" loading={loading} />
            </Card>

            <Modal
                title={editingItem ? '编辑套餐' : '添加套餐'}
                open={isModalOpen}
                onOk={handleModalOk}
                onCancel={() => setIsModalOpen(false)}
                destroyOnClose
            >
                <Form form={form} layout="vertical" className="mt-4">
                    <Form.Item name="name" label="套餐名称" rules={[{ required: true, message: '请输入套餐名称' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="description" label="描述">
                        <Input.TextArea rows={3} />
                    </Form.Item>
                    <Form.Item name="items" label="包含项目" help="使用逗号分隔，例如：血常规, 心电图">
                        <Input />
                    </Form.Item>
                    <Form.Item name="price" label="价格" rules={[{ required: true, message: '请输入价格' }]}>
                        <InputNumber className="w-full" precision={2} />
                    </Form.Item>
                </Form>
            </Modal>

            {/* 預約日期选择弹窗 */}
            <Modal
                title={`预约：${bookingPkg?.name}`}
                open={isBookingModalOpen}
                onOk={handleBookingConfirm}
                onCancel={() => setIsBookingModalOpen(false)}
                okText="确认预约"
                cancelText="取消"
                confirmLoading={bookingLoading}
                destroyOnClose
            >
                <div style={{ margin: '24px 0' }}>
                    <p style={{ marginBottom: 12, color: '#555' }}>请选择您的体检日期（不可选择今日及过去的日期）：</p>
                    <DatePicker
                        style={{ width: '100%' }}
                        value={bookingDate}
                        onChange={(date) => setBookingDate(date)}
                        disabledDate={(current) => current && current <= dayjs().endOf('day')}
                        placeholder="请选择日期"
                        format="YYYY-MM-DD"
                    />
                </div>
            </Modal>
        </div>
    );
};

export default Packages;
