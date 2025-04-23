import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { AppState, NoteMetadata, Category, MindMapData } from '../types';
import * as FileService from '../services/FileService';

// 创建默认状态
const defaultState: AppState = {
  categories: [],
  activeNote: null,
  notes: []
};

// 创建上下文
interface AppContextProps extends AppState {
  loadNotes: () => Promise<void>;
  createNewNote: (title: string, categoryId: string, subCategoryId?: string) => Promise<void>;
  openNote: (noteId: string) => Promise<void>;
  saveCurrentNote: (data: MindMapData) => Promise<void>;
  createNewCategory: (name: string) => Promise<void>;
  createNewSubcategory: (categoryId: string, name: string) => Promise<void>;
  setActiveNoteData: (data: MindMapData) => void;
  activeNoteData: MindMapData | null;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

// 创建Provider组件
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // 状态
  const [state, setState] = useState<AppState>(defaultState);
  const [activeNoteData, setActiveNoteData] = useState<MindMapData | null>(null);

  // 初始化时加载笔记列表
  useEffect(() => {
    loadNotes();
  }, []);

  // 处理从笔记列表构建分类树
  const buildCategoryTree = (notes: NoteMetadata[]): Category[] => {
    const categoryMap = new Map<string, Category>();
    
    // 遍历所有笔记，构建分类Map
    notes.forEach(note => {
      if (!categoryMap.has(note.categoryId)) {
        categoryMap.set(note.categoryId, {
          id: note.categoryId,
          name: note.categoryId, // 使用分类ID作为名称
          subCategories: []
        });
      }
      
      // 如果有子分类
      if (note.subCategoryId) {
        const category = categoryMap.get(note.categoryId);
        if (category) {
          // 检查子分类是否已存在
          const subCategoryExists = category.subCategories.some(sub => sub.id === note.subCategoryId);
          
          if (!subCategoryExists && note.subCategoryId) {
            category.subCategories.push({
              id: note.subCategoryId,
              name: note.subCategoryId, // 使用子分类ID作为名称
              parentId: note.categoryId
            });
          }
        }
      }
    });
    
    return Array.from(categoryMap.values());
  };
  
  // 加载所有笔记
  const loadNotes = async (): Promise<void> => {
    try {
      const notes = await FileService.getAllNotes();
      const categories = buildCategoryTree(notes);
      
      setState(prevState => ({
        ...prevState,
        notes,
        categories
      }));
    } catch (error) {
      console.error('加载笔记失败:', error);
    }
  };
  
  // 创建新笔记
  const createNewNote = async (
    title: string, 
    categoryId: string, 
    subCategoryId?: string
  ): Promise<void> => {
    try {
      const newNote = await FileService.createNote(title, categoryId, subCategoryId);
      
      // 更新状态
      setState(prevState => ({
        ...prevState,
        notes: [...prevState.notes, newNote],
        activeNote: newNote
      }));
      
      // 读取新创建的笔记内容
      const noteData = await FileService.readNote(newNote.path);
      setActiveNoteData(noteData);
    } catch (error) {
      console.error('创建笔记失败:', error);
    }
  };
  
  // 打开笔记
  const openNote = async (noteId: string): Promise<void> => {
    try {
      const noteToOpen = state.notes.find(note => note.id === noteId);
      
      if (noteToOpen) {
        setState(prevState => ({
          ...prevState,
          activeNote: noteToOpen
        }));
        
        // 读取笔记内容
        const noteData = await FileService.readNote(noteToOpen.path);
        setActiveNoteData(noteData);
      }
    } catch (error) {
      console.error('打开笔记失败:', error);
    }
  };
  
  // 保存当前笔记
  const saveCurrentNote = async (data: MindMapData): Promise<void> => {
    if (!state.activeNote) return;
    
    try {
      // 设置更新时间
      const updatedData = {
        ...data,
        lastUpdated: new Date().toISOString()
      };
      
      // 保存到文件
      await FileService.saveNote(state.activeNote.path, updatedData);
      
      // 更新状态
      setActiveNoteData(updatedData);
      
      // 更新笔记元数据
      setState(prevState => ({
        ...prevState,
        notes: prevState.notes.map(note => 
          note.id === state.activeNote?.id 
            ? { ...note, lastUpdated: updatedData.lastUpdated }
            : note
        )
      }));
    } catch (error) {
      console.error('保存笔记失败:', error);
    }
  };
  
  // 创建新分类
  const createNewCategory = async (name: string): Promise<void> => {
    try {
      const categoryId = await FileService.createCategory(name);
      
      // 添加到分类列表
      setState(prevState => ({
        ...prevState,
        categories: [...prevState.categories, {
          id: categoryId,
          name,
          subCategories: []
        }]
      }));
      
      // 重新加载笔记列表以更新分类
      await loadNotes();
    } catch (error) {
      console.error('创建分类失败:', error);
    }
  };
  
  // 创建新子分类
  const createNewSubcategory = async (categoryId: string, name: string): Promise<void> => {
    try {
      const subCategoryId = await FileService.createSubcategory(categoryId, name);
      
      // 更新分类树
      setState(prevState => ({
        ...prevState,
        categories: prevState.categories.map(category => 
          category.id === categoryId 
            ? {
                ...category,
                subCategories: [...category.subCategories, {
                  id: subCategoryId,
                  name,
                  parentId: categoryId
                }]
              }
            : category
        )
      }));
      
      // 重新加载笔记列表以更新分类
      await loadNotes();
    } catch (error) {
      console.error('创建子分类失败:', error);
    }
  };
  
  // 上下文值
  const contextValue: AppContextProps = {
    ...state,
    loadNotes,
    createNewNote,
    openNote,
    saveCurrentNote,
    createNewCategory,
    createNewSubcategory,
    activeNoteData,
    setActiveNoteData
  };
  
  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

// 自定义钩子
export const useAppContext = (): AppContextProps => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}; 