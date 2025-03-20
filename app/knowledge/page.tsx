'use client';

import { useState, useEffect } from 'react';
import { ProgramKnowledge, Example } from '../models/ProgramKnowledge';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import BackToHome from '../components/BackToHome';
import styles from '../styles/Knowledge.module.css';

export default function ProgramKnowledgePage() {
  const [knowledges, setKnowledges] = useState<ProgramKnowledge[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [isAddTypeModalVisible, setIsAddTypeModalVisible] = useState(false);
  const [isAddExampleModalVisible, setIsAddExampleModalVisible] = useState(false);
  const [newTypeLogicCode, setNewTypeLogicCode] = useState('');
  const [newTypeName, setNewTypeName] = useState('');
  const [newExampleDesc, setNewExampleDesc] = useState('');
  const [newExampleCode, setNewExampleCode] = useState('');

  async function fetchKnowledges() {
    try {
      setLoading(true);
      const response = await fetch('/api/knowledge');
      if (!response.ok) throw new Error('获取数据失败');
      const data = await response.json();
      setKnowledges(data);
      if (data.length > 0 && !selectedType) {
        setSelectedType(data[0].logic_code);
      }
    } catch (error) {
      console.error('获取知识模块失败:', error);
      alert('获取知识模块失败');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchKnowledges();
  }, []);

  const handleAddType = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newModule: Omit<ProgramKnowledge, '_id'> = {
        logic_code: newTypeLogicCode,
        type: newTypeName,
        example: []
      };

      const response = await fetch('/api/knowledge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newModule),
      });

      if (!response.ok) throw new Error('创建失败');
      
      alert('添加类型成功');
      setIsAddTypeModalVisible(false);
      setNewTypeLogicCode('');
      setNewTypeName('');
      await fetchKnowledges();
      setSelectedType(newTypeLogicCode);
    } catch (error) {
      console.error('添加类型失败:', error);
      alert('添加类型失败');
    }
  };

  const handleAddExample = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedType) return;

    try {
      const newExample: Example = {
        desc: newExampleDesc,
        code: newExampleCode
      };

      const response = await fetch(`/api/knowledge/${selectedType}/example`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newExample),
      });

      if (!response.ok) throw new Error('添加示例失败');
      
      alert('添加示例成功');
      setIsAddExampleModalVisible(false);
      setNewExampleDesc('');
      setNewExampleCode('');
      await fetchKnowledges();
    } catch (error) {
      console.error('添加示例失败:', error);
      alert('添加示例失败');
    }
  };

  const handleDeleteExample = async (exampleIndex: number) => {
    if (!selectedType) return;

    try {
      const response = await fetch(`/api/knowledge/${selectedType}/example/${exampleIndex}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('删除示例失败');
      
      alert('删除示例成功');
      await fetchKnowledges();
    } catch (error) {
      console.error('删除示例失败:', error);
      alert('删除示例失败');
    }
  };

  const selectedModule = knowledges.find(m => m.logic_code === selectedType);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <BackToHome />
        <h1 className={styles.title}>编程知识管理</h1>
        <button 
          className={styles.addButton}
          onClick={() => setIsAddTypeModalVisible(true)}
        >
          添加类型
        </button>
      </div>

      <hr className={styles.divider} />

      {loading ? (
        <div className={styles.loading}>
          <p>加载中...</p>
        </div>
      ) : (
        <div className={styles.content}>
          <div className={styles.sidebar}>
            <div className={styles.typeList}>
              <h2 className={styles.sectionTitle}>知识类型</h2>
              {knowledges.length === 0 ? (
                <p className={styles.emptyText}>暂无数据</p>
              ) : (
                <div className={styles.typeButtons}>
                  {knowledges.map((knowledge) => (
                    <button
                      key={knowledge.logic_code}
                      className={`${styles.typeButton} ${selectedType === knowledge.logic_code ? styles.activeType : ''}`}
                      onClick={() => setSelectedType(knowledge.logic_code)}
                    >
                      {knowledge.type || knowledge.logic_code}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className={styles.mainContent}>
            {selectedModule ? (
              <>
                <div className={styles.exampleHeader}>
                  <h2 className={styles.exampleTitle}>{selectedModule.type || selectedModule.logic_code} 示例</h2>
                  <button 
                    className={styles.addButton}
                    onClick={() => setIsAddExampleModalVisible(true)}
                  >
                    添加示例
                  </button>
                </div>
                
                {selectedModule.example.length === 0 ? (
                  <div className={styles.emptyExample}>
                    <p className={styles.emptyText}>暂无示例，请添加</p>
                  </div>
                ) : (
                  <div className={styles.exampleGrid}>
                    {selectedModule.example.map((example, index) => (
                      <div className={styles.exampleCard} key={index}>
                        <div className={styles.cardHeader}>
                          <h3 className={styles.cardTitle}>{example.desc}</h3>
                          <button 
                            className={styles.deleteButton}
                            onClick={() => handleDeleteExample(index)}
                          >
                            删除
                          </button>
                        </div>
                        <div className={styles.cardContent}>
                          <SyntaxHighlighter 
                            language={selectedModule.logic_code}
                            style={docco}
                            wrapLines={true}
                            showLineNumbers={false}
                            wrapLongLines={false}
                          >
                            {example.code}
                          </SyntaxHighlighter>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className={styles.emptySelection}>
                <p className={styles.emptyText}>请选择一个知识类型</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 添加类型的模态框 */}
      {isAddTypeModalVisible && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>添加知识类型</h2>
              <button 
                className={styles.closeButton}
                onClick={() => setIsAddTypeModalVisible(false)}
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleAddType} className={styles.form}>
              <div className={styles.formGroup}>
                <label className={styles.label}>逻辑代码</label>
                <input 
                  type="text"
                  className={styles.input}
                  value={newTypeLogicCode}
                  onChange={(e) => setNewTypeLogicCode(e.target.value)}
                  placeholder="如: react, nodejs"
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>显示名称</label>
                <input 
                  type="text"
                  className={styles.input}
                  value={newTypeName}
                  onChange={(e) => setNewTypeName(e.target.value)}
                  placeholder="如: React, Node.js"
                  required
                />
              </div>
              <button type="submit" className={styles.submitButton}>
                提交
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 添加示例的模态框 */}
      {isAddExampleModalVisible && (
        <div className={styles.modalBackdrop}>
          <div className={`${styles.modal} ${styles.largeModal}`}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>添加代码示例</h2>
              <button 
                className={styles.closeButton}
                onClick={() => setIsAddExampleModalVisible(false)}
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleAddExample} className={styles.form}>
              <div className={styles.formGroup}>
                <label className={styles.label}>描述</label>
                <input 
                  type="text"
                  className={styles.input}
                  value={newExampleDesc}
                  onChange={(e) => setNewExampleDesc(e.target.value)}
                  placeholder="如: 使用useState钩子"
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>代码</label>
                <textarea 
                  className={styles.textarea}
                  value={newExampleCode}
                  onChange={(e) => setNewExampleCode(e.target.value)}
                  placeholder="输入代码示例"
                  rows={10}
                  required
                />
              </div>
              <button type="submit" className={styles.submitButton}>
                提交
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}