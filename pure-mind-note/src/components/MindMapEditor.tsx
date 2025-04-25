// src/components/MindMapEditor.tsx
import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import MindMap from 'simple-mind-map';
import { useAppContext } from '../context/AppContext';
import './MindMapEditor.css';

// 常量定义
const SIDEBAR_WIDTH = 280; // 侧边栏宽度
const HEADER_HEIGHT = 60; // 头部高度

// 为全局对象添加类型声明
declare global {
  interface Window {
    PureMindNote?: {
      getCurrentNoteData?: () => any;
      saveCurrentNote?: (data: any) => void;
      [key: string]: any;
    };
  }
}

// 状态反馈组件
interface StatusBarProps {
  isLoading: boolean;
  errorMessage: string | null;
  saveMessage: string | null;
}

const StatusBar: React.FC<StatusBarProps> = ({ isLoading, errorMessage, saveMessage }) => {
  return (
    <div className="status-bar">
      {isLoading && <div className="loading-indicator">正在加载...</div>}
      {errorMessage && <div className="error-message">{errorMessage}</div>}
      {saveMessage && <div className="save-message">{saveMessage}</div>}
    </div>
  );
};

const MindMapEditor: React.FC = () => {
  const mindMapContainerRef = useRef<HTMLDivElement>(null);
  const mindMapInstanceRef = useRef<any>(null);
  const { activeNote, activeNoteData, saveCurrentNote } = useAppContext();
  const lastSavedDataRef = useRef<any>(null);
  const isSavingRef = useRef<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const prevFileNameRef = useRef<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // 使用 useMemo 缓存 activeNote，避免不必要的更新
  const memoizedActiveNote = useMemo(() => activeNote, [
    activeNote?.id
  ]);
  
  // 显示用户反馈消息
  const showFeedback = (message: string, isError = false) => {
    if (isError) {
      setErrorMessage(message);
      setTimeout(() => setErrorMessage(null), 3000);
    } else {
      setSaveMessage(message);
      setTimeout(() => setSaveMessage(null), 2000);
    }
  };

  // 保存数据的函数
  const saveData = useCallback(() => {
    const currentData = mindMapInstanceRef.current.getData();
    //直接使用从useAppContext获取的保存函数
    if (activeNoteData) {
      saveCurrentNote({
        ...activeNoteData,
        data: currentData
      });
      showFeedback('保存成功');
    }
  }, [activeNoteData, saveCurrentNote, showFeedback]); 

  // 创建思维导图实例
  const createMindMapInstance = useCallback(() => {
    if (!mindMapContainerRef.current || !activeNoteData) return false;
    
    try {
      const options = {
        el: mindMapContainerRef.current,
        data: activeNoteData.data,
        theme: activeNoteData.theme || 'default',
        keypress: true,
        contextMenu: true,
        nodeTextEdit: true
      };
       console.log('create脑图实例');
      // 创建实例
      // @ts-ignore
      mindMapInstanceRef.current = new MindMap(options);

      // 初始化上次保存的数据
      lastSavedDataRef.current = JSON.parse(JSON.stringify(activeNoteData.data));
      
      // 添加事件监听器
      mindMapInstanceRef.current.on('data_change', () => {
        // 在数据变化时触发保存
        saveData();
      });
      
      return true;
    } catch (error) {
      console.error('创建思维导图实例失败:', error);
      showFeedback('创建思维导图实例失败', true);
      return false;
    }
  }, [activeNoteData, saveData]);

  // 获取当前打开的文件名
  const getCurrentFileName = useCallback(() => {
    if (!activeNoteData) return null;
    // @ts-ignore
    return activeNoteData.filename || activeNoteData.name || activeNoteData.title || activeNoteData.id || null;
  }, [activeNoteData]);


  // 处理首次加载
  useEffect(() => {
    // 如果已经初始化过，不再重复初始化
    if (isInitialized) return;
    
    // 检查是否有数据可以初始化
    if (activeNoteData && mindMapContainerRef.current && !mindMapInstanceRef.current) {
      setIsLoading(true);
      
      // 创建实例
      const success = createMindMapInstance();
      
      // 标记为已初始化
      setIsInitialized(true);
      setIsLoading(false);
      
      // 记录当前文件名
      prevFileNameRef.current = getCurrentFileName();
    }
  }, [activeNoteData, createMindMapInstance, isInitialized, getCurrentFileName]);

  // 监听文件变化，在需要时创建或销毁实例
  useEffect(() => {
    // 如果没有容器，则不创建实例
    if (!mindMapContainerRef.current) return;
    
    const currentFileName = getCurrentFileName();
    const previousFileName = prevFileNameRef.current;
    
    // 更新之前的文件名
    prevFileNameRef.current = currentFileName;
    
    // 只有在文件名变化时才需要销毁和创建实例
    if (currentFileName === previousFileName && mindMapInstanceRef.current) {
      return;
    }
    
    // 标记为加载中
    setIsLoading(true);
    
    // 如果已有实例，则先销毁
    if (mindMapInstanceRef.current) {
      try {
        // 移除事件监听器
        mindMapInstanceRef.current.off('data_change');
        
        // 销毁实例
        mindMapInstanceRef.current.destroy();
      } catch (error) {
        console.error('销毁思维导图实例失败:', error);
      }
      
      // 清空引用
      mindMapInstanceRef.current = null;
    }
    
    // 如果没有活动笔记，则不创建新实例
    if (!activeNoteData) {
      setIsLoading(false);
      return;
    }
    
    // 创建新实例
    createMindMapInstance();
    setIsLoading(false);
    
  }, [
    // @ts-ignore
    activeNoteData?.filename, 
    // @ts-ignore
    activeNoteData?.name, 
    // @ts-ignore
    activeNoteData?.title, 
    activeNoteData?.id, 
    createMindMapInstance, 
    getCurrentFileName
  ]);

  // 清理副作用
  useEffect(() => {
    return () => {
      if (mindMapInstanceRef.current) {
        try {
          // 移除事件监听器
          mindMapInstanceRef.current.off('data_change');
          
          // 销毁实例
          mindMapInstanceRef.current.destroy();
          mindMapInstanceRef.current = null;
        } catch (error) {
          console.error('清理思维导图实例失败:', error);
        }
      }
    };
  }, []);

  
  // 日志输出，帮助调试
  useEffect(() => {
    console.log('脑图实例状态:', {
      hasInstance: !!mindMapInstanceRef.current,
      hasContainer: !!mindMapContainerRef.current,
      activeNoteId: memoizedActiveNote?.id,
      currentFileName: getCurrentFileName(),
      prevFileName: prevFileNameRef.current,
      isInitialized,
      hasData: !!activeNoteData,
      memoizedActiveNoteId: memoizedActiveNote?.id
    });
  }, [memoizedActiveNote?.id, isInitialized, activeNoteData, getCurrentFileName]);

  // 添加窗口大小变化监听
  useEffect(() => {
    const handleResize = () => {
      if (mindMapInstanceRef.current) {
        mindMapInstanceRef.current.resize();
      }
    };

    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="mindmap-editor">
      {/* 状态反馈区域 - 现在总是显示 */}
      <StatusBar 
        isLoading={isLoading}
        errorMessage={errorMessage}
        saveMessage={saveMessage}
      />
      
      {!memoizedActiveNote ? (
        <div className="mindmap-welcome">
          <h2>欢迎使用脑图笔记本</h2>
          <p>从侧边栏选择一个笔记或创建新笔记开始</p>
        </div>
      ) : (
        <div 
          className="mindmap-container" 
          ref={mindMapContainerRef}
          style={{ width: '100%', height: 'calc(100vh - 60px)' }}
        ></div>
      )}
    </div>
  );
};

// 为应用程序提供全局访问点
if (typeof window !== 'undefined') {
  window.PureMindNote = window.PureMindNote || {};
}

export default MindMapEditor;