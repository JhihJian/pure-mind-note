import React from 'react';
import './Workspace.css';
interface WorkspaceProps {
    isVisible: boolean;
    onClose: () => void;
}
declare const Workspace: React.FC<WorkspaceProps>;
export default Workspace;
