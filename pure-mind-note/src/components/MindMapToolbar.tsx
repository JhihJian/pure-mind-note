import React from 'react';
import './MindMapEditor.css';

interface MindMapToolbarProps {
  toggleToolbar: () => void;
  toolbarVisible: boolean;
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
  toggleToolbar,
  toolbarVisible,
  activeNodes,
  hasGeneralization,
  hasRoot,
  onInsertImage,
  onInsertIcon,
  onInsertLink,
  onInsertNote,
  onInsertTag,
  onAddGeneralization,
  onCreateAssociativeLine
}) => {
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
      <div className="node-operations">
        {/* 标签按钮始终可用 */}
        <button 
          onClick={safeOnClick(onInsertTag)} 
          className="toolbar-button tag-button"
        >
          <span className="button-icon">🏷️</span> 设置标签
        </button>
        <button 
          onClick={safeOnClick(onInsertNote)} 
          disabled={!hasActiveNodes || hasGeneralization}
        >
          插入备注
        </button>
      </div>
    </div>
  );
};

export default MindMapToolbar; 