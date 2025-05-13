import React from 'react';
import './MindMapEditor.css';
interface MindMapToolbarProps {
    toggleToolbar: () => void;
    toolbarVisible: boolean;
    activeNodes: any[];
    hasGeneralization: boolean;
    hasRoot: boolean;
    onInsertImage: () => void;
    onInsertIcon: () => void;
    onInsertLink: () => void;
    onInsertNote: () => void;
    onInsertTag: () => void;
    onAddGeneralization: () => void;
    onCreateAssociativeLine: () => void;
}
declare const MindMapToolbar: React.FC<MindMapToolbarProps>;
export default MindMapToolbar;
