import React from 'react';
import './ViewSelector.css';

// 视图类型枚举
export enum ViewType {
  MINDMAP = 'mindmap',
  JSON = 'json',
  TODO = 'todo',
  QUESTION = 'question',
  PROJECT = 'project',
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
      <button
        className={`view-button ${currentView === ViewType.TODO ? 'active' : ''}`}
        onClick={() => onViewChange(ViewType.TODO)}
        title="TODO视图"
      >
        <span className="icon">✅</span>
        <span className="text">TODO视图</span>
      </button>
      <button
        className={`view-button ${currentView === ViewType.QUESTION ? 'active' : ''}`}
        onClick={() => onViewChange(ViewType.QUESTION)}
        title="问题视图"
      >
        <span className="icon">❓</span>
        <span className="text">问题视图</span>
      </button>
      <button
        className={`view-button ${currentView === ViewType.PROJECT ? 'active' : ''}`}
        onClick={() => onViewChange(ViewType.PROJECT)}
        title="项目进展视图"
      >
        <span className="icon">📊</span>
        <span className="text">项目进展</span>
      </button>
    </div>
  );
};

export default ViewSelector; 