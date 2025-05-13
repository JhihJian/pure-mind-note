import React from 'react';
interface WorkspaceInitializerProps {
    onInitialized?: () => void;
    onError?: (error: any) => void;
}
declare const WorkspaceInitializer: React.FC<WorkspaceInitializerProps>;
export default WorkspaceInitializer;
