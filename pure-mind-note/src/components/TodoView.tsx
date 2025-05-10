import React, { useState, useEffect } from 'react';
import { MindMapData, NodeTag } from '../types';
import './TodoView.css';

interface TodoViewProps {
  data: MindMapData | null;
  onTodoStatusChange: (nodeId: string, completed: boolean) => void;
}

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  parentId: string;
}

const TodoView: React.FC<TodoViewProps> = ({ data, onTodoStatusChange }) => {
  const [todos, setTodos] = useState<TodoItem[]>([]);

  useEffect(() => {
    if (data && data.data) {
      const todoItems: TodoItem[] = [];
      
      // 递归处理节点及其子节点
      const processNode = (node: any, nodeId: string) => {
        // 检查当前节点是否有 tag 字段且包含 'todo'
        if (node?.data?.tag && Array.isArray(node.data.tag) && node.data.tag.includes('todo')) {
          // 检查是否同时具有"已完成"标签
          const isCompleted = node.data.tag.includes('已完成');
          todoItems.push({
            id: nodeId,
            text: node.data.text || '',
            completed: isCompleted,
            parentId: node.data.parentId || ''
          });
        }
        
        // 处理子节点
        if (node?.children && Array.isArray(node.children)) {
          node.children.forEach((child: any, index: number) => {
            processNode(child, `${nodeId}_${index}`);
          });
        }
      };

      // 处理根节点
      if (data.data.root) {
        processNode(data.data.root, 'root');
      }
      
      // 处理其他节点
      if (data.data.children && Array.isArray(data.data.children)) {
        data.data.children.forEach((child: any, index: number) => {
          processNode(child, `child_${index}`);
        });
      }

      setTodos(todoItems);
    } else {
      setTodos([]);
    }
  }, [data]);

  const handleTodoToggle = (nodeId: string, completed: boolean) => {
    // 更新脑图中的节点标签
    if (data && data.data) {
      const updateNodeTags = (node: any, targetId: string): boolean => {
        if (node?.data?.tag) {
          if (node.data.tag.includes('todo')) {
            if (completed) {
              // 如果标记为完成，添加"已完成"标签
              if (!node.data.tag.includes('已完成')) {
                node.data.tag.push('已完成');
              }
            } else {
              // 如果取消完成，移除"已完成"标签
              node.data.tag = node.data.tag.filter((tag: string) => tag !== '已完成');
            }
            return true;
          }
        }
        
        // 检查子节点
        if (node?.children && Array.isArray(node.children)) {
          for (const child of node.children) {
            if (updateNodeTags(child, targetId)) {
              return true;
            }
          }
        }
        
        return false;
      };

      // 更新根节点
      if (data.data.root) {
        updateNodeTags(data.data.root, nodeId);
      }
      
      // 更新其他节点
      if (data.data.children && Array.isArray(data.data.children)) {
        for (const child of data.data.children) {
          if (updateNodeTags(child, nodeId)) {
            break;
          }
        }
      }
    }

    // 调用父组件的状态更新函数
    onTodoStatusChange(nodeId, completed);
    
    // 更新本地状态
    setTodos(prevTodos =>
      prevTodos.map(todo =>
        todo.id === nodeId ? { ...todo, completed } : todo
      )
    );
  };

  return (
    <div className="todo-view">
      <h2>TODO 列表</h2>
      <div className="todo-list">
        {todos.map(todo => (
          <div key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
            <label className="todo-label">
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={(e) => handleTodoToggle(todo.id, e.target.checked)}
              />
              <span className="todo-text">{todo.text}</span>
            </label>
          </div>
        ))}
        {todos.length === 0 && (
          <div className="no-todos">暂无 TODO 项</div>
        )}
      </div>
    </div>
  );
};

export default TodoView; 