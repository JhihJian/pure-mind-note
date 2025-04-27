import React, { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import * as FileService from '../services/FileService';
import * as ConfigService from '../services/ConfigService';
import { normalize } from '@tauri-apps/api/path';

interface WorkspaceInitializerProps {
  onInitialized?: () => void;
  onError?: (error: any) => void;
}

const WorkspaceInitializer: React.FC<WorkspaceInitializerProps> = ({ 
  onInitialized, 
  onError 
}) => {
  const { userConfig, updateUserConfig, loadWorkspace } = useAppContext();
  const [isInitializing, setIsInitializing] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [error, setError] = useState<any>(null);

  // 组件挂载时自动初始化工作区
  useEffect(() => {
    initializeWorkspace();
  }, []);

  // 监听工作区路径变化，自动刷新
  useEffect(() => {
    if (userConfig.workspacePath && userConfig.workspacePath.trim() !== '') {
      refreshWorkspace();
    }
  }, [userConfig.workspacePath]);

  // 工作区初始化流程
  const initializeWorkspace = async () => {
    if (isInitializing) return;
    
    setIsInitializing(true);
    setError(null);
    
    try {
      // 1. 加载用户配置
      await loadUserConfig();
      
      // 2. 初始化工作区
      if (userConfig.workspacePath && userConfig.workspacePath.trim() !== '') {
        await refreshWorkspace();
      }
      
      setIsInitialized(true);
      onInitialized && onInitialized();
    } catch (err) {
      console.error('工作区初始化失败:', err);
      setError(err);
      onError && onError(err);
    } finally {
      setIsInitializing(false);
    }
  };

  // 加载用户配置
  const loadUserConfig = async () => {
    try {
      const config = await ConfigService.loadConfig();
      
      // 规范化工作区路径
      if (config.workspacePath) {
        try {
          let normalizedPath = await normalize(config.workspacePath);
          
          // 修复Windows上可能的分号错误
          if (normalizedPath.includes(';')) {
            normalizedPath = normalizedPath.replace(';', ':');
            console.log('修正了路径中的分号:', normalizedPath);
          }
          
          if (normalizedPath !== config.workspacePath) {
            config.workspacePath = normalizedPath;
            // 保存修正后的配置
            await ConfigService.saveConfig(config);
          }
        } catch (err) {
          console.warn('路径规范化失败:', err);
        }
      }
      
      // 更新上下文中的配置
      await updateUserConfig(config);
      console.log('用户配置加载完成:', config);
    } catch (err) {
      console.error('加载用户配置失败:', err);
      throw err;
    }
  };

  // 刷新工作区
  const refreshWorkspace = async () => {
    try {
      console.log('正在刷新工作区数据...');
      await loadWorkspace();
      console.log('工作区数据刷新完成');
    } catch (err) {
      console.error('刷新工作区失败:', err);
      throw err;
    }
  };

  // 这个组件不渲染任何UI
  return null;
};

export default WorkspaceInitializer; 