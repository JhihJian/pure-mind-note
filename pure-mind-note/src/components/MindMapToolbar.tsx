import React from 'react';
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
  return (
    <div className="mindmap-toolbar">
      <button onClick={toggleToolbar}>
        {toolbarVisible ? '隐藏工具栏' : '显示工具栏'}
      </button>
      {activeNodes.length > 0 && (
        <div className="node-operations">
          <button onClick={onInsertImage} disabled={hasGeneralization}>
            插入图片
          </button>
          <button onClick={onInsertIcon} disabled={hasGeneralization}>
            插入图标
          </button>
          <button onClick={onInsertLink} disabled={hasGeneralization}>
            插入超链接
          </button>
          <button onClick={onInsertNote} disabled={hasGeneralization}>
            插入备注
          </button>
          <button onClick={onInsertTag} disabled={hasGeneralization}>
            插入标签
          </button>
          <button onClick={onAddGeneralization} disabled={hasRoot || hasGeneralization}>
            添加概要
          </button>
          <button
            onClick={onCreateAssociativeLine}
            disabled={hasGeneralization || activeNodes.length === 0}
          >
            添加关联线
          </button>
        </div>
      )}
    </div>
  );
};

export default MindMapToolbar; 