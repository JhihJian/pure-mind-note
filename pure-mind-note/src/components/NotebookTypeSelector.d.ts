import React from 'react';
import { NotebookType } from '../types';
import './NotebookTypeSelector.css';
interface NotebookTypeSelectorProps {
    selectedType: NotebookType;
    onChange: (type: NotebookType) => void;
}
declare const NotebookTypeSelector: React.FC<NotebookTypeSelectorProps>;
export default NotebookTypeSelector;
