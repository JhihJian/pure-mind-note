import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { AppState, NoteMetadata, Category, MindMapData, SubCategory, UserConfig } from '../types';
import * as FileService from '../services/FileService';
import * as ConfigService from '../services/ConfigService';

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
  deleteCategory: (categoryId: string) => Promise<void>;
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

  // 加载用户配置
  const loadUserConfig = async (): Promise<void> => {
    try {
      // 使用ConfigService加载配置
      const config = await ConfigService.loadConfig();
      setState(prevState => ({
        ...prevState,
        userConfig: config
      }));
      console.log('用户配置加载完成:', config);
    } catch (error) {
      console.error('加载用户配置失败:', error);
    }
  };
  
  // 更新用户配置
  const updateUserConfig = async (config: Partial<UserConfig>): Promise<void> => {
    try {
      const newConfig = { ...state.userConfig, ...config };
      
      // 使用ConfigService保存配置
      await ConfigService.saveConfig(newConfig);
      
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
      throw error;
    }
  };

  // 初始化工作区
  const loadWorkspace = async (): Promise<void> => {
    try {
      // 复位状态
      setState(prevState => ({
        ...prevState,
        categories: [],
        notes: [],
        activeNote: null
      }));
      setActiveNoteData(null);
      setWorkspaceReady(false);
      
      // 初始化应用数据目录，确保工作区存在
      await FileService.initializeWorkspace(state.userConfig.workspacePath);
      
      // 加载分类
      const categories = await FileService.getAllCategories();
      
      // 加载笔记
      const notes = await FileService.getAllNotes();
      
      // 更新状态
      setState(prevState => ({
        ...prevState,
        categories,
        notes
      }));
      
      setWorkspaceReady(true);
      console.log('工作区初始化完成，已加载分类和笔记');
    } catch (error) {
      console.error('工作区初始化失败:', error);
      setWorkspaceReady(true); // 即使失败也要设置为就绪状态，以便用户可以尝试创建内容
      throw error;
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
    try {
      if (!state.activeNote) return;
      
      // 更新时间戳
      const updatedData = {
        ...data,
        lastUpdated: new Date().toISOString()
      };
      
      // 保存到文件
      await FileService.saveNote(state.activeNote.path, updatedData);
      
      // 更新状态
      setActiveNoteData(updatedData);
      
      // 更新笔记列表中的最后更新时间
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
      
      // 更新状态
      setState(prevState => ({
        ...prevState,
        categories: [
          ...prevState.categories,
          {
            id: categoryId,
            name,
            subCategories: []
          }
        ]
      }));
    } catch (error) {
      console.error('创建分类失败:', error);
    }
  };
  
  // 创建新子分类
  const createNewSubcategory = async (categoryId: string, name: string): Promise<void> => {
    try {
      const subCategoryId = await FileService.createSubcategory(categoryId, name);
      
      // 更新状态
      setState(prevState => ({
        ...prevState,
        categories: prevState.categories.map(category => 
          category.id === categoryId
            ? {
                ...category,
                subCategories: [
                  ...category.subCategories,
                  {
                    id: subCategoryId,
                    name,
                    parentId: categoryId
                  }
                ]
              }
            : category
        )
      }));
    } catch (error) {
      console.error('创建子分类失败:', error);
    }
  };
  
  // 删除分类
  const deleteCategory = async (categoryId: string): Promise<void> => {
    try {
      await FileService.deleteCategory(categoryId);
      
      // 更新状态
      setState(prevState => ({
        ...prevState,
        categories: prevState.categories.filter(category => category.id !== categoryId)
      }));
    } catch (error) {
      console.error('删除分类失败:', error);
      throw error;
    }
  };
  
  return (
    <AppContext.Provider value={{
      ...state,
      loadWorkspace,
      loadCategories,
      loadNotes,
      createNewNote,
      openNote,
      saveCurrentNote,
      createNewCategory,
      createNewSubcategory,
      deleteCategory,
      setActiveNoteData,
      activeNoteData,
      updateUserConfig
    }}>
      {children}
    </AppContext.Provider>
  );
};

// 创建Hook用于在组件中使用上下文
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext必须在AppProvider内部使用');
  }
  return context;
}; 