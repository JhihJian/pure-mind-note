import React, { useState, useEffect } from 'react';
import { MarkdownNotebook } from '../types';
import './MarkdownEditor.css';

interface MarkdownEditorProps {
  notebook: MarkdownNotebook;
  onSave: (content: string) => void;
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  notebook,
  onSave
}) => {
  const [content, setContent] = useState(notebook.content);
  const [isPreview, setIsPreview] = useState(false);

  useEffect(() => {
    setContent(notebook.content);
  }, [notebook.id]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

  const handleSave = () => {
    onSave(content);
  };

  const renderPreview = () => {
    // 这里可以使用marked或其他markdown解析库
    return (
      <div className="markdown-preview">
        {content}
      </div>
    );
  };

  return (
    <div className="markdown-editor">
      <div className="editor-toolbar">
        <button 
          className={`toolbar-button ${!isPreview ? 'active' : ''}`}
          onClick={() => setIsPreview(false)}
        >
          编辑
        </button>
        <button 
          className={`toolbar-button ${isPreview ? 'active' : ''}`}
          onClick={() => setIsPreview(true)}
        >
          预览
        </button>
        <button 
          className="save-button"
          onClick={handleSave}
        >
          保存
        </button>
      </div>
      <div className="editor-content">
        {isPreview ? (
          renderPreview()
        ) : (
          <textarea
            value={content}
            onChange={handleContentChange}
            placeholder="在这里输入Markdown内容..."
          />
        )}
      </div>
    </div>
  );
};

export default MarkdownEditor; 