import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { AppState, NoteMetadata, Category, MindMapData, SubCategory, UserConfig } from '../types';
import * as FileService from '../services/FileService';

// 创建默认状态
const defaultState: AppState = {
  categories: [],
  activeNote: null,
  notes: [],
  userConfig: {
    workspacePath: '' // 默认为空，将在加载时从配置或本地存储中获取
  }
};

// 创建上下文
interface AppContextProps extends AppState {
  loadWorkspace: () => Promise<void>;
  loadCategories: () => Promise<void>;
  loadNotes: () => Promise<void>;
  createNewNote: (title: string, categoryId: string, subCategoryId?: string) => Promise<void>;
  openNote: (noteId: string) => Promise<void>;
  saveCurrentNote: (data: MindMapData) => Promise<void>;
  createNewCategory: (name: string) => Promise<void>;
  createNewSubcategory: (categoryId: string, name: string) => Promise<void>;
  setActiveNoteData: (data: MindMapData) => void;
  activeNoteData: MindMapData | null;
  updateUserConfig: (config: Partial<UserConfig>) => Promise<void>;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

// 创建Provider组件
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // 状态
  const [state, setState] = useState<AppState>(defaultState);
  const [activeNoteData, setActiveNoteData] = useState<MindMapData | null>(null);
  const [workspaceReady, setWorkspaceReady] = useState<boolean>(false);

  // 初始化工作区
  useEffect(() => {
    loadUserConfig().then(() => {
      loadWorkspace();
    });
  }, []);

  // 当工作区准备好后，加载分类
  useEffect(() => {
    if (workspaceReady) {
      loadCategories();
    }
  }, [workspaceReady]);

  // 分类加载后，加载笔记
  useEffect(() => {
    if (state.categories.length > 0) {
      loadNotes();
    }
  }, [state.categories]);

  // 加载用户配置
  const loadUserConfig = async (): Promise<void> => {
    try {
      // 从本地存储获取配置
      const storedConfig = localStorage.getItem('userConfig');
      if (storedConfig) {
        const parsedConfig = JSON.parse(storedConfig) as UserConfig;
        setState(prevState => ({
          ...prevState,
          userConfig: parsedConfig
        }));
        console.log('用户配置加载完成:', parsedConfig);
      }
    } catch (error) {
      console.error('加载用户配置失败:', error);
    }
  };
  
  // 更新用户配置
  const updateUserConfig = async (config: Partial<UserConfig>): Promise<void> => {
    try {
      const newConfig = { ...state.userConfig, ...config };
      
      // 保存到本地存储
      localStorage.setItem('userConfig', JSON.stringify(newConfig));
      
      // 更新状态
      setState(prevState => ({
        ...prevState,
        userConfig: newConfig
      }));
      
      // 如果工作区路径更改，重新加载工作区
      if (config.workspacePath !== undefined && config.workspacePath !== state.userConfig.workspacePath) {
        await loadWorkspace();
      }
      
      console.log('用户配置更新完成:', newConfig);
    } catch (error) {
      console.error('更新用户配置失败:', error);
    }
  };

  // 初始化工作区
  const loadWorkspace = async (): Promise<void> => {
    try {
      // 初始化应用数据目录，确保工作区存在
      await FileService.initializeWorkspace(state.userConfig.workspacePath);
      setWorkspaceReady(true);
      console.log('工作区初始化完成');
    } catch (error) {
      console.error('工作区初始化失败:', error);
    }
  };

  // 加载分类和子分类
  const loadCategories = async (): Promise<void> => {
    try {
      // 获取所有分类
      const categories = await FileService.getAllCategories();
      
      // 更新状态
      setState(prevState => ({
        ...prevState,
        categories
      }));
      
      console.log('分类加载完成:', categories);
    } catch (error) {
      console.error('加载分类失败:', error);
    }
  };
  
  // 加载所有笔记
  const loadNotes = async (): Promise<void> => {
    try {
      // 获取所有笔记
      const notes = await FileService.getAllNotes();
      
      setState(prevState => ({
        ...prevState,
        notes
      }));
      
      console.log('笔记加载完成:', notes);
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
    } catch (error) {
      console.error('创建子分类失败:', error);
    }
  };
  
  // 上下文值
  const contextValue: AppContextProps = {
    ...state,
    loadWorkspace,
    loadCategories,
    loadNotes,
    createNewNote,
    openNote,
    saveCurrentNote,
    createNewCategory,
    createNewSubcategory,
    activeNoteData,
    setActiveNoteData,
    updateUserConfig
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