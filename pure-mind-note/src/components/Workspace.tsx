import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import './Workspace.css';
import * as ConfigService from '../services/ConfigService';
import { normalize } from '@tauri-apps/api/path';

interface WorkspaceProps {
  isVisible: boolean;
  onClose: () => void;
}

const Workspace: React.FC<WorkspaceProps> = ({ isVisible, onClose }) => {
  const { userConfig, updateUserConfig, loadWorkspace } = useAppContext();
  const [workspacePath, setWorkspacePath] = useState(userConfig.workspacePath);
  const [isLoading, setIsLoading] = useState(false);

  // 当userConfig或isVisible变化时更新状态
  useEffect(() => {
    if (isVisible) {
      setWorkspacePath(userConfig.workspacePath);
      
      // 规范化路径格式
      if (userConfig.workspacePath) {
        normalizeWorkspacePath(userConfig.workspacePath);
      }
    }
  }, [isVisible, userConfig]);

  // 规范化路径格式
  const normalizeWorkspacePath = async (path: string) => {
    if (!path || path.trim() === '') return;
    
    try {
      // 规范化路径
      let normalizedPath = await normalize(path);
      
      // 修复Windows上可能的分号错误
      if (normalizedPath.includes(';')) {
        normalizedPath = normalizedPath.replace(';', ':');
        console.log('修正了路径中的分号:', normalizedPath);
      }
      
      // 只有当路径格式有变化时才更新
      if (normalizedPath !== path) {
        setWorkspacePath(normalizedPath);
        console.log('规范化后的工作区路径:', normalizedPath);
      }
    } catch (error) {
      console.warn('路径规范化失败:', error);
    }
  };

  // 保存工作区配置
  const saveWorkspacePath = async () => {
    setIsLoading(true);
    try {
      // 确保工作区路径有效
      if (workspacePath.trim() === '') {
        alert('请输入有效的工作区路径');
        setIsLoading(false);
        return;
      }
      
      await updateUserConfig({ workspacePath });
      console.log('工作区路径已保存:', workspacePath);
      onClose();
    } catch (error) {
      console.error('保存工作区路径失败:', error);
      alert(`保存失败: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 刷新当前工作区
  const refreshWorkspace = async () => {
    setIsLoading(true);
    try {
      await loadWorkspace();
      setTimeout(() => {
        setIsLoading(false);
        onClose();
      }, 500);
    } catch (error) {
      console.error('刷新工作区失败:', error);
      setIsLoading(false);
    }
  };

  // 测试配置保存
  const testConfigStorage = async () => {
    setIsLoading(true);
    try {
      const testResult = await ConfigService.testConfigStorage();
      if (testResult) {
        alert('配置存储测试成功！您的配置可以正常保存。');
      } else {
        alert('配置存储测试失败！请检查权限或存储空间。');
      }
    } catch (error) {
      console.error('配置存储测试失败:', error);
      alert(`测试失败: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="workspace-panel">
      <div className="panel-header">
        <h3>工作区设置</h3>
        <button 
          className="close-button"
          onClick={onClose}
        >
          ×
        </button>
      </div>
      <div className="panel-content">
        <div className="setting-item">
          <label>工作区路径:</label>
          <input
            type="text"
            value={workspacePath}
            onChange={(e) => setWorkspacePath(e.target.value)}
            placeholder="输入自定义工作区路径"
            disabled={isLoading}
          />
          <p className="setting-description">
            工作区是存储您所有笔记和分类的位置。修改此路径将会影响数据的存储位置。
          </p>
        </div>
        
        <div className="setting-item">
          <button 
            className="secondary-button refresh-button" 
            onClick={refreshWorkspace}
            disabled={isLoading}
          >
            {isLoading ? '正在刷新...' : '刷新工作区数据'}
          </button>
          <p className="setting-description">
            根据工作区的目录结构重新加载所有分类和笔记。如果您在外部修改了文件，请点击刷新。
          </p>
        </div>
        
        <div className="setting-item">
          <button 
            className="secondary-button test-button" 
            onClick={testConfigStorage}
            disabled={isLoading}
          >
            {isLoading ? '正在测试...' : '测试配置存储'}
          </button>
          <p className="setting-description">
            测试配置是否能够正常保存和读取。如果配置无法正常保存，可以点击此按钮检查原因。
          </p>
        </div>
        
        <div className="panel-actions">
          <button 
            className="secondary-button" 
            onClick={onClose}
            disabled={isLoading}
          >
            取消
          </button>
          <button 
            className="primary-button" 
            onClick={saveWorkspacePath}
            disabled={isLoading}
          >
            {isLoading ? '保存中...' : '保存设置'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Workspace; 