import React from 'react';
import { MindMapData } from '../types';
import './TodoView.css';
interface TodoViewProps {
    data: MindMapData | null;
    onTodoStatusChange: (nodeId: string, completed: boolean) => void;
}
declare const TodoView: React.FC<TodoViewProps>;
export default TodoView;
