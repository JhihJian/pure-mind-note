import Sidebar from './components/Sidebar';
import MindMapEditor from './components/MindMapEditor';
import './App.css'; // 我们创建这个CSS文件来定义整体布局

function App() {
  // TODO: 未来在这里添加状态来管理当前打开的笔记数据和笔记列表

  return (
    <div className="app-container">
      <Sidebar />
      <MindMapEditor />
    </div>
  );
}

export default App;
