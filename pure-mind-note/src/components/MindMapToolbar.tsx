import React, { useEffect } from 'react';
import './MindMapEditor.css';

interface MindMapToolbarProps {
  toolbarVisible: boolean;
  toggleToolbar: () => void;
  activeNodes: any[];
  hasGeneralization: boolean;
  hasRoot: boolean;
  onInsertImage: () => void;
  onInsertIcon: () => void;
  onInsertLink: () => void;
  onInsertNote: () => void;
  onInsertTag: () => void;
  onAddGeneralization: () => void;
  onCreateAssociativeLine: () => void;
}

const MindMapToolbar: React.FC<MindMapToolbarProps> = ({
  toolbarVisible,
  toggleToolbar,
  activeNodes,
  hasGeneralization,
  hasRoot,
  onInsertImage,
  onInsertIcon,
  onInsertLink,
  onInsertNote,
  onInsertTag,
  onAddGeneralization,
  onCreateAssociativeLine,
}) => {
  useEffect(() => {
    console.log('工具栏状态:', {
      toolbarVisible,
      activeNodesCount: activeNodes ? activeNodes.length : 0,
      hasGeneralization,
      hasRoot
    });
  }, [toolbarVisible, activeNodes, hasGeneralization, hasRoot]);

  // 安全的按钮点击处理函数
  const safeOnClick = (handler: () => void) => (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      handler();
    } catch (error) {
      console.error('按钮点击处理出错:', error);
    }
  };

  // 是否有选中节点的安全检查
  const hasActiveNodes = Array.isArray(activeNodes) && activeNodes.length > 0;

  return (
    <div className="mindmap-toolbar">
      <button onClick={toggleToolbar} className="toggle-button">
        {toolbarVisible ? '隐藏工具栏' : '显示工具栏'}
      </button>
      <div className="node-operations">
        {/* 标签按钮始终可用 */}
        <button 
          onClick={safeOnClick(onInsertTag)} 
          className="toolbar-button tag-button"
        >
          <span className="button-icon">🏷️</span> 设置标签
        </button>
        <button 
          onClick={safeOnClick(onInsertImage)} 
          disabled={!hasActiveNodes || hasGeneralization}
        >
          插入图片
        </button>
        <button 
          onClick={safeOnClick(onInsertIcon)} 
          disabled={!hasActiveNodes || hasGeneralization}
        >
          插入图标
        </button>
        <button 
          onClick={safeOnClick(onInsertLink)} 
          disabled={!hasActiveNodes || hasGeneralization}
        >
          插入超链接
        </button>
        <button 
          onClick={safeOnClick(onInsertNote)} 
          disabled={!hasActiveNodes || hasGeneralization}
        >
          插入备注
        </button>
        <button 
          onClick={safeOnClick(onAddGeneralization)} 
          disabled={!hasActiveNodes || hasRoot || hasGeneralization}
        >
          添加概要
        </button>
        <button
          onClick={safeOnClick(onCreateAssociativeLine)}
          disabled={!hasActiveNodes || hasGeneralization}
        >
          添加关联线
        </button>
      </div>
    </div>
  );
};

export default MindMapToolbar; 