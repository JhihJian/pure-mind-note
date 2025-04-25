import React, { useState, forwardRef, useImperativeHandle } from 'react';
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
    const [tagContent, setTagContent] = useState('标签1,标签2');

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
      if (activeNodes.length === 0) return;
      try {
        const node = activeNodes[0];
        const data = node.getData().data.tag;
        if (Array.isArray(data)) {
          const s = data.map(t => typeof t === 'string' ? t : t.text).join(',');
          setTagContent(s);
        }
      } catch (e) {
        console.error('获取节点标签数据失败:', e);
      }
    };

    const handleTagSubmit = () => {
      withViewStatePreservation((tagsStr: string) => {
        const tags = tagsStr.split(',').map(t => t.trim());
        activeNodes.forEach(node => node.setTag(tags));
      })(tagContent);
      setShowTagModal(false);
    };

    // 在打开时预加载数据
    if (showImageModal) openImageData();
    if (showLinkModal) openLinkData();
    if (showNoteModal) openNoteData();
    if (showTagModal) openTagData();

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
              <h3>插入标签</h3>
              <div className="form-group">
                <label>标签内容:</label>
                <input type="text" value={tagContent} onChange={e => setTagContent(e.target.value)} />
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