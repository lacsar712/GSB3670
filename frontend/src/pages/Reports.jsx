import React, { useState, useEffect } from 'react';
import { FileSearchOutlined, RobotOutlined, CheckCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { Table as AntTable, Button as AntButton, Card as AntCard, Typography as AntTypography, Tag as AntTag, Space as AntSpace, Modal as AntModal, Descriptions, Divider as AntDivider, Skeleton, message, Form as AntForm, Input as AntInput, Select as AntSelect } from 'antd';
import api from '../services/api';

const { Title, Paragraph, Text } = AntTypography;

const Reports = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedReport, setSelectedReport] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [createLoading, setCreateLoading] = useState(false);
    const [createForm] = AntForm.useForm();
    const [packages, setPackages] = useState({});
    const [appointments, setAppointments] = useState({});
    const [rawAppointments, setRawAppointments] = useState([]);

    const role = localStorage.getItem('role');
    const userId = localStorage.getItem('userId');

    const fetchData = async () => {
        setLoading(true);
        try {
            const [res, aptRes, pkgRes] = await Promise.all([
                api.get('/reports', {
                    params: role === 'ADMIN' ? {} : { userId: userId }
                }),
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

            const aptMap = {};
            if (aptRes && Array.isArray(aptRes)) {
                aptRes.forEach(a => {
                    aptMap[a.id] = a.packageId;
                });
                setRawAppointments(aptRes);
            }
            setAppointments(aptMap);

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

    const handleGenerateAI = async (report) => {
        setGenerating(true);
        try {
            const res = await api.post(`/reports/${report.id}/generate`);
            message.success('AI 健康分析已生成');
            fetchData();
            setSelectedReport(res);
        } catch (error) {
            message.error('AI 环境可能尚未就绪或生成失败');
        } finally {
            setGenerating(false);
        }
    };

    const handleCreateReport = async (values) => {
        setCreateLoading(true);
        try {
            // Find the selected appointment to extract user ID automatically
            const selectedApt = rawAppointments.find(a => a.id === values.appointmentId);
            const payload = {
                ...values,
                userId: selectedApt ? selectedApt.userId : null
            };

            await api.post('/reports', payload);
            message.success('体检报告创建成功');
            setIsCreateModalOpen(false);
            createForm.resetFields();
            fetchData();
        } catch (error) {
            message.error('体检报告创建失败, 可能是该预约已出具报告或数据格式错误');
        } finally {
            setCreateLoading(false);
        }
    };

    const showReportDetails = (report) => {
        setSelectedReport(report);
        setIsModalOpen(true);
    };

    const columns = [
        { title: '报告ID', dataIndex: 'id', key: 'id' },
        {
            title: '预约项目',
            dataIndex: 'appointmentId',
            key: 'appointmentId',
            render: (appointmentId) => {
                const pkgId = appointments[appointmentId];
                return pkgId && packages[pkgId] ? packages[pkgId] : `预约 ${appointmentId}`;
            }
        },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <AntTag color={status === 'FINALIZED' ? 'green' : 'orange'}>
                    {status === 'FINALIZED' ? '已生成' : '待处理'}
                </AntTag>
            )
        },
        { title: '生成日期', dataIndex: 'createdAt', key: 'createdAt' },
        {
            title: '操作',
            key: 'action',
            render: (_, record) => (
                <AntSpace size="middle">
                    <AntButton icon={<FileSearchOutlined />} onClick={() => showReportDetails(record)}>查看详情</AntButton>
                    {role === 'ADMIN' && record.status !== 'FINALIZED' && (
                        <AntButton
                            type="primary"
                            icon={<RobotOutlined />}
                            onClick={() => handleGenerateAI(record)}
                            loading={generating}
                        >
                            AI 分析
                        </AntButton>
                    )}
                </AntSpace>
            ),
        },
    ];

    return (
        <div className="p-8">
            <AntCard
                title={<Title level={3}>体检报告系统</Title>}
                className="shadow-md rounded-xl"
                extra={role === 'ADMIN' && (
                    <AntButton
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => setIsCreateModalOpen(true)}
                    >
                        录入体检数据
                    </AntButton>
                )}
            >
                <AntTable columns={columns} dataSource={data} rowKey="id" loading={loading} />
            </AntCard>

            <AntModal
                title="体检报告详情"
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={[
                    <AntButton key="close" onClick={() => setIsModalOpen(false)}>关闭</AntButton>
                ]}
                width={800}
            >
                {selectedReport ? (
                    <div className="p-4">
                        <Descriptions title="基本信息" bordered column={2}>
                            <Descriptions.Item label="报告编号">{selectedReport.id}</Descriptions.Item>
                            <Descriptions.Item label="生成时间">{selectedReport.createdAt}</Descriptions.Item>
                            <Descriptions.Item label="体检数据" span={2}>{selectedReport.basicData || '尚未录入数据'}</Descriptions.Item>
                        </Descriptions>

                        <AntDivider orientation="left"><RobotOutlined /> AI 健康分析总结</AntDivider>

                        <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 shadow-inner">
                            {selectedReport.aiSummary ? (
                                <Paragraph className="whitespace-pre-wrap text-lg leading-relaxed text-gray-800">
                                    {selectedReport.aiSummary}
                                </Paragraph>
                            ) : (
                                <div className="text-center py-10">
                                    <Text type="secondary">本报告尚未进行 AI 分析</Text>
                                    {role === 'ADMIN' && (
                                        <div className="mt-4">
                                            <AntButton type="primary" icon={<RobotOutlined />} onClick={() => handleGenerateAI(selectedReport)} loading={generating}>立即生成 AI 建议</AntButton>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {selectedReport.aiSummary && (
                            <div className="mt-6 flex justify-end items-center text-green-600">
                                <CheckCircleOutlined /> <span className="ml-2 font-semibold">AI 分析结果仅供参考，请遵循医嘱。</span>
                            </div>
                        )}
                    </div>
                ) : (
                    <Skeleton active />
                )}
            </AntModal>

            <AntModal
                title="录入真实体检数据"
                open={isCreateModalOpen}
                onCancel={() => {
                    setIsCreateModalOpen(false);
                    createForm.resetFields();
                }}
                onOk={() => createForm.submit()}
                okText="保存报告"
                cancelText="取消"
                confirmLoading={createLoading}
            >
                <div className="mb-4 text-gray-500">
                    录入真实的体检数据后，将生成一份“待处理”状态的报告。随后可进行AI分析。
                </div>
                <AntForm
                    form={createForm}
                    layout="vertical"
                    onFinish={handleCreateReport}
                >
                    <AntForm.Item
                        name="appointmentId"
                        label="关联用户的体检预约"
                        rules={[{ required: true, message: '请选择已完成体检的预约单' }]}
                    >
                        <AntSelect
                            placeholder="请选择已完成体检的预约单"
                            showSearch
                            optionFilterProp="children"
                            notFoundContent={<span style={{ color: '#aaa', padding: '8px 12px', display: 'block' }}>暂无“体检完成”状态的预约，请先在预约管理中将预约状态设为「体检完成」</span>}
                        >
                            {rawAppointments
                                .filter(apt => apt.status === 'COMPLETED')
                                .map(apt => (
                                    <AntSelect.Option key={apt.id} value={apt.id}>
                                        预约号: {apt.id} | 用户ID: {apt.userId} | 套餐: {packages[apt.packageId] || apt.packageId}
                                    </AntSelect.Option>
                                ))}
                        </AntSelect>
                    </AntForm.Item>
                    <AntForm.Item
                        name="basicData"
                        label="体检数据 (真实指标)"
                        rules={[{ required: true, message: '请录入真实的体检数据指标' }]}
                    >
                        <AntInput.TextArea
                            rows={6}
                            placeholder="例如：\n身高: 175cm\n体重: 72kg\n血压: 120/80 mmHg\n心率: 75次/分\n空腹血糖: 5.2 mmol/L\n总胆固醇: 4.5 mmol/L\n心电图: 正常心电图"
                        />
                    </AntForm.Item>
                </AntForm>
            </AntModal>
        </div>
    );
};

export default Reports;
