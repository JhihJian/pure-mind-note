import React, { useState, useEffect } from 'react';

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

const MindMapNodeCommands: React.FC<Props> = ({ mindMapInstanceRef, withViewStatePreservation, showFeedback, children }) => {
  const [activeNodes, setActiveNodes] = useState<any[]>([]);

  useEffect(() => {
    const instance = mindMapInstanceRef.current;
    if (!instance) return;
    const handleNodeActive = (_node: any, nodeList: any[]) => {
      setActiveNodes(nodeList);
    };
    instance.on('node_active', handleNodeActive);
    return () => {
      instance.off('node_active', handleNodeActive);
    };
  }, [mindMapInstanceRef]);

  const addGeneralization = withViewStatePreservation(() => {
    if (mindMapInstanceRef.current && activeNodes.length > 0) {
      mindMapInstanceRef.current.execCommand('ADD_GENERALIZATION', { text: '概要' });
    }
  });

  const createAssociativeLine = withViewStatePreservation(() => {
    if (mindMapInstanceRef.current && activeNodes.length > 0 && mindMapInstanceRef.current.associativeLine) {
      mindMapInstanceRef.current.associativeLine.createLineFromActiveNode();
    } else {
      showFeedback('关联线插件未启用或没有选中节点', true);
    }
  });

  const setNodeIcon = withViewStatePreservation((iconList: string[]) => {
    activeNodes.forEach(node => node.setIcon(iconList));
  });

  return <>{children({ activeNodes, addGeneralization, createAssociativeLine, setNodeIcon })}</>;
};

export default MindMapNodeCommands; 