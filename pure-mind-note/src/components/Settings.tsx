import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import './Settings.css';

interface SettingsProps {
  isVisible: boolean;
  onClose: () => void;
}

const Settings: React.FC<SettingsProps> = ({ isVisible, onClose }) => {
  const { userConfig, updateUserConfig, loadWorkspace } = useAppContext();
  const [workspacePath, setWorkspacePath] = useState(userConfig.workspacePath);
  const [activeTab, setActiveTab] = useState<'workspace' | 'appearance' | 'advanced'>('workspace');
  const [isLoading, setIsLoading] = useState(false);
  const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'system'>('system');
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');

  // 保存工作区配置
  const saveWorkspacePath = async () => {
    setIsLoading(true);
    try {
      await updateUserConfig({ workspacePath });
      setIsLoading(false);
    } catch (error) {
      console.error('保存工作区路径失败:', error);
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
      }, 500);
    } catch (error) {
      console.error('刷新工作区失败:', error);
      setIsLoading(false);
    }
  };

  // 保存所有设置
  const saveAllSettings = async () => {
    setIsLoading(true);
    try {
      // 确保工作区路径有效
      if (workspacePath.trim() !== '') {
        // 保存工作区路径
        await updateUserConfig({ 
          workspacePath,
          // 将来可以扩展其他设置项
          theme: {
            mode: themeMode,
            fontSize
          }
        });
        console.log('设置已保存');
        // 显示成功提示
        alert('设置已保存成功');
      } else {
        alert('请输入有效的工作区路径');
      }
    } catch (error) {
      console.error('保存设置失败:', error);
      alert(`保存失败: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 关闭设置面板
  const handleClose = () => {
    // 如果有未保存的更改，可以添加提示
    onClose();
  };

  if (!isVisible) return null;

  return (
    <div className="settings-overlay">
      <div className="settings-panel">
        <div className="settings-header">
          <h2>应用设置</h2>
          <button 
            className="close-button"
            onClick={handleClose}
          >
            ×
          </button>
        </div>
        
        <div className="settings-content">
          <div className="settings-sidebar">
            <div 
              className={`settings-tab ${activeTab === 'workspace' ? 'active' : ''}`}
              onClick={() => setActiveTab('workspace')}
            >
              <span className="tab-icon">📁</span>
              <span className="tab-label">工作区</span>
            </div>
            <div 
              className={`settings-tab ${activeTab === 'appearance' ? 'active' : ''}`}
              onClick={() => setActiveTab('appearance')}
            >
              <span className="tab-icon">🎨</span>
              <span className="tab-label">外观</span>
            </div>
            <div 
              className={`settings-tab ${activeTab === 'advanced' ? 'active' : ''}`}
              onClick={() => setActiveTab('advanced')}
            >
              <span className="tab-icon">⚙️</span>
              <span className="tab-label">高级</span>
            </div>
          </div>
          
          <div className="settings-main">
            {activeTab === 'workspace' && (
              <div className="settings-section">
                <h3 className="section-title">工作区设置</h3>
                
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
              </div>
            )}
            
            {activeTab === 'appearance' && (
              <div className="settings-section">
                <h3 className="section-title">外观设置</h3>
                
                <div className="setting-item">
                  <label>主题模式:</label>
                  <div className="radio-group">
                    <label className="radio-label">
                      <input 
                        type="radio" 
                        name="theme" 
                        value="light"
                        checked={themeMode === 'light'}
                        onChange={() => setThemeMode('light')}
                      />
                      <span>浅色</span>
                    </label>
                    <label className="radio-label">
                      <input 
                        type="radio" 
                        name="theme" 
                        value="dark"
                        checked={themeMode === 'dark'}
                        onChange={() => setThemeMode('dark')}
                      />
                      <span>深色</span>
                    </label>
                    <label className="radio-label">
                      <input 
                        type="radio" 
                        name="theme" 
                        value="system"
                        checked={themeMode === 'system'}
                        onChange={() => setThemeMode('system')}
                      />
                      <span>系统默认</span>
                    </label>
                  </div>
                </div>
                
                <div className="setting-item">
                  <label>字体大小:</label>
                  <div className="radio-group">
                    <label className="radio-label">
                      <input 
                        type="radio" 
                        name="fontSize" 
                        value="small"
                        checked={fontSize === 'small'}
                        onChange={() => setFontSize('small')}
                      />
                      <span>小</span>
                    </label>
                    <label className="radio-label">
                      <input 
                        type="radio" 
                        name="fontSize" 
                        value="medium"
                        checked={fontSize === 'medium'}
                        onChange={() => setFontSize('medium')}
                      />
                      <span>中</span>
                    </label>
                    <label className="radio-label">
                      <input 
                        type="radio" 
                        name="fontSize" 
                        value="large"
                        checked={fontSize === 'large'}
                        onChange={() => setFontSize('large')}
                      />
                      <span>大</span>
                    </label>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'advanced' && (
              <div className="settings-section">
                <h3 className="section-title">高级设置</h3>
                
                <div className="setting-item">
                  <label>数据备份</label>
                  <button className="secondary-button">导出所有数据</button>
                  <p className="setting-description">
                    导出所有笔记和分类为备份文件，以便在需要时恢复。
                  </p>
                </div>
                
                <div className="setting-item">
                  <label>数据恢复</label>
                  <button className="secondary-button">导入备份文件</button>
                  <p className="setting-description">
                    从备份文件中恢复笔记和分类。注意：这将覆盖当前的数据。
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="settings-footer">
          <button 
            className="secondary-button" 
            onClick={handleClose}
          >
            取消
          </button>
          <button 
            className="primary-button" 
            onClick={saveAllSettings}
            disabled={isLoading}
          >
            {isLoading ? '保存中...' : '保存设置'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings; 