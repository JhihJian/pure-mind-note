// src/components/MindMapEditor.tsx
import React, { useRef, useEffect } from 'react';
import './MindMapEditor.css'; // 我们稍后创建这个CSS文件

interface MindMapEditorProps {
  // 未来会在这里定义接收当前笔记数据的props
  // 例如: noteData: any | null;
}

const MindMapEditor: React.FC<MindMapEditorProps> = () => {
  // useRef 用于获取 DOM 元素的引用，这是集成第三方库（需要DOM元素）的常见方式
  const mindMapContainerRef = useRef<HTMLDivElement>(null);

  // useEffect 用于在组件挂载后执行副作用，这里是初始化思维导图库的地方
  useEffect(() => {
    // 这里将来会初始化 mind-map 库
    console.log('MindMapEditor mounted. Container ref:', mindMapContainerRef.current);

    // TODO: 在下一步在这里初始化 mind-map 实例

    // TODO: 返回一个清理函数，在组件卸载时销毁 mind-map 实例

  }, []); // 依赖数组为空，表示只在组件挂载和卸载时运行

  return (
    <div className="mindmap-editor" ref={mindMapContainerRef}>
      {/* 这个 div 将作为思维导图的容器 */}
      <h2>思维导图编辑器</h2>
      <p>思维导图将渲染在这里。</p>
      {/* mind-map 库会直接在这个 div 内部操作 DOM */}
    </div>
  );
};

export default MindMapEditor;