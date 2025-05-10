import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import './Sidebar.css';
import NotebookTypeSelector from './NotebookTypeSelector';
import { NotebookType } from '../types';

interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  type: 'category' | 'subcategory' | 'note' | 'sidebar';
  id: string;
  parentId?: string;
}

const Sidebar: React.FC = () => {
  const { 
    categories, 
    notes, 
    activeNote,
    createNewCategory,
    createNewSubcategory,
    createNewNote,
    openNote,
    deleteCategory,
    deleteSubcategory,
    deleteNote,
    loadNotes
  } = useAppContext();
  
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newSubcategoryName, setNewSubcategoryName] = useState('');
  const [newNoteName, setNewNoteName] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [showAddCategoryForm, setShowAddCategoryForm] = useState(false);
  const [showAddSubcategoryForm, setShowAddSubcategoryForm] = useState(false);
  const [showAddNoteForm, setShowAddNoteForm] = useState(false);
  const [currentAddParentId, setCurrentAddParentId] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    visible: false,
    x: 0,
    y: 0,
    type: 'category',
    id: ''
  });
  const [selectedNotebookType, setSelectedNotebookType] = useState<NotebookType>(NotebookType.MINDMAP);
  
  const addMenuRef = useRef<HTMLDivElement>(null);
  
  // 切换分类折叠状态
  const toggleCategory = (categoryId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };
  
  // 选择分类
  const selectCategory = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setSelectedSubCategoryId(null);
    // 确保展开当前选中的分类
    if (!expandedCategories[categoryId]) {
      setExpandedCategories(prev => ({
        ...prev,
        [categoryId]: true
      }));
    }
  };
  
  // 选择子分类
  const selectSubCategory = (subCategoryId: string) => {
    setSelectedSubCategoryId(subCategoryId);
  };
  
  // 添加新分类
  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    
    createNewCategory(newCategoryName);
    setNewCategoryName('');
    setShowAddCategoryForm(false);
  };
  
  // 添加新子分类
  const handleAddSubcategory = () => {
    if (!currentAddParentId || !newSubcategoryName.trim()) return;
    
    createNewSubcategory(currentAddParentId, newSubcategoryName);
    setNewSubcategoryName('');
    setShowAddSubcategoryForm(false);
    setCurrentAddParentId(null);
  };
  
  // 添加新笔记
  const handleAddNote = () => {
    if (!newNoteName.trim() || !currentAddParentId) return;
    
    createNewNote(newNoteName, selectedCategoryId || currentAddParentId, currentAddParentId);
    setNewNoteName('');
    setShowAddNoteForm(false);
    setCurrentAddParentId(null);
  };
  
  // 打开笔记
  const handleOpenNote = (noteId: string) => {
    openNote(noteId);
  };
  
  // 获取指定分类和可能的子分类下的笔记
  const getFilteredNotes = (categoryId: string, subCategoryId?: string | null) => {
    return notes.filter(note => {
      if (note.categoryId !== categoryId) return false;
      if (subCategoryId) return note.subCategoryId === subCategoryId;
      return true;
    });
  };

  // 取消表单输入
  const cancelForm = (formType: 'category' | 'subcategory' | 'note') => {
    if (formType === 'category') {
      setShowAddCategoryForm(false);
      setNewCategoryName('');
    } else if (formType === 'subcategory') {
      setShowAddSubcategoryForm(false);
      setNewSubcategoryName('');
    } else if (formType === 'note') {
      setShowAddNoteForm(false);
      setNewNoteName('');
    }
    setCurrentAddParentId(null);
  };
  
  // 显示添加子分类表单
  const showAddSubcategoryFormHandler = (categoryId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setCurrentAddParentId(categoryId);
    setShowAddSubcategoryForm(true);
  };
  
  // 显示添加笔记表单
  const showAddNoteFormHandler = (subCategoryId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setCurrentAddParentId(subCategoryId);
    setShowAddNoteForm(true);
  };
  
  // 处理右键菜单
  const handleContextMenu = (e: React.MouseEvent, type: 'category' | 'subcategory' | 'note' | 'sidebar', id: string, parentId?: string) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      type,
      id,
      parentId
    });
  };

  // 关闭右键菜单
  const closeContextMenu = () => {
    setContextMenu(prev => ({ ...prev, visible: false }));
  };

  // 处理删除操作
  const handleDelete = async () => {
    try {
      if (contextMenu.type === 'category') {
        if (window.confirm('确定要删除此分类吗？')) {
          await deleteCategory(contextMenu.id);
        }
      } else if (contextMenu.type === 'subcategory' && contextMenu.parentId) {
        if (window.confirm('确定要删除此子分类吗？删除后将无法恢复。')) {
          await deleteSubcategory(contextMenu.parentId, contextMenu.id);
        }
      } else if (contextMenu.type === 'note') {
        if (window.confirm('确定要删除此笔记吗？删除后将无法恢复。')) {
          await deleteNote(contextMenu.id);
        }
      }
    } catch (error) {
      alert(`删除失败: ${error}`);
    }
    closeContextMenu();
  };

  // 点击其他地方时关闭右键菜单
  useEffect(() => {
    const handleClick = () => closeContextMenu();
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);
  
  const handleCreateNote = async () => {
    if (!selectedCategoryId) {
      alert('请先选择一个分类');
      return;
    }

    const title = prompt('请输入笔记标题：');
    if (!title) return;

    try {
      await createNewNote(title, selectedCategoryId, selectedSubCategoryId || undefined);
      alert('笔记创建成功');
      // 刷新笔记列表
      loadNotes();
    } catch (error) {
      alert(`创建笔记失败: ${error}`);
    }
  };

  // 处理右键菜单项点击
  const handleContextMenuAction = (action: 'add' | 'delete', menuType?: string) => {
    if (action === 'add') {
      if (contextMenu.type === 'sidebar') {
        setShowAddCategoryForm(true);
      } else if (contextMenu.type === 'category') {
        if (menuType === 'subcategory') {
          setCurrentAddParentId(contextMenu.id);
          setShowAddSubcategoryForm(true);
        } else if (menuType === 'note') {
          setCurrentAddParentId(contextMenu.id);
          setShowAddNoteForm(true);
        }
      } else if (contextMenu.type === 'subcategory') {
        setCurrentAddParentId(contextMenu.id);
        setShowAddNoteForm(true);
      }
    } else if (action === 'delete') {
      handleDelete();
    }
    closeContextMenu();
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="notebook-type-buttons">
          <button
            className={`type-button ${selectedNotebookType === NotebookType.MINDMAP ? 'active' : ''}`}
            onClick={() => setSelectedNotebookType(NotebookType.MINDMAP)}
          >
            脑图记事本
          </button>
          <button
            className={`type-button ${selectedNotebookType === NotebookType.MARKDOWN ? 'active' : ''}`}
            onClick={() => setSelectedNotebookType(NotebookType.MARKDOWN)}
          >
            Markdown记事本
          </button>
        </div>
      </div>
      
      <div 
        className="categories-container"
        onContextMenu={(e) => {
          if (e.target === e.currentTarget) {
            handleContextMenu(e, 'sidebar', '');
          }
        }}
      >
        {categories.length === 0 ? (
          <div className="empty-state">
            <p>在空白处右键点击创建您的第一个分类</p>
          </div>
        ) : (
          <div className="categories-list">
            {categories.map(category => (
              <div key={category.id} className="category">
                <div 
                  className={`category-item ${selectedCategoryId === category.id ? 'active' : ''}`}
                  onClick={() => selectCategory(category.id)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleContextMenu(e, 'category', category.id);
                  }}
                >
                  <span 
                    className="category-toggle"
                    onClick={(e) => toggleCategory(category.id, e)}
                  >
                    {expandedCategories[category.id] ? '▼' : '▶'}
                  </span>
                  <span className="category-icon">📁</span>
                  <span className="category-name">{category.name}</span>
                </div>
                
                {expandedCategories[category.id] && (
                  <div className="category-content">
                    {/* 子分类 */}
                    {category.subCategories.map(subCategory => (
                      <div key={subCategory.id} className="subcategory">
                        <div 
                          className={`subcategory-item ${selectedSubCategoryId === subCategory.id ? 'active' : ''}`}
                          onClick={() => selectSubCategory(subCategory.id)}
                          onContextMenu={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleContextMenu(e, 'subcategory', subCategory.id, category.id);
                          }}
                        >
                          <span className="subcategory-icon">📂</span>
                          <span className="subcategory-name">{subCategory.name}</span>
                        </div>
                        
                        {/* 子分类下的笔记 */}
                        <div className="notes-list">
                          {getFilteredNotes(category.id, subCategory.id).map(note => (
                            <div 
                              key={note.id} 
                              className={`note-item ${activeNote?.id === note.id ? 'active' : ''}`}
                              onClick={() => handleOpenNote(note.id)}
                              onContextMenu={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleContextMenu(e, 'note', note.id);
                              }}
                            >
                              <span className="note-icon">📝</span>
                              <span className="note-title">{note.title}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 右键菜单 */}
      {contextMenu.visible && (
        <div 
          className="context-menu"
          style={{ 
            position: 'fixed',
            top: contextMenu.y,
            left: contextMenu.x,
            zIndex: 1000
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {contextMenu.type === 'sidebar' && (
            <div className="context-menu-item" onClick={() => handleContextMenuAction('add')}>
              新建分类
            </div>
          )}
          {contextMenu.type === 'category' && (
            <>
              <div className="context-menu-item" onClick={() => handleContextMenuAction('add', 'subcategory')}>
                新建子分类
              </div>
              <div className="context-menu-item" onClick={() => handleContextMenuAction('add', 'note')}>
                新建笔记
              </div>
              <div className="context-menu-item" onClick={() => handleContextMenuAction('delete')}>
                删除分类
              </div>
            </>
          )}
          {contextMenu.type === 'subcategory' && (
            <>
              <div className="context-menu-item" onClick={() => handleContextMenuAction('add')}>
                新建笔记
              </div>
              <div className="context-menu-item" onClick={() => handleContextMenuAction('delete')}>
                删除子分类
              </div>
            </>
          )}
          {contextMenu.type === 'note' && (
            <div className="context-menu-item" onClick={() => handleContextMenuAction('delete')}>
              删除笔记
            </div>
          )}
        </div>
      )}

      {/* 添加分类表单 */}
      {showAddCategoryForm && (
        <div className="form-panel">
          <div className="panel-header">
            <h3>添加分类</h3>
            <button 
              className="close-button"
              onClick={() => cancelForm('category')}
            >
              ×
            </button>
          </div>
          <div className="form-content">
            <input
              type="text"
              placeholder="分类名称"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              autoFocus
            />
            <div className="form-actions">
              <button className="secondary-button" onClick={() => cancelForm('category')}>取消</button>
              <button className="primary-button" onClick={handleAddCategory}>添加</button>
            </div>
          </div>
        </div>
      )}
      
      {/* 添加子分类表单 */}
      {showAddSubcategoryForm && currentAddParentId && (
        <div className="form-panel">
          <div className="panel-header">
            <h3>添加子分类</h3>
            <button 
              className="close-button"
              onClick={() => cancelForm('subcategory')}
            >
              ×
            </button>
          </div>
          <div className="form-content">
            <p className="form-info">
              父分类: {categories.find(c => c.id === currentAddParentId)?.name}
            </p>
            <input
              type="text"
              placeholder="子分类名称"
              value={newSubcategoryName}
              onChange={(e) => setNewSubcategoryName(e.target.value)}
              autoFocus
            />
            <div className="form-actions">
              <button className="secondary-button" onClick={() => cancelForm('subcategory')}>取消</button>
              <button className="primary-button" onClick={handleAddSubcategory}>添加</button>
            </div>
          </div>
        </div>
      )}
      
      {/* 添加笔记表单 */}
      {showAddNoteForm && currentAddParentId && (
        <div className="form-panel">
          <div className="panel-header">
            <h3>添加笔记</h3>
            <button 
              className="close-button"
              onClick={() => cancelForm('note')}
            >
              ×
            </button>
          </div>
          <div className="form-content">
            <p className="form-info">
              {(() => {
                const category = categories.find(c => c.id === selectedCategoryId);
                if (!category) return '';
                
                const subCategory = category.subCategories.find(s => s.id === currentAddParentId);
                if (!subCategory) return '';
                
                return `分类: ${category.name} > ${subCategory.name}`;
              })()}
            </p>
            <input
              type="text"
              placeholder="笔记标题"
              value={newNoteName}
              onChange={(e) => setNewNoteName(e.target.value)}
              autoFocus
            />
            <div className="form-actions">
              <button className="secondary-button" onClick={() => cancelForm('note')}>取消</button>
              <button className="primary-button" onClick={handleAddNote}>添加</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;