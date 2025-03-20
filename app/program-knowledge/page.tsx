'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ProgramKnowledge, Example } from '../models/ProgramKnowledge';
import { Button, Card, Col, Row, Typography, Divider, Modal, Form, Input, message, Spin } from 'antd';
import { PlusOutlined, DeleteOutlined, HomeOutlined } from '@ant-design/icons';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';

const { Title, Text } = Typography;
const { TextArea } = Input;

export default function ProgramKnowledgePage() {
  const [modules, setModules] = useState<ProgramKnowledge[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [isAddTypeModalVisible, setIsAddTypeModalVisible] = useState(false);
  const [isAddExampleModalVisible, setIsAddExampleModalVisible] = useState(false);
  const [addTypeForm] = Form.useForm();
  const [addExampleForm] = Form.useForm();

  useEffect(() => {
    fetchModules();
  }, []);

  const fetchModules = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/program-knowledge');
      if (!response.ok) throw new Error('获取数据失败');
      const data = await response.json();
      setModules(data);
      if (data.length > 0 && !selectedType) {
        setSelectedType(data[0].logic_code);
      }
    } catch (error) {
      console.error('获取知识模块失败:', error);
      message.error('获取知识模块失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAddType = async (values: any) => {
    try {
      const newModule: Omit<ProgramKnowledge, '_id'> = {
        logic_code: values.logic_code,
        type: values.type,
        example: []
      };

      const response = await fetch('/api/program-knowledge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newModule),
      });

      if (!response.ok) throw new Error('创建失败');
      
      message.success('添加类型成功');
      setIsAddTypeModalVisible(false);
      addTypeForm.resetFields();
      await fetchModules();
      setSelectedType(values.logic_code);
    } catch (error) {
      console.error('添加类型失败:', error);
      message.error('添加类型失败');
    }
  };

  const handleAddExample = async (values: any) => {
    if (!selectedType) return;

    try {
      const newExample: Example = {
        desc: values.desc,
        code: values.code
      };

      const response = await fetch(`/api/program-knowledge/${selectedType}/example`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newExample),
      });

      if (!response.ok) throw new Error('添加示例失败');
      
      message.success('添加示例成功');
      setIsAddExampleModalVisible(false);
      addExampleForm.resetFields();
      await fetchModules();
    } catch (error) {
      console.error('添加示例失败:', error);
      message.error('添加示例失败');
    }
  };

  const handleDeleteExample = async (exampleIndex: number) => {
    if (!selectedType) return;

    try {
      const response = await fetch(`/api/program-knowledge/${selectedType}/example/${exampleIndex}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('删除示例失败');
      
      message.success('删除示例成功');
      await fetchModules();
    } catch (error) {
      console.error('删除示例失败:', error);
      message.error('删除示例失败');
    }
  };

  const selectedModule = modules.find(m => m.logic_code === selectedType);

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/">
          <Button type="primary" icon={<HomeOutlined />}>返回首页</Button>
        </Link>
        <Title level={2}>编程知识管理</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={() => setIsAddTypeModalVisible(true)}
        >
          添加类型
        </Button>
      </div>

      <Divider />

      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
        </div>
      ) : (
        <Row gutter={16}>
          <Col span={6}>
            <Card title="知识类型" style={{ marginBottom: '20px' }}>
              {modules.length === 0 ? (
                <Text type="secondary">暂无数据</Text>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {modules.map((module) => (
                    <Button
                      key={module.logic_code}
                      type={selectedType === module.logic_code ? 'primary' : 'default'}
                      style={{ marginBottom: '8px', textAlign: 'left' }}
                      onClick={() => setSelectedType(module.logic_code)}
                    >
                      {module.type || module.logic_code}
                    </Button>
                  ))}
                </div>
              )}
            </Card>
          </Col>
          
          <Col span={18}>
            {selectedModule ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <Title level={3}>{selectedModule.type || selectedModule.logic_code} 示例</Title>
                  <Button 
                    type="primary" 
                    icon={<PlusOutlined />} 
                    onClick={() => setIsAddExampleModalVisible(true)}
                  >
                    添加示例
                  </Button>
                </div>
                
                {selectedModule.example.length === 0 ? (
                  <Card>
                    <Text type="secondary">暂无示例，请添加</Text>
                  </Card>
                ) : (
                  <Row gutter={[16, 16]}>
                    {selectedModule.example.map((example, index) => (
                      <Col span={12} key={index}>
                        <Card 
                          title={example.desc}
                          extra={
                            <Button 
                              danger 
                              icon={<DeleteOutlined />} 
                              onClick={() => handleDeleteExample(index)}
                              size="small"
                            />
                          }
                          style={{ height: '100%' }}
                        >
                          <SyntaxHighlighter language="javascript" style={docco}>
                            {example.code}
                          </SyntaxHighlighter>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                )}
              </>
            ) : (
              <Card>
                <Text type="secondary">请选择一个知识类型</Text>
              </Card>
            )}
          </Col>
        </Row>
      )}

      {/* 添加类型的模态框 */}
      <Modal
        title="添加知识类型"
        open={isAddTypeModalVisible}
        onCancel={() => setIsAddTypeModalVisible(false)}
        footer={null}
      >
        <Form
          form={addTypeForm}
          layout="vertical"
          onFinish={handleAddType}
        >
          <Form.Item
            name="logic_code"
            label="逻辑代码"
            rules={[{ required: true, message: '请输入逻辑代码' }]}
          >
            <Input placeholder="如: react, nodejs" />
          </Form.Item>
          <Form.Item
            name="type"
            label="显示名称"
            rules={[{ required: true, message: '请输入显示名称' }]}
          >
            <Input placeholder="如: React, Node.js" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              提交
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* 添加示例的模态框 */}
      <Modal
        title="添加代码示例"
        open={isAddExampleModalVisible}
        onCancel={() => setIsAddExampleModalVisible(false)}
        footer={null}
        width={700}
      >
        <Form
          form={addExampleForm}
          layout="vertical"
          onFinish={handleAddExample}
        >
          <Form.Item
            name="desc"
            label="描述"
            rules={[{ required: true, message: '请输入示例描述' }]}
          >
            <Input placeholder="如: 使用useState钩子" />
          </Form.Item>
          <Form.Item
            name="code"
            label="代码"
            rules={[{ required: true, message: '请输入代码示例' }]}
          >
            <TextArea rows={10} placeholder="输入代码示例" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              提交
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}