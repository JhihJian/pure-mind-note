import React from 'react';
import { NodeTag, NODE_TAG_LABELS, NODE_TAG_COLORS } from '../types';
import './NodeTagSelector.css';

interface NodeTagSelectorProps {
  selectedTags: NodeTag[];
  onChange: (tags: NodeTag[]) => void;
  readOnly?: boolean;
}

const NodeTagSelector: React.FC<NodeTagSelectorProps> = ({ 
  selectedTags, 
  onChange,
  readOnly = false
}) => {
  // 切换标签选择状态
  const toggleTag = (tag: NodeTag) => {
    if (readOnly) return;
    
    if (selectedTags.includes(tag)) {
      // 如果已选择，则移除
      onChange(selectedTags.filter(t => t !== tag));
    } else {
      // 如果未选择，则添加
      onChange([...selectedTags, tag]);
    }
  };

  // 清除所有标签
  const clearAllTags = () => {
    if (readOnly) return;
    onChange([]);
  };

  return (
    <div className="node-tag-selector">
      <div className="tag-actions">
        {selectedTags.length > 0 && (
          <button 
            className="clear-tags-btn" 
            onClick={clearAllTags}
            disabled={readOnly}
          >
            清除全部
          </button>
        )}
      </div>
      <div className="tag-list">
        {Object.values(NodeTag).map(tag => (
          <div 
            key={tag}
            className={`tag-item ${selectedTags.includes(tag) ? 'selected' : ''} ${readOnly ? 'read-only' : ''}`}
            style={{ 
              backgroundColor: selectedTags.includes(tag) ? NODE_TAG_COLORS[tag] : 'transparent',
              borderColor: NODE_TAG_COLORS[tag],
              color: selectedTags.includes(tag) ? '#fff' : NODE_TAG_COLORS[tag]
            }}
            onClick={() => toggleTag(tag)}
          >
            {NODE_TAG_LABELS[tag]}
          </div>
        ))}
      </div>
    </div>
  );
};

// 标签展示组件
export const NodeTagDisplay: React.FC<{ tags: NodeTag[] }> = ({ tags }) => {
  if (!tags || tags.length === 0) return null;
  
  return (
    <div className="node-tag-display">
      {tags.map(tag => (
        <span 
          key={tag} 
          className="tag-badge"
          style={{ backgroundColor: NODE_TAG_COLORS[tag] }}
        >
          {NODE_TAG_LABELS[tag]}
        </span>
      ))}
    </div>
  );
};

export default NodeTagSelector; 