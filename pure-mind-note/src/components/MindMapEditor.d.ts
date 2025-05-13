import React from 'react';
import './MindMapEditor.css';
declare global {
    interface Window {
        PureMindNote?: {
            getCurrentNoteData?: () => any;
            saveCurrentNote?: (data: any) => void;
            [key: string]: any;
        };
        _mindMap?: any;
    }
}
declare const MindMapEditor: React.FC;
export default MindMapEditor;
