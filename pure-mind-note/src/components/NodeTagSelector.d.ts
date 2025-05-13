import React from 'react';
import { NodeTag } from '../types';
import './NodeTagSelector.css';
interface NodeTagSelectorProps {
    selectedTags: NodeTag[];
    onChange: (tags: NodeTag[]) => void;
    readOnly?: boolean;
}
declare const NodeTagSelector: React.FC<NodeTagSelectorProps>;
export declare const NodeTagDisplay: React.FC<{
    tags: NodeTag[];
}>;
export default NodeTagSelector;
