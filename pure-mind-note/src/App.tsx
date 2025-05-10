import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import MindMapEditor from './components/MindMapEditor';
import JsonViewer from './components/JsonViewer';
import TodoView from './components/TodoView';
import QuestionView from './components/QuestionView';
import ProjectView from './components/ProjectView';
import Settings from './components/Settings';
import ViewSelector, { ViewType } from './components/ViewSelector';
import { AppProvider, useAppContext } from './context/AppContext';
import WorkspaceInitializer from './components/WorkspaceInitializer';
import './App.css'; // 我们创建这个CSS文件来定义整体布局

// 主应用内容组件
const AppContent: React.FC = () => {
  const [showSettings, setShowSettings] = useState(false);
  const [isWorkspaceReady, setIsWorkspaceReady] = useState(false);
  const [currentView, setCurrentView] = useState<ViewType>(ViewType.MINDMAP);
  const { activeNoteData, setActiveNoteData } = useAppContext();

  // 处理视图切换
  const handleViewChange = (view: ViewType) => {
    setCurrentView(view);
  };

  // 处理 TODO 状态变更
  const handleTodoStatusChange = (nodeId: string, completed: boolean) => {
    if (activeNoteData) {
      const updatedData = { ...activeNoteData };
      if (updatedData.data[nodeId]) {
        updatedData.data[nodeId].data.completed = completed;
        setActiveNoteData(updatedData);
      }
    }
  };

  // 根据当前视图渲染不同的内容
  const renderContent = () => {
    switch (currentView) {
      case ViewType.JSON:
        return <JsonViewer data={activeNoteData} />;
      case ViewType.TODO:
        return <TodoView data={activeNoteData} onTodoStatusChange={handleTodoStatusChange} />;
      case ViewType.QUESTION:
        return <QuestionView data={activeNoteData} />;
      case ViewType.PROJECT:
        return <ProjectView data={activeNoteData} />;
      case ViewType.MINDMAP:
      default:
        return <MindMapEditor />;
    }
  };

  return (
    <div className="app-container">
      {/* 工作区初始化组件 */}
      <WorkspaceInitializer 
        onInitialized={() => setIsWorkspaceReady(true)}
        onError={(err) => console.error('工作区初始化错误:', err)}
      />
      
      <Sidebar />
      <div className="main-content">
        <div className="app-header">
          <h1>脑图笔记本</h1>
          <div className="app-header-right">
            <ViewSelector 
              currentView={currentView} 
              onViewChange={handleViewChange} 
            />
            <button 
              className="settings-button" 
              onClick={() => setShowSettings(true)}
              title="应用设置"
            >
              <span className="icon">⚙️</span>
            </button>
          </div>
        </div>
        {renderContent()}
      </div>
      
      {/* 全局设置 */}
      <Settings 
        isVisible={showSettings} 
        onClose={() => setShowSettings(false)} 
      />
    </div>
  );
};

// 主应用组件
function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
