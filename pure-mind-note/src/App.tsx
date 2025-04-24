import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import MindMapEditor from './components/MindMapEditor';
import Settings from './components/Settings';
import { AppProvider } from './context/AppContext';
import './App.css'; // 我们创建这个CSS文件来定义整体布局

function App() {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <AppProvider>
      <div className="app-container">
        <Sidebar />
        <div className="main-content">
          <div className="app-header">
            <h1>脑图笔记本</h1>
            <button 
              className="settings-button" 
              onClick={() => setShowSettings(true)}
              title="应用设置"
            >
              <span className="icon">⚙️</span>
            </button>
          </div>
          <MindMapEditor />
        </div>
        
        {/* 全局设置 */}
        <Settings 
          isVisible={showSettings} 
          onClose={() => setShowSettings(false)} 
        />
      </div>
    </AppProvider>
  );
}

export default App;
