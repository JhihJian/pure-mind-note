// src/components/MindMapEditor.tsx
import React, { useRef, useEffect, useState } from 'react';
import MindMap from 'simple-mind-map';
import { useAppContext } from '../context/AppContext';
import './MindMapEditor.css'; // 我们稍后创建这个CSS文件

// simple-mind-map 选项接口
interface MindMapOptions {
  el: HTMLElement;
  data: any;
  theme?: string;
  readonly?: boolean;
  contextMenu?: boolean;
  toolBar?: boolean;
  nodeTextEdit?: boolean;
  exportPen?: boolean;
  width?: number;
  height?: number;
  [key: string]: any; // 添加索引签名以允许额外的属性
}

const MindMapEditor: React.FC = () => {
  const mindMapContainerRef = useRef<HTMLDivElement>(null);
  const mindMapInstanceRef = useRef<any>(null);
  const { activeNote, activeNoteData, saveCurrentNote } = useAppContext();
  const [toolbarVisible, setToolbarVisible] = useState(true);

  // 创建或更新思维导图实例
  useEffect(() => {
    // 如果没有活动笔记或容器未准备好，则不创建实例
    if (!mindMapContainerRef.current) return;

    // 如果没有活动笔记，则显示欢迎信息
    if (!activeNoteData) {
      if (mindMapInstanceRef.current) {
        // 清除上一个实例
        mindMapInstanceRef.current.destroy();
        mindMapInstanceRef.current = null;
      }
      return;
    }

    // 如果已有实例，则更新数据
    if (mindMapInstanceRef.current) {
      try {
        mindMapInstanceRef.current.setData(activeNoteData.data);
        return;
      } catch (error) {
        console.error('更新思维导图失败，重新创建实例', error);
        mindMapInstanceRef.current.destroy();
        mindMapInstanceRef.current = null;
      }
    }

    // 创建新实例
    try {
      // @ts-ignore 忽略TypeScript对MindMap构造函数参数的类型检查
      mindMapInstanceRef.current = new MindMap({
        el: mindMapContainerRef.current,
        data: activeNoteData.data,
        theme: activeNoteData.theme || 'default',
        contextMenu: true,
        toolBar: toolbarVisible,
        nodeTextEdit: true,
        exportPen: true,
        width: window.innerWidth - 280, // 减去侧边栏宽度
        height: window.innerHeight - 60, // 减去顶部标题栏高度
        keypress: true // 第三方库特有的选项
      });

      // 监听数据变化，自动保存
      mindMapInstanceRef.current.on('data_change', debounce(() => {
        if (activeNoteData) {
          const data = mindMapInstanceRef.current.getData();
          saveCurrentNote({
            ...activeNoteData,
            data
          });
        }
      }, 2000)); // 2秒内无更改才保存

      // 监听编辑节点事件
      mindMapInstanceRef.current.on('node_click', (node: any) => {
        console.log('点击了节点:', node);
      });

    } catch (error) {
      console.error('创建思维导图实例失败:', error);
    }

    // 清理函数
    return () => {
      if (mindMapInstanceRef.current) {
        mindMapInstanceRef.current.destroy();
        mindMapInstanceRef.current = null;
      }
    };
  }, [activeNoteData, toolbarVisible, saveCurrentNote]);

  // 防抖函数
  function debounce(fn: Function, delay: number) {
    let timer: number | null = null;
    return function(this: any, ...args: any[]) {
      if (timer) clearTimeout(timer);
      timer = window.setTimeout(() => {
        fn.apply(this, args);
      }, delay);
    };
  }

  // 处理窗口大小变化
  useEffect(() => {
    const handleResize = () => {
      if (mindMapInstanceRef.current) {
        mindMapInstanceRef.current.resize(
          window.innerWidth - 280, 
          window.innerHeight - 60  // 减去顶部标题栏高度
        );
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // 切换工具栏显示
  const toggleToolbar = () => {
    setToolbarVisible(!toolbarVisible);
  };

  return (
    <div className="mindmap-editor">
      {!activeNote ? (
        <div className="mindmap-welcome">
          <h2>欢迎使用脑图笔记本</h2>
          <p>从侧边栏选择一个笔记或创建新笔记开始</p>
        </div>
      ) : (
        <>
          <div className="mindmap-toolbar">
            <button onClick={toggleToolbar}>
              {toolbarVisible ? '隐藏工具栏' : '显示工具栏'}
            </button>
          </div>
          <div className="mindmap-container" ref={mindMapContainerRef}></div>
        </>
      )}
    </div>
  );
};

export default MindMapEditor;