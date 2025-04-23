import React from 'react';
import './Sidebar.css'; // 我们稍后创建这个CSS文件

interface SidebarProps {
  // 未来会在这里定义接收笔记列表的props
  // 例如: notesList: NoteCategory[];
}

const Sidebar: React.FC<SidebarProps> = () => {
  return (
    <div className="sidebar">
      <h2>笔记列表</h2>
      {/* 这里将来会渲染分类和笔记列表 */}
      <ul>
        <li>分类 A</li>
        <ul>
          <li>笔记 1</li>
          <li>笔记 2</li>
        </ul>
        <li>分类 B</li>
        <ul>
          <li>笔记 3</li>
        </ul>
        {/* ... 更多分类和笔记 */}
      </ul>
    </div>
  );
};

export default Sidebar;