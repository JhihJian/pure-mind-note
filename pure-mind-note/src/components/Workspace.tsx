import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import './Workspace.css';

interface WorkspaceProps {
  isVisible: boolean;
  onClose: () => void;
}

const Workspace: React.FC<WorkspaceProps> = ({ isVisible, onClose }) => {
  const { userConfig, updateUserConfig, loadWorkspace } = useAppContext();
  const [workspacePath, setWorkspacePath] = useState(userConfig.workspacePath);
  const [isLoading, setIsLoading] = useState(false);

  // 保存工作区配置
  const saveWorkspacePath = async () => {
    setIsLoading(true);
    try {
      await updateUserConfig({ workspacePath });
      onClose();
    } catch (error) {
      console.error('保存工作区路径失败:', error);
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