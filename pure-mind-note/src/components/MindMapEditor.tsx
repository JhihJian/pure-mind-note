// src/components/MindMapEditor.tsx
import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import MindMap from 'simple-mind-map';
import { useAppContext } from '../context/AppContext';
import { NodeTag, NODE_TAG_COLORS } from '../types';
import { NodeTagDisplay } from './NodeTagSelector';
import MindMapToolbar from './MindMapToolbar';
import MindMapNodeModals, { MindMapNodeModalsHandles } from './MindMapNodeModals';
import { TagDeletePlugin } from '../plugins';
import './MindMapEditor.css';
import Drag from 'simple-mind-map/src/plugins/Drag.js'

MindMap.usePlugin(Drag)

// 常量定义
const SIDEBAR_WIDTH = 280; // 侧边栏宽度
const HEADER_HEIGHT = 60; // 头部高度

// 为全局对象添加类型声明
declare global {
  interface Window {
    PureMindNote?: {
      getCurrentNoteData?: () => any;
      saveCurrentNote?: (data: any) => void;
      [key: string]: any;
    };
    _mindMap?: any; // 添加全局mindMap实例引用
  }
}

// 状态反馈组件
interface StatusBarProps {
  isLoading: boolean;
  errorMessage: string | null;
  saveMessage: string | null;
}

const StatusBar: React.FC<StatusBarProps> = ({ isLoading, errorMessage, saveMessage }) => {
  return (
    <div className="status-bar">
      {isLoading && <div className="loading-indicator">正在加载...</div>}
      {errorMessage && <div className="error-message">{errorMessage}</div>}
      {saveMessage && <div className="save-message">{saveMessage}</div>}
    </div>
  );
};

const MindMapEditor: React.FC = () => {
  const mindMapContainerRef = useRef<HTMLDivElement>(null);
  const mindMapInstanceRef = useRef<any>(null);
  const nodeModalsRef = useRef<MindMapNodeModalsHandles>(null);
  const { activeNote, activeNoteData, saveCurrentNote } = useAppContext();
  const lastSavedDataRef = useRef<any>(null);
  const isSavingRef = useRef<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const prevFileNameRef = useRef<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // 工具栏状态
  const [toolbarVisible, setToolbarVisible] = useState(true);
  const [activeNodesState, setActiveNodesState] = useState<any[]>([]);
  
  // 使用 useMemo 缓存 activeNote，避免不必要的更新
  const memoizedActiveNote = useMemo(() => activeNote, [
    activeNote?.id
  ]);
  
  // 显示用户反馈消息
  const showFeedback = (message: string, isError = false) => {
    if (isError) {
      setErrorMessage(message);
      setTimeout(() => setErrorMessage(null), 3000);
    } else {
      setSaveMessage(message);
      setTimeout(() => setSaveMessage(null), 2000);
    }
  };

  // 保存数据的函数
  const saveData = useCallback(() => {
    const currentData = mindMapInstanceRef.current.getData();
    //直接使用从useAppContext获取的保存函数
    if (activeNoteData) {
      saveCurrentNote({
        ...activeNoteData,
        data: currentData
      });
      showFeedback('保存成功');
    }
  }, [activeNoteData, saveCurrentNote, showFeedback]); 

  // 创建思维导图实例
  const createMindMapInstance = useCallback(() => {
    if (!mindMapContainerRef.current || !activeNoteData) return false;
    
    try {
      // 自定义节点渲染函数，用于支持显示标签
      const customRender = {
        beforeRender(
          node: any, 
          { 
            ctx, 
            data, 
            bBoxes 
          }: { 
            ctx: CanvasRenderingContext2D; 
            data: any; 
            bBoxes: { inside: { width: number; height: number } } 
          }
        ) {
          try {
            // 尝试直接从节点实例获取数据
            let targetData = data;
            // 检查节点实例上是否有_nodeData属性
            if (node && node._nodeData && node._nodeData.data) {
              targetData = node._nodeData.data;
              console.log('从节点实例获取数据:', JSON.stringify(targetData, null, 2));
            }
            
            // 递归函数，用于深度查找标签数据
            const findTags = (obj: any): NodeTag[] | null => {
              if (!obj) return null;
              
              // 根据文档，优先检查tag属性而不是tags
              if (obj.tag) {
                const tagData = obj.tag;
                if (Array.isArray(tagData)) {
                  console.log('找到tag数组:', tagData);
                  return tagData;
                }
                if (typeof tagData === 'string') {
                  console.log('找到单个tag:', tagData);
                  return [tagData as NodeTag];
                }
              }
              
              // 兼容性检查tags属性
              if (obj.tags && Array.isArray(obj.tags)) {
                console.log('找到tags数组:', obj.tags);
                return obj.tags;
              }
              
              // 检查嵌套的data对象
              if (obj.data) {
                const tagsInData = findTags(obj.data);
                if (tagsInData) return tagsInData;
              }
              
              return null;
            };
            
            // 查找标签数据
            const tags = findTags(targetData);
            
            // 如果有有效的标签数组，则渲染标签指示器
            if (tags && Array.isArray(tags) && tags.length > 0) {
              console.log('准备渲染标签指示点:', tags);
              const { width, height } = bBoxes.inside;
              const x = -width / 2;
              const y = -height / 2 - 6; // 放在节点上方
              
              // 渲染标签指示点
              tags.forEach((tag: any, index: number) => {
                const offsetX = index * 10 - ((tags?.length || 0) - 1) * 5;
                
                // 判断tag是否为有效的NodeTag
                let tagValue: string;
                if (typeof tag === 'string') {
                  tagValue = tag;
                } else if (tag && typeof tag === 'object' && 'value' in tag) {
                  tagValue = tag.value;
                } else {
                  tagValue = String(tag);
                }
                
                // 检查tagValue是否存在于NodeTag枚举中
                if (Object.values(NodeTag).includes(tagValue as NodeTag)) {
                  console.log('渲染标签:', tagValue, '颜色:', NODE_TAG_COLORS[tagValue as NodeTag]);
                  
                  ctx.fillStyle = NODE_TAG_COLORS[tagValue as NodeTag];
                  ctx.beginPath();
                  ctx.arc(offsetX, y, 4, 0, Math.PI * 2);
                  ctx.fill();
                  
                  // 添加白色边框
                  ctx.strokeStyle = 'white';
                  ctx.lineWidth = 1;
                  ctx.stroke();
                } else {
                  console.warn('无效的标签值:', tagValue);
                }
              });
            }
            
            return false; // 不阻止默认渲染
          } catch (error) {
            console.error('自定义渲染标签出错:', error);
            return false;
          }
        }
      };
      
      const options = {
        el: mindMapContainerRef.current,
        data: activeNoteData.data,
        theme: activeNoteData.theme || 'default',
        keypress: true,
        contextMenu: true,
        nodeTextEdit: true,
        customRender
      };
      
      console.log('创建脑图实例');
      // 创建实例
      // @ts-ignore
      mindMapInstanceRef.current = new MindMap(options);
      
      // 保存对实例的全局引用，方便标签更新后触发重新渲染
      if (typeof window !== 'undefined') {
        window._mindMap = mindMapInstanceRef.current;
      }

      // 注册标签删除插件
      if (mindMapInstanceRef.current) {
        try {
          mindMapInstanceRef.current.addPlugin(TagDeletePlugin);
          console.log('标签删除插件注册成功');
        } catch (e) {
          console.error('标签删除插件注册失败:', e);
        }
      }

      // 初始化上次保存的数据
      lastSavedDataRef.current = JSON.parse(JSON.stringify(activeNoteData.data));
      
      // 添加事件监听器
      mindMapInstanceRef.current.on('data_change', () => {
        // 在数据变化时触发保存
        saveData();
        
        // 强制重新渲染一次 - 解决标签不立即显示的问题
        setTimeout(() => {
          if (mindMapInstanceRef.current) {
            try {
              console.log('数据变化，触发重新渲染');
              mindMapInstanceRef.current.render();
            } catch (e) {
              console.error('重新渲染失败:', e);
            }
          }
        }, 100);
      });
      
      // 添加节点选择事件监听
      try {
        const instance = mindMapInstanceRef.current;
        
        const handleNodeActive = (node: any, nodes: any[]) => {
          console.log('节点被选中', nodes ? nodes.length : 0);
          if (Array.isArray(nodes)) {
            setActiveNodesState(nodes);
          } else if (node) {
            setActiveNodesState([node]);
          }
        };
        
        // 尝试不同的事件绑定方式
        if (typeof instance.on === 'function') {
          instance.on('node_active', handleNodeActive);
        } else if (instance.mindMap && typeof instance.mindMap.on === 'function') {
          instance.mindMap.on('node_active', handleNodeActive);
        } else if (instance.events && typeof instance.events.on === 'function') {
          instance.events.on('node_active', handleNodeActive);
        } else {
          console.warn('无法找到合适的事件绑定方法');
        }
      } catch (error) {
        console.error('注册节点选择事件失败', error);
      }
      
      // 添加初始激活节点的逻辑
      setTimeout(() => {
        try {
          const instance = mindMapInstanceRef.current;
          if (!instance) return;
          
          const root = instance.renderer?.root || instance.mindMap?.renderer?.root || instance.root;
          if (root) {
            console.log('尝试激活根节点');
            
            // 使用与forceSelectNode相同的API调用方式
            try {
              if (typeof instance.renderer?.clearAllActive === 'function') {
                instance.renderer.clearAllActive();
              } else if (typeof instance.mindMap?.renderer?.clearAllActive === 'function') {
                instance.mindMap.renderer.clearAllActive();
              } else if (typeof instance.clearAllActive === 'function') {
                instance.clearAllActive();
              }
              
              if (typeof instance.renderer?.setNodeActive === 'function') {
                instance.renderer.setNodeActive(root);
              } else if (typeof instance.mindMap?.renderer?.setNodeActive === 'function') {
                instance.mindMap.renderer.setNodeActive(root);
              } else if (typeof instance.setNodeActive === 'function') {
                instance.setNodeActive(root);
              } else if (typeof instance.selectNode === 'function') {
                instance.selectNode(root);
              }
              
              // 手动更新activeNodesState
              setActiveNodesState([root]);
            } catch (e) {
              console.error('尝试调用节点选择API失败', e);
            }
          }
        } catch (error) {
          console.error('初始激活节点失败:', error);
        }
      }, 500);
      
      return true;
    } catch (error) {
      console.error('创建思维导图实例失败:', error);
      showFeedback('创建思维导图实例失败', true);
      return false;
    }
  }, [activeNoteData, saveData]);

  // 获取当前打开的文件名
  const getCurrentFileName = useCallback(() => {
    if (!activeNoteData) return null;
    // @ts-ignore
    return activeNoteData.filename || activeNoteData.name || activeNoteData.title || activeNoteData.id || null;
  }, [activeNoteData]);

  // 添加一个简单的延迟执行函数
  const delayForceNodeSelection = useCallback(() => {
    // 延迟一下，确保实例完全初始化
    setTimeout(() => {
      if (mindMapInstanceRef.current) {
        console.log('延迟执行节点选择');
        // 这里不能直接调用forceSelectNode，因为它还未定义
        
        try {
          const instance = mindMapInstanceRef.current;
          const root = instance.renderer?.root || instance.mindMap?.renderer?.root || instance.root;
          
          if (root) {
            console.log('延迟激活根节点', root);
            
            // 尝试不同的API调用方式
            if (typeof instance.renderer?.clearAllActive === 'function') {
              instance.renderer.clearAllActive();
            } else if (typeof instance.mindMap?.renderer?.clearAllActive === 'function') {
              instance.mindMap.renderer.clearAllActive();
            } else if (typeof instance.clearAllActive === 'function') {
              instance.clearAllActive();
            }
            
            if (typeof instance.renderer?.setNodeActive === 'function') {
              instance.renderer.setNodeActive(root);
            } else if (typeof instance.mindMap?.renderer?.setNodeActive === 'function') {
              instance.mindMap.renderer.setNodeActive(root);
            } else if (typeof instance.setNodeActive === 'function') {
              instance.setNodeActive(root);
            } else if (typeof instance.selectNode === 'function') {
              instance.selectNode(root);
            }
            
            // 手动更新activeNodesState
            setActiveNodesState([root]);
          }
        } catch (error) {
          console.error('延迟节点选择失败:', error);
        }
      }
    }, 800);
  }, []);
  
  // 处理首次加载
  useEffect(() => {
    // 如果已经初始化过，不再重复初始化
    if (isInitialized) return;
    
    // 检查是否有数据可以初始化
    if (activeNoteData && mindMapContainerRef.current && !mindMapInstanceRef.current) {
      setIsLoading(true);
      
      // 创建实例
      const success = createMindMapInstance();
      console.log('思维导图实例创建结果:', success);
      
      // 标记为已初始化
      setIsInitialized(true);
      setIsLoading(false);
      
      // 记录当前文件名
      prevFileNameRef.current = getCurrentFileName();

      // 延迟执行节点选择
      delayForceNodeSelection();
    }
  }, [activeNoteData, createMindMapInstance, isInitialized, getCurrentFileName, delayForceNodeSelection]);

  // 监听文件变化，在需要时创建或销毁实例
  useEffect(() => {
    // 如果没有容器，则不创建实例
    if (!mindMapContainerRef.current) return;
    
    const currentFileName = getCurrentFileName();
    const previousFileName = prevFileNameRef.current;
    
    // 更新之前的文件名
    prevFileNameRef.current = currentFileName;
    
    // 只有在文件名变化时才需要销毁和创建实例
    if (currentFileName === previousFileName && mindMapInstanceRef.current) {
      return;
    }
    
    // 标记为加载中
    setIsLoading(true);
    
    // 如果已有实例，则先销毁
    if (mindMapInstanceRef.current) {
      try {
        // 移除事件监听器
        mindMapInstanceRef.current.off('data_change');
        
        // 销毁实例
        mindMapInstanceRef.current.destroy();
      } catch (error) {
        console.error('销毁思维导图实例失败:', error);
      }
      
      // 清空引用
      mindMapInstanceRef.current = null;
    }
    
    // 如果没有活动笔记，则不创建新实例
    if (!activeNoteData) {
      setIsLoading(false);
      return;
    }
    
    // 创建新实例
    createMindMapInstance();
    setIsLoading(false);
    
  }, [
    // @ts-ignore
    activeNoteData?.filename, 
    // @ts-ignore
    activeNoteData?.name, 
    // @ts-ignore
    activeNoteData?.title, 
    activeNoteData?.id, 
    createMindMapInstance, 
    getCurrentFileName
  ]);

  // 清理副作用
  useEffect(() => {
    return () => {
      if (mindMapInstanceRef.current) {
        try {
          // 移除事件监听器
          mindMapInstanceRef.current.off('data_change');
          
          // 销毁实例
          mindMapInstanceRef.current.destroy();
          mindMapInstanceRef.current = null;
        } catch (error) {
          console.error('清理思维导图实例失败:', error);
        }
      }
    };
  }, []);

  
  // 日志输出，帮助调试
  useEffect(() => {
    console.log('脑图实例状态:', {
      hasInstance: !!mindMapInstanceRef.current,
      hasContainer: !!mindMapContainerRef.current,
      activeNoteId: memoizedActiveNote?.id,
      currentFileName: getCurrentFileName(),
      prevFileName: prevFileNameRef.current,
      isInitialized,
      hasData: !!activeNoteData,
      memoizedActiveNoteId: memoizedActiveNote?.id
    });
  }, [memoizedActiveNote?.id, isInitialized, activeNoteData, getCurrentFileName]);

  // 添加窗口大小变化监听
  useEffect(() => {
    const handleResize = () => {
      if (mindMapInstanceRef.current) {
        mindMapInstanceRef.current.resize();
      }
    };

    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // 添加点击节点主动触发的函数
  const forceSelectNode = useCallback(() => {
    if (!mindMapInstanceRef.current) return;
    
    try {
      // 选择根节点 - 修复API调用
      const instance = mindMapInstanceRef.current;
      const root = instance.renderer?.root || instance.mindMap?.renderer?.root || instance.root;
      
      if (root) {
        console.log('主动激活根节点', root);
        
        // 尝试不同的API调用方式
        try {
          if (typeof instance.renderer?.clearAllActive === 'function') {
            instance.renderer.clearAllActive();
          } else if (typeof instance.mindMap?.renderer?.clearAllActive === 'function') {
            instance.mindMap.renderer.clearAllActive();
          } else if (typeof instance.clearAllActive === 'function') {
            instance.clearAllActive();
          }
          
          if (typeof instance.renderer?.setNodeActive === 'function') {
            instance.renderer.setNodeActive(root);
          } else if (typeof instance.mindMap?.renderer?.setNodeActive === 'function') {
            instance.mindMap.renderer.setNodeActive(root);
          } else if (typeof instance.setNodeActive === 'function') {
            instance.setNodeActive(root);
          } else if (typeof instance.selectNode === 'function') {
            instance.selectNode(root);
          }
        } catch (e) {
          console.error('尝试调用节点选择API失败', e);
        }
        
        // 手动更新activeNodesState
        setActiveNodesState([root]);
      } else {
        console.warn('找不到根节点');
      }
    } catch (error) {
      console.error('尝试选择节点失败:', error);
    }
  }, []);

  // 点击思维导图背景时激活节点的处理
  useEffect(() => {
    if (!mindMapContainerRef.current || !mindMapInstanceRef.current) return;
    
    const container = mindMapContainerRef.current;
    
    const handleClick = () => {
      // 如果当前没有选中的节点，尝试选中根节点
      if (activeNodesState.length === 0) {
        forceSelectNode();
      }
    };
    
    container.addEventListener('click', handleClick);
    
    return () => {
      container.removeEventListener('click', handleClick);
    };
  }, [activeNodesState, forceSelectNode]);

  // 初始化完成后自动选中根节点
  useEffect(() => {
    if (isInitialized && mindMapInstanceRef.current && activeNodesState.length === 0) {
      forceSelectNode();
    }
  }, [isInitialized, activeNodesState, forceSelectNode]);

  // 用于保持思维导图视图状态的包装函数
  const withViewStatePreservation = useCallback(
    (callback: any) => {
      return (...args: any[]) => {
        if (!mindMapInstanceRef.current) return;
        
        // 记录当前视图状态
        const { translateX, translateY, scale } = mindMapInstanceRef.current;
        
        // 执行操作
        callback(...args);
        
        // 恢复视图状态
        mindMapInstanceRef.current.translateX = translateX;
        mindMapInstanceRef.current.translateY = translateY;
        mindMapInstanceRef.current.scale = scale;
        
        // 更新渲染
        mindMapInstanceRef.current.render();
      };
    },
    []
  );

  // 节点操作函数
  const hasGeneralization = useMemo(() => {
    if (!activeNodesState || activeNodesState.length === 0) return false;
    
    return activeNodesState.some((node) => {
      try {
        const data = node?.getData?.()?.data;
        return data && data.generalization;
      } catch (e) {
        console.error('检查generalization属性出错', e);
        return false;
      }
    });
  }, [activeNodesState]);
  
  const hasRoot = useMemo(() => {
    if (!activeNodesState || activeNodesState.length === 0) return false;
    
    return activeNodesState.some((node) => {
      try {
        const data = node?.getData?.()?.data;
        return data && (data.isRoot || data.root);
      } catch (e) {
        console.error('检查isRoot属性出错', e);
        return false;
      }
    });
  }, [activeNodesState]);
  
  // 模态框操作
  const handleInsertImage = useCallback(() => {
    nodeModalsRef.current?.openImageModal();
  }, []);
  
  const handleInsertIcon = useCallback(() => {
    // 实现图标插入逻辑
  }, []);
  
  const handleInsertLink = useCallback(() => {
    nodeModalsRef.current?.openLinkModal();
  }, []);
  
  const handleInsertNote = useCallback(() => {
    nodeModalsRef.current?.openNoteModal();
  }, []);
  
  const handleInsertTag = useCallback(() => {
    console.log('尝试打开标签模态框', {
      hasInstance: !!mindMapInstanceRef.current, 
      activeNodes: activeNodesState?.length || 0,
      hasModalRef: !!nodeModalsRef.current
    });
    
    try {
      // 先检查模态框引用是否存在
      if (!nodeModalsRef.current) {
        console.error('模态框引用不存在');
        showFeedback('无法打开标签设置，请刷新页面重试', true);
        return;
      }
      
      // 检查是否有选中节点
      if (!activeNodesState || activeNodesState.length === 0) {
        // 如果没有选中节点，尝试自动选中根节点
        forceSelectNode();
        
        // 显示提示消息
        showFeedback('请先选择一个节点再设置标签', true);
        return;
      }
      
      // 如果有选中节点，直接打开标签模态框
      nodeModalsRef.current.openTagModal();
      
    } catch (error) {
      console.error('打开标签模态框失败:', error);
      showFeedback('打开标签模态框失败', true);
    }
  }, [activeNodesState, forceSelectNode, showFeedback]);



  const handleAddGeneralization = useCallback(() => {
    withViewStatePreservation(() => {
      if (mindMapInstanceRef.current && activeNodesState.length > 0) {
        mindMapInstanceRef.current.execCommand('ADD_GENERALIZATION', { text: '概要' });
      }
    })();
  }, [withViewStatePreservation, activeNodesState]);
  
  const handleCreateAssociativeLine = useCallback(() => {
    withViewStatePreservation(() => {
      if (mindMapInstanceRef.current && 
          activeNodesState.length > 0 && 
          mindMapInstanceRef.current.associativeLine) {
        mindMapInstanceRef.current.associativeLine.createLineFromActiveNode();
      } else {
        showFeedback('关联线插件未启用或没有选中节点', true);
      }
    })();
  }, [withViewStatePreservation, activeNodesState, showFeedback]);

  return (
    <div className="mindmap-editor">
      {/* 状态反馈区域 - 现在总是显示 */}
      <StatusBar 
        isLoading={isLoading}
        errorMessage={errorMessage}
        saveMessage={saveMessage}
      />
      
      {!memoizedActiveNote ? (
        <div className="mindmap-welcome">
          <h2>欢迎使用脑图笔记本</h2>
          <p>从侧边栏选择一个笔记或创建新笔记开始</p>
        </div>
      ) : (
        <>
          {/* 工具栏 - 始终显示，不依赖于activeNodesState */}
          <div className="toolbar-container">
            <MindMapToolbar
              toolbarVisible={toolbarVisible}
              toggleToolbar={() => setToolbarVisible(!toolbarVisible)}
              activeNodes={activeNodesState}
              hasGeneralization={hasGeneralization}
              hasRoot={hasRoot}
              onInsertImage={handleInsertImage}
              onInsertIcon={handleInsertIcon}
              onInsertLink={handleInsertLink}
              onInsertNote={handleInsertNote}
              onInsertTag={handleInsertTag}
              onAddGeneralization={handleAddGeneralization}
              onCreateAssociativeLine={handleCreateAssociativeLine}
            />
          </div>
          
          {/* 思维导图容器 */}
          <div 
            className="mindmap-container" 
            ref={mindMapContainerRef}
            style={{ width: '100%', height: 'calc(100vh - 120px)' }}
          ></div>
          
          {/* 节点模态框 */}
          <MindMapNodeModals
            ref={nodeModalsRef}
            activeNodes={activeNodesState}
            withViewStatePreservation={withViewStatePreservation}
            showFeedback={showFeedback}
          />
        </>
      )}
    </div>
  );
};

// 为应用程序提供全局访问点
if (typeof window !== 'undefined') {
  window.PureMindNote = window.PureMindNote || {};
}

export default MindMapEditor;