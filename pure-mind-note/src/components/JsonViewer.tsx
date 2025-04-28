import React from 'react';
import { MindMapData } from '../types';
import './JsonViewer.css';

// 组件属性类型
interface JsonViewerProps {
  data: MindMapData | null;
}

// JSON视图组件
const JsonViewer: React.FC<JsonViewerProps> = ({ data }) => {
  if (!data) {
    return (
      <div className="json-viewer-empty">
        <h2>暂无数据</h2>
        <p>请从侧边栏选择一个笔记</p>
      </div>
    );
  }

  return (
    <div className="json-viewer">
      <div className="json-editor">
        <pre className="json-content">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default JsonViewer; 