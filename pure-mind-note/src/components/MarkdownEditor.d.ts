import React from 'react';
import { MarkdownNotebook } from '../types';
import './MarkdownEditor.css';
interface MarkdownEditorProps {
    notebook: MarkdownNotebook;
    onSave: (content: string) => void;
}
declare const MarkdownEditor: React.FC<MarkdownEditorProps>;
export default MarkdownEditor;
