import React from 'react';
import './ViewSelector.css';

// 视图类型枚举
export enum ViewType {
  MINDMAP = 'mindmap',
  JSON = 'json',
  // 在此扩展其他视图类型
}

// 组件属性类型
interface ViewSelectorProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
}

// 视图选择器组件
const ViewSelector: React.FC<ViewSelectorProps> = ({ currentView, onViewChange }) => {
  return (
    <div className="view-selector">
      <button
        className={`view-button ${currentView === ViewType.MINDMAP ? 'active' : ''}`}
        onClick={() => onViewChange(ViewType.MINDMAP)}
        title="脑图视图"
      >
        <span className="icon">🔍</span>
        <span className="text">脑图视图</span>
      </button>
      <button
        className={`view-button ${currentView === ViewType.JSON ? 'active' : ''}`}
        onClick={() => onViewChange(ViewType.JSON)}
        title="JSON视图"
      >
        <span className="icon">📄</span>
        <span className="text">JSON视图</span>
      </button>
    </div>
  );
};

export default ViewSelector; 