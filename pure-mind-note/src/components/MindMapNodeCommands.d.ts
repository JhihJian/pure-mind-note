import React from 'react';
interface Props {
    mindMapInstanceRef: React.RefObject<any>;
    withViewStatePreservation: (cb: (...args: any[]) => any) => (...args: any[]) => void;
    showFeedback: (message: string, isError?: boolean) => void;
    children: (ops: {
        activeNodes: any[];
        addGeneralization: () => void;
        createAssociativeLine: () => void;
        setNodeIcon: (iconList: string[]) => void;
    }) => React.ReactNode;
}
declare const MindMapNodeCommands: React.FC<Props>;
export default MindMapNodeCommands;
