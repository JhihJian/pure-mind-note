import React from 'react';
import { NotebookType } from '../types';
import './NotebookTypeSelector.css';

interface NotebookTypeSelectorProps {
  selectedType: NotebookType;
  onChange: (type: NotebookType) => void;
}

const NotebookTypeSelector: React.FC<NotebookTypeSelectorProps> = ({ selectedType, onChange }) => {
  return (
    <div className="notebook-type-selector">
      <select
        value={selectedType}
        onChange={(e) => onChange(e.target.value as NotebookType)}
      >
        <option value={NotebookType.MINDMAP}>脑图</option>
        <option value={NotebookType.MARKDOWN}>Md</option>
      </select>
    </div>
  );
};

export default NotebookTypeSelector; 