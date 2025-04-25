import React from 'react';
import './MindMapEditor.css';
export interface MindMapNodeModalsHandles {
    openImageModal: () => void;
    openLinkModal: () => void;
    openNoteModal: () => void;
    openTagModal: () => void;
}
interface Props {
    activeNodes: any[];
    withViewStatePreservation: (cb: (...args: any[]) => any) => (...args: any[]) => void;
    showFeedback: (message: string, isError?: boolean) => void;
}
declare const MindMapNodeModals: React.ForwardRefExoticComponent<Props & React.RefAttributes<MindMapNodeModalsHandles>>;
export default MindMapNodeModals;
