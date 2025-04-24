import { NoteMetadata, MindMapData, Category, SubCategory } from '../types';
import { invoke } from '@tauri-apps/api/core';
import { BaseDirectory, exists, mkdir } from '@tauri-apps/plugin-fs';
import { appDataDir } from '@tauri-apps/api/path';
// 获取应用数据目录
let cachedDataDir: string | null = null;
let customWorkspacePath: string | null = null;

async function getDataDir(): Promise<string> {
  try {
    // 如果设置了自定义工作区路径，优先使用
    if (customWorkspacePath) {
      return customWorkspacePath;
    }
    
    // 否则使用应用数据目录
    if (cachedDataDir === null) {
      cachedDataDir = await appDataDir();
    }
    // 既然我们做了错误处理，cachedDataDir不可能为null
    return cachedDataDir!;
  } catch (error) {
    console.error('获取应用数据目录失败:', error);
    // 开发环境或非Tauri环境下的备用方案
    return './data';
  }
}

// 设置自定义工作区路径
export function setCustomWorkspacePath(path: string | null): void {
  customWorkspacePath = path;
  // 重置缓存的数据目录
  cachedDataDir = null;
}

// 初始化工作区
export async function initializeWorkspace(customPath?: string): Promise<void> {
  try {
    // 如果提供了自定义路径，设置它
    if (customPath && customPath.trim() !== '') {
      setCustomWorkspacePath(customPath);
    }
    
    const dataDir = await getDataDir();
    
    // 检查目录是否存在，不存在则创建
    const dirExists = await exists(dataDir);
    if (!dirExists) {
      await mkdir(dataDir, { recursive: true });
    }
    
    // 创建默认分类以确保工作区存在
    try {
      await invoke('create_category', { dataDir, name: '默认分类' });
      console.log('工作区初始化成功:', dataDir);
    } catch (error) {
      // 处理命令调用失败的情况（例如非Tauri环境或开发模式）
      console.warn('创建默认分类失败，可能在开发环境中运行:', error);
    }
  } catch (error) {
    console.error('工作区初始化失败:', error);
    throw new Error(`无法初始化工作区: ${error}`);
  }
}

// 扫描工作区目录结构
export async function scanWorkspaceDirectory(): Promise<{categories: Category[], notes: NoteMetadata[]}> {
  try {
    const dataDir = await getDataDir();
    let categories: Category[] = [];
    let notes: NoteMetadata[] = [];
    
    // 获取分类
    try {
      categories = await getAllCategories();
    } catch (error) {
      console.error('扫描分类失败:', error);
      categories = [];
    }
    
    // 获取笔记
    try {
      notes = await getAllNotes();
    } catch (error) {
      console.error('扫描笔记失败:', error);
      notes = [];
    }
    
    return { categories, notes };
  } catch (error) {
    console.error('扫描工作区失败:', error);
    return { categories: [], notes: [] };
  }
}

// 如果后端不支持get_all_categories，创建默认分类
async function getDefaultCategories(): Promise<Category[]> {
  return [
    {
      id: '默认分类',
      name: '默认分类',
      subCategories: []
    }
  ];
}

// 获取所有分类
export async function getAllCategories(): Promise<Category[]> {
  try {
    const dataDir = await getDataDir();
    
    try {
      // 调用后端获取目录结构
      const rawCategories = await invoke('get_all_categories', { dataDir }) as any[];
      
      // 将后端返回的数据转换为前端类型
      const categories: Category[] = rawCategories.map(cat => ({
        id: cat.id,
        name: cat.name,
        subCategories: (cat.sub_categories || []).map((sub: any) => ({
          id: sub.id,
          name: sub.name,
          parentId: cat.id
        }))
      }));
      
      return categories;
    } catch (error) {
      console.warn('获取分类列表失败，使用默认分类:', error);
      // 如果后端不支持，尝试使用现有的目录结构进行构建
      return getDefaultCategories();
    }
  } catch (error) {
    console.error('获取分类失败:', error);
    return getDefaultCategories();
  }
}

// 读取笔记
export async function readNote(path: string): Promise<MindMapData> {
  try {
    const content = await invoke('read_note', { path }) as string;
    return JSON.parse(content);
  } catch (error) {
    console.error('读取笔记失败:', error);
    throw new Error(`无法读取笔记: ${error}`);
  }
}

// 保存笔记
export async function saveNote(path: string, data: MindMapData): Promise<void> {
  try {
    const content = JSON.stringify(data, null, 2);
    await invoke('save_note', { path, content });
  } catch (error) {
    console.error('保存笔记失败:', error);
    throw new Error(`无法保存笔记: ${error}`);
  }
}

// 定义后端返回的笔记类型
interface BackendNote {
  id: string;
  title: string;
  path: string;
  category_id: string;
  sub_category_id?: string;
  last_updated: string;
}

// 获取所有笔记
export async function getAllNotes(): Promise<NoteMetadata[]> {
  try {
    const dataDir = await getDataDir();
    try {
      const notes = await invoke('get_all_notes', { dataDir }) as BackendNote[];
      
      // 将后端返回的数据转换为前端类型
      return notes.map((note: BackendNote) => ({
        id: note.id,
        title: note.title,
        path: note.path,
        categoryId: note.category_id,
        subCategoryId: note.sub_category_id,
        lastUpdated: note.last_updated
      }));
    } catch (error) {
      console.warn('获取笔记列表失败，可能在开发环境中:', error);
      return []; // 返回空数组，表示没有笔记
    }
  } catch (error) {
    console.error('获取笔记列表失败:', error);
    return [];
  }
}

// 创建一个新的笔记
export async function createNote(
  title: string, 
  categoryId: string, 
  subCategoryId?: string
): Promise<NoteMetadata> {
  try {
    const dataDir = await getDataDir();
    const id = Date.now().toString();
    
    // 构建文件路径
    let notePath: string;
    if (subCategoryId) {
      notePath = `${dataDir}/${categoryId}/${subCategoryId}/${title}.json`;
    } else {
      notePath = `${dataDir}/${categoryId}/${title}.json`;
    }
    
    // 创建初始思维导图数据
    const initialData: MindMapData = {
      id,
      title,
      rootId: 'root',
      lastUpdated: new Date().toISOString(),
      data: {
        root: {
          data: {
            id: 'root',
            text: title
          }
        }
      }
    };
    
    // 保存新笔记
    await saveNote(notePath, initialData);
    
    // 返回笔记元数据
    return {
      id,
      title,
      path: notePath,
      categoryId,
      subCategoryId,
      lastUpdated: initialData.lastUpdated
    };
  } catch (error) {
    console.error('创建笔记失败:', error);
    throw new Error(`无法创建笔记: ${error}`);
  }
}

// 创建分类
export async function createCategory(name: string): Promise<string> {
  try {
    const dataDir = await getDataDir();
    return await invoke('create_category', { dataDir, name }) as string;
  } catch (error) {
    console.error('创建分类失败:', error);
    throw new Error(`无法创建分类: ${error}`);
  }
}

// 创建子分类
export async function createSubcategory(categoryId: string, name: string): Promise<string> {
  try {
    const dataDir = await getDataDir();
    return await invoke('create_subcategory', { dataDir, categoryId, name }) as string;
  } catch (error) {
    console.error('创建子分类失败:', error);
    throw new Error(`无法创建子分类: ${error}`);
  }
} 