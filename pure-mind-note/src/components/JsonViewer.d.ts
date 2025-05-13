import React from 'react';
import { MindMapData } from '../types';
import './JsonViewer.css';
interface JsonViewerProps {
    data: MindMapData | null;
}
declare const JsonViewer: React.FC<JsonViewerProps>;
export default JsonViewer;
