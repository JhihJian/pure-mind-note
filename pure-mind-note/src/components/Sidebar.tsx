import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import './Sidebar.css';

const Sidebar: React.FC = () => {
  const { 
    categories, 
    notes, 
    activeNote,
    createNewCategory,
    createNewSubcategory,
    createNewNote,
    openNote,
    deleteCategory
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
  
  // 删除分类
  const handleDeleteCategory = async (categoryId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (window.confirm('确定要删除此分类吗？')) {
      try {
        await deleteCategory(categoryId);
      } catch (error) {
        alert(`删除分类失败: ${error}`);
      }
    }
  };
  
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>脑图记事本</h2>
        <div className="sidebar-actions">
          <button 
            className="action-button add-button" 
            onClick={() => setShowAddCategoryForm(true)}
            title="添加分类"
          >
            <span className="icon">+</span>
          </button>
        </div>
      </div>
      
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
      
      {/* 主内容区 - 分类和笔记列表 */}
      <div className="categories-container">
        {categories.length === 0 ? (
          <div className="empty-state">
            <p>点击 "+" 按钮创建您的第一个分类</p>
          </div>
        ) : (
          <div className="categories-list">
            {categories.map(category => (
              <div key={category.id} className="category">
                <div 
                  className={`category-item ${selectedCategoryId === category.id ? 'active' : ''}`}
                  onClick={() => selectCategory(category.id)}
                >
                  <span 
                    className="category-toggle"
                    onClick={(e) => toggleCategory(category.id, e)}
                  >
                    {expandedCategories[category.id] ? '▼' : '▶'}
                  </span>
                  <span className="category-icon">📁</span>
                  <span className="category-name">{category.name}</span>
                  <button 
                    className="action-button add-subcategory-button"
                    onClick={(e) => showAddSubcategoryFormHandler(category.id, e)}
                    title="添加子分类"
                  >
                    <span className="small-icon">+</span>
                  </button>
                  <button 
                    className="action-button delete-category-button"
                    onClick={(e) => handleDeleteCategory(category.id, e)}
                    title="删除分类"
                  >
                    <span className="small-icon">🗑</span>
                  </button>
                </div>
                
                {expandedCategories[category.id] && (
                  <div className="category-content">
                    {/* 子分类 */}
                    {category.subCategories.map(subCategory => (
                      <div key={subCategory.id} className="subcategory">
                        <div 
                          className={`subcategory-item ${selectedSubCategoryId === subCategory.id ? 'active' : ''}`}
                          onClick={() => selectSubCategory(subCategory.id)}
                        >
                          <span className="subcategory-icon">📂</span>
                          <span className="subcategory-name">{subCategory.name}</span>
                          <button 
                            className="action-button add-note-button"
                            onClick={(e) => showAddNoteFormHandler(subCategory.id, e)}
                            title="添加笔记"
                          >
                            <span className="small-icon">+</span>
                          </button>
                        </div>
                        
                        {/* 子分类下的笔记 */}
                        <div className="notes-list">
                          {getFilteredNotes(category.id, subCategory.id).map(note => (
                            <div 
                              key={note.id} 
                              className={`note-item ${activeNote?.id === note.id ? 'active' : ''}`}
                              onClick={() => handleOpenNote(note.id)}
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
    </div>
  );
};

export default Sidebar;