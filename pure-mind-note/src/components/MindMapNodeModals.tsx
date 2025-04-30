import React, { useState, forwardRef, useImperativeHandle, useEffect } from 'react';
import NodeTagSelector from './NodeTagSelector';
import { NodeTag } from '../types';
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

const MindMapNodeModals = forwardRef<MindMapNodeModalsHandles, Props>(
  ({ activeNodes, withViewStatePreservation, showFeedback }, ref) => {
    const [showImageModal, setShowImageModal] = useState(false);
    const [imageUrl, setImageUrl] = useState('https://example.com/image.jpg');
    const [imageTitle, setImageTitle] = useState('示例图片');
    const [imageWidth, setImageWidth] = useState(100);
    const [imageHeight, setImageHeight] = useState(100);
    
    const [showLinkModal, setShowLinkModal] = useState(false);
    const [linkUrl, setLinkUrl] = useState('https://example.com');
    const [linkTitle, setLinkTitle] = useState('示例链接');
    
    const [showNoteModal, setShowNoteModal] = useState(false);
    const [noteContent, setNoteContent] = useState('这是一个备注示例');
    
    const [showTagModal, setShowTagModal] = useState(false);
    const [selectedTags, setSelectedTags] = useState<NodeTag[]>([]);

    // 暴露 open 方法给父组件调用
    useImperativeHandle(ref, () => ({
      openImageModal: () => setShowImageModal(true),
      openLinkModal: () => setShowLinkModal(true),
      openNoteModal: () => setShowNoteModal(true),
      openTagModal: () => setShowTagModal(true),
    }));

    const openImageData = () => {
      if (activeNodes.length === 0) return;
      try {
        const node = activeNodes[0];
        const data = node.getData().data.image;
        if (data) {
          setImageUrl(data.url || 'https://example.com/image.jpg');
          setImageTitle(data.title || '');
          setImageWidth(data.width || 100);
          setImageHeight(data.height || 100);
        }
      } catch (e) {
        console.error('获取节点图片数据失败:', e);
      }
    };

    const handleImageSubmit = () => {
      withViewStatePreservation((url: string, title: string, width: number, height: number) => {
        activeNodes.forEach(node => node.setImage({ url, title, width, height }));
      })(imageUrl, imageTitle, imageWidth, imageHeight);
      setShowImageModal(false);
    };

    const openLinkData = () => {
      if (activeNodes.length === 0) return;
      try {
        const node = activeNodes[0];
        const data = node.getData().data.hyperlink;
        if (data) {
          setLinkUrl(data.url || 'https://example.com');
          setLinkTitle(data.title || '');
        }
      } catch (e) {
        console.error('获取节点超链接数据失败:', e);
      }
    };

    const handleLinkSubmit = () => {
      withViewStatePreservation((url: string, title: string) => {
        activeNodes.forEach(node => node.setHyperlink(url, title));
      })(linkUrl, linkTitle);
      setShowLinkModal(false);
    };

    const openNoteData = () => {
      if (activeNodes.length === 0) return;
      try {
        const node = activeNodes[0];
        const data = node.getData().data.note;
        setNoteContent(data || '');
      } catch (e) {
        console.error('获取节点备注数据失败:', e);
      }
    };

    const handleNoteSubmit = () => {
      withViewStatePreservation((note: string) => {
        activeNodes.forEach(node => node.setNote(note));
      })(noteContent);
      setShowNoteModal(false);
    };

    const openTagData = () => {
      if (!Array.isArray(activeNodes) || activeNodes.length === 0) {
        console.log('没有选中节点，无法获取标签数据');
        setSelectedTags([]);
        return;
      }

      try {
        const node = activeNodes[0];
        console.log('节点对象:', node);
        
        // 检查节点是否有效
        if (!node) {
          console.error('节点对象为空');
          setSelectedTags([]);
          return;
        }
        
        // 尝试各种可能的方法获取节点数据
        let nodeData;
        try {
          if (typeof node.getData === 'function') {
            nodeData = node.getData();
            console.log('使用getData()获取的节点数据:', nodeData);
          } else if (node.data) {
            nodeData = { data: node.data };
            console.log('直接从node.data获取节点数据');
          } else if (node._data) {
            nodeData = { data: node._data };
            console.log('从node._data获取节点数据');
          } else {
            nodeData = node;
            console.log('使用节点本身作为数据');
          }
        } catch (e) {
          console.error('获取节点数据方法失败:', e);
          nodeData = node; // 使用节点本身作为备选
        }
        
        console.log('处理的节点数据:', nodeData);
        
        // 尝试从不同位置找到标签数据
        let tags = [];
        if (nodeData?.data?.tags) {
          tags = nodeData.data.tags;
        } else if (nodeData?.tags) {
          tags = nodeData.tags;
        } else if (nodeData?.data?.tag) {
          const tagData = nodeData.data.tag;
          if (Array.isArray(tagData)) {
            tags = tagData;
          } else if (typeof tagData === 'string') {
            tags = [tagData];
          }
        } else if (nodeData?.tag) {
          const tagData = nodeData.tag;
          if (Array.isArray(tagData)) {
            tags = tagData;
          } else if (typeof tagData === 'string') {
            tags = [tagData];
          }
        }
        
        // 确保标签数据是一个数组且包含有效的NodeTag值
        if (Array.isArray(tags)) {
          console.log('找到节点标签:', tags);
          // 只保留有效的NodeTag值
          const validTags = tags.filter(tag => 
            typeof tag === 'string' && 
            Object.values(NodeTag).includes(tag as NodeTag)
          ) as NodeTag[];
          setSelectedTags(validTags);
        } else {
          console.log('节点没有有效标签');
          setSelectedTags([]);
        }
      } catch (e) {
        console.error('获取节点标签数据失败:', e);
        setSelectedTags([]);
      }
    };

    const handleTagSubmit = () => {
      withViewStatePreservation((tags: NodeTag[]) => {
        try {
          if (!Array.isArray(activeNodes) || activeNodes.length === 0) {
            showFeedback('没有选中的节点', true);
            return;
          }
          
          let updateSuccess = false;
          
          activeNodes.forEach(node => {
            try {
              console.log('准备更新节点标签:', node);
              console.log('设置的标签值:', tags);
              
              // 优先使用官方API setTag方法
              if (typeof node.setTag === 'function') {
                // 如果标签为空数组，则相当于清除标签
                if (tags.length === 0) {
                  node.setTag(null);
                  console.log('已清除节点标签');
                } else {
                  node.setTag(tags);
                  console.log('已使用官方setTag方法更新节点标签');
                }
                updateSuccess = true;
              }
              // 备选方法，按优先级排序
              else if (typeof node.setData === 'function' && typeof node.getData === 'function') {
                // 方法1: 使用getData/setData
                const nodeData = node.getData() || {};
                
                // 确保data对象存在
                if (!nodeData.data) {
                  nodeData.data = {};
                }
                
                // 根据文档，标签数据应该存储在tag属性而不是tags
                // 如果标签为空，则删除tag属性
                if (tags.length === 0) {
                  delete nodeData.data.tag;
                  console.log('已删除tag属性');
                } else {
                  nodeData.data.tag = tags;
                }
                
                // 设置回节点
                node.setData(nodeData);
                console.log('已使用setData方法更新节点标签:', nodeData);
                updateSuccess = true;
              } else if (typeof node.setNodeDataItem === 'function') {
                // 方法2: 使用setNodeDataItem
                if (tags.length === 0) {
                  node.setNodeDataItem('tag', null);
                  console.log('已清除tag属性');
                } else {
                  node.setNodeDataItem('tag', tags);
                  console.log('已使用setNodeDataItem方法更新节点标签');
                }
                updateSuccess = true;
              } else if (node.data && typeof node.update === 'function') {
                // 方法3: 直接修改data属性后调用update
                if (tags.length === 0) {
                  delete node.data.tag;
                  console.log('已删除data.tag属性');
                } else {
                  node.data.tag = tags;
                  console.log('已直接修改data.tag属性并调用update');
                }
                node.update();
                updateSuccess = true;
              } else if (node._data && typeof node.update === 'function') {
                // 方法4: 通过_data修改
                if (tags.length === 0) {
                  delete node._data.tag;
                  console.log('已删除_data.tag属性');
                } else {
                  node._data.tag = tags;
                  console.log('已通过_data.tag修改标签');
                }
                node.update();
                updateSuccess = true;
              } else if (node._nodeData && node._nodeData.data) {
                // 方法5: 修改_nodeData.data (针对simple-mind-map特定结构)
                if (!node._nodeData.data.data) {
                  node._nodeData.data.data = {};
                }
                
                if (tags.length === 0) {
                  delete node._nodeData.data.data.tag;
                  console.log('已删除_nodeData.data.data.tag属性');
                } else {
                  node._nodeData.data.data.tag = tags;
                  console.log('已更新_nodeData.data.data.tag:', node._nodeData.data);
                }
                
                if (typeof node.update === 'function') {
                  node.update();
                }
                updateSuccess = true;
              } else {
                // 方法6: 直接修改属性
                if (tags.length === 0) {
                  delete node.tag;
                  console.log('已删除节点tag属性');
                } else {
                  node.tag = tags;
                  console.log('已直接设置节点tag属性');
                }
                updateSuccess = true;
              }
              
              // 尝试强制重新渲染
              try {
                if (typeof node.renderNode === 'function') {
                  node.renderNode();
                  console.log('调用节点renderNode()方法');
                }
                
                // 尝试找到mindMap实例并触发渲染
                const mindMap = node.mindMap || node.instance || (window as any)._mindMap;
                if (mindMap && typeof mindMap.render === 'function') {
                  mindMap.render();
                  console.log('调用mindMap.render()强制渲染');
                }
              } catch (e) {
                console.warn('尝试强制渲染失败:', e);
              }
              
            } catch (error) {
              console.error('更新节点标签失败:', error);
            }
          });
          
          if (updateSuccess) {
            showFeedback('标签已更新');
          } else {
            showFeedback('标签更新失败，请尝试重新选择节点', true);
          }
        } catch (error) {
          console.error('保存标签时出错:', error);
          showFeedback('保存标签失败', true);
        }
      })(selectedTags);
      
      setShowTagModal(false);
    };

    // 使用useEffect替代直接条件调用，避免无限渲染循环
    useEffect(() => {
      if (showImageModal) {
        openImageData();
      }
    }, [showImageModal]);

    useEffect(() => {
      if (showLinkModal) {
        openLinkData();
      }
    }, [showLinkModal]);

    useEffect(() => {
      if (showNoteModal) {
        openNoteData();
      }
    }, [showNoteModal]);

    useEffect(() => {
      if (showTagModal) {
        openTagData();
      }
    }, [showTagModal, activeNodes]);

    return (
      <>
        {showImageModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>插入图片</h3>
              <div className="form-group">
                <label>图片URL:</label>
                <input type="text" value={imageUrl} onChange={e => setImageUrl(e.target.value)} />
              </div>
              <div className="form-group">
                <label>标题:</label>
                <input type="text" value={imageTitle} onChange={e => setImageTitle(e.target.value)} />
              </div>
              <div className="form-group">
                <label>宽度:</label>
                <input type="number" value={imageWidth} onChange={e => setImageWidth(+e.target.value)} />
              </div>
              <div className="form-group">
                <label>高度:</label>
                <input type="number" value={imageHeight} onChange={e => setImageHeight(+e.target.value)} />
              </div>
              <div className="modal-actions">
                <button onClick={() => setShowImageModal(false)}>取消</button>
                <button onClick={handleImageSubmit}>确定</button>
              </div>
            </div>
          </div>
        )}
        {showLinkModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>插入超链接</h3>
              <div className="form-group">
                <label>链接URL:</label>
                <input type="text" value={linkUrl} onChange={e => setLinkUrl(e.target.value)} />
              </div>
              <div className="form-group">
                <label>链接标题:</label>
                <input type="text" value={linkTitle} onChange={e => setLinkTitle(e.target.value)} />
              </div>
              <div className="modal-actions">
                <button onClick={() => setShowLinkModal(false)}>取消</button>
                <button onClick={handleLinkSubmit}>确定</button>
              </div>
            </div>
          </div>
        )}
        {showNoteModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>插入备注</h3>
              <div className="form-group">
                <label>备注内容:</label>
                <textarea value={noteContent} onChange={e => setNoteContent(e.target.value)} />
              </div>
              <div className="modal-actions">
                <button onClick={() => setShowNoteModal(false)}>取消</button>
                <button onClick={handleNoteSubmit}>确定</button>
              </div>
            </div>
          </div>
        )}
        {showTagModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>选择标签</h3>
              <div className="form-group">
                <p className="tag-hint">选择以下标签：</p>
                <NodeTagSelector 
                  selectedTags={selectedTags}
                  onChange={setSelectedTags}
                />
              </div>
              <div className="modal-actions">
                <button onClick={() => setShowTagModal(false)}>取消</button>
                <button onClick={handleTagSubmit}>确定</button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }
);

export default MindMapNodeModals; 