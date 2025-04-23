import React, { useState } from 'react';
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
    openNote
  } = useAppContext();
  
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newSubcategoryName, setNewSubcategoryName] = useState('');
  const [newNoteName, setNewNoteName] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  
  // 切换分类折叠状态
  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };
  
  // 选择分类
  const selectCategory = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setSelectedSubCategoryId(null);
    toggleCategory(categoryId);
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
  };
  
  // 添加新子分类
  const handleAddSubcategory = () => {
    if (!selectedCategoryId || !newSubcategoryName.trim()) return;
    
    createNewSubcategory(selectedCategoryId, newSubcategoryName);
    setNewSubcategoryName('');
  };
  
  // 添加新笔记
  const handleAddNote = () => {
    if (!newNoteName.trim() || !selectedCategoryId) return;
    
    createNewNote(newNoteName, selectedCategoryId, selectedSubCategoryId || undefined);
    setNewNoteName('');
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
  
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>脑图笔记本</h2>
      </div>
      
      <div className="new-category">
        <input
          type="text"
          placeholder="新分类名称"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
        />
        <button onClick={handleAddCategory}>添加分类</button>
      </div>
      
      {selectedCategoryId && (
        <div className="new-subcategory">
          <input
            type="text"
            placeholder="新子分类名称"
            value={newSubcategoryName}
            onChange={(e) => setNewSubcategoryName(e.target.value)}
          />
          <button onClick={handleAddSubcategory}>添加子分类</button>
        </div>
      )}
      
      {selectedCategoryId && (
        <div className="new-note">
          <input
            type="text"
            placeholder="新笔记名称"
            value={newNoteName}
            onChange={(e) => setNewNoteName(e.target.value)}
          />
          <button onClick={handleAddNote}>添加笔记</button>
        </div>
      )}
      
      <div className="categories-list">
        {categories.map(category => (
          <div key={category.id} className="category">
            <div 
              className={`category-item ${selectedCategoryId === category.id ? 'active' : ''}`}
              onClick={() => selectCategory(category.id)}
            >
              <span className="category-toggle">
                {expandedCategories[category.id] ? '▼' : '▶'}
              </span>
              {category.name}
            </div>
            
            {expandedCategories[category.id] && (
              <>
                {/* 分类下的直接笔记 */}
                <div className="notes-list">
                  {getFilteredNotes(category.id, null).map(note => (
                    <div 
                      key={note.id} 
                      className={`note-item ${activeNote?.id === note.id ? 'active' : ''}`}
                      onClick={() => handleOpenNote(note.id)}
                    >
                      {note.title}
                    </div>
                  ))}
                </div>
                
                {/* 子分类 */}
                {category.subCategories.map(subCategory => (
                  <div key={subCategory.id} className="subcategory">
                    <div 
                      className={`subcategory-item ${selectedSubCategoryId === subCategory.id ? 'active' : ''}`}
                      onClick={() => selectSubCategory(subCategory.id)}
                    >
                      {subCategory.name}
                    </div>
                    
                    {/* 子分类下的笔记 */}
                    <div className="notes-list">
                      {getFilteredNotes(category.id, subCategory.id).map(note => (
                        <div 
                          key={note.id} 
                          className={`note-item ${activeNote?.id === note.id ? 'active' : ''}`}
                          onClick={() => handleOpenNote(note.id)}
                        >
                          {note.title}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;