import { NoteMetadata, MindMapData, Category, SubCategory, NotebookType } from '../types';
import { invoke } from '@tauri-apps/api/core';
import { BaseDirectory, exists, mkdir } from '@tauri-apps/plugin-fs';
import { appDataDir, normalize } from '@tauri-apps/api/path';
// 获取应用数据目录
let cachedDataDir: string | null = null;
let customWorkspacePath: string | null = null;

// 格式化路径，确保Windows路径格式正确
async function formatPath(path: string): Promise<string> {
  try {
    // 首先规范化路径（统一斜杠等）
    let normalizedPath = await normalize(path);
    
    // 处理Windows上路径中可能存在的分号错误（例如"C;/path"应该是"C:/path"）
    if (normalizedPath.includes(';')) {
      normalizedPath = normalizedPath.replace(';', ':');
      console.log('修正了路径中的分号:', normalizedPath);
    }
    
    // 确保路径最后没有斜杠
    if (normalizedPath.endsWith('/') || normalizedPath.endsWith('\\')) {
      normalizedPath = normalizedPath.slice(0, -1);
    }
    
    return normalizedPath;
  } catch (error) {
    console.error('路径格式化失败:', error);
    return path; // 出错时返回原始路径
  }
}

async function getDataDir(): Promise<string> {
  try {
    // 如果设置了自定义工作区路径，优先使用
    if (customWorkspacePath && customWorkspacePath.trim() !== '') {
      console.log('使用自定义工作区路径:', customWorkspacePath);
      return await formatPath(customWorkspacePath);
    }
    
    // 否则使用应用数据目录
    if (cachedDataDir === null) {
      try {
        cachedDataDir = await appDataDir();
        console.log('获取应用数据目录:', cachedDataDir);
      } catch (error) {
        console.warn('无法获取应用数据目录，使用默认路径:', error);
        cachedDataDir = './data';
      }
    }
    
    return cachedDataDir;
  } catch (error) {
    console.error('获取应用数据目录失败:', error);
    // 开发环境或非Tauri环境下的备用方案
    return './data';
  }
}

// 设置自定义工作区路径
export function setCustomWorkspacePath(path: string | null): void {
  if (path === null || path.trim() === '') {
    console.log('清除自定义工作区路径');
    customWorkspacePath = null;
  } else {
    console.log('设置自定义工作区路径:', path);
    customWorkspacePath = path.trim();
  }
  
  // 重置缓存的数据目录
  cachedDataDir = null;
}

// 初始化工作区
export async function initializeWorkspace(customPath?: string): Promise<void> {
  try {
    // 如果提供了自定义路径，设置它
    if (customPath && customPath.trim() !== '') {
      // 先格式化路径
      const formattedPath = await formatPath(customPath);
      console.log(`初始化工作区，原始路径: ${customPath}, 格式化后: ${formattedPath}`);
      
      // 设置格式化后的路径
      setCustomWorkspacePath(formattedPath);
    } else if (customPath === '') {
      // 如果路径是空字符串，则清除自定义路径
      setCustomWorkspacePath(null);
    }
    
    const dataDir = await getDataDir();
    console.log('工作区实际使用路径:', dataDir);
    
    // 检查目录是否存在，不存在则创建
    const dirExists = await exists(dataDir);
    if (!dirExists) {
      await mkdir(dataDir, { recursive: true });
    }
    
    // 记录工作区初始化成功
    console.log('工作区初始化成功:', dataDir);
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
        createdTime: cat.created_time,
        subCategories: (cat.sub_categories || []).map((sub: any) => ({
          id: sub.id,
          name: sub.name,
          parentId: cat.id,
          createdTime: sub.created_time
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
    console.log('[FileService] 开始读取笔记文件:', path);
    const content = await invoke('read_note', { path }) as string;
    const data = JSON.parse(content);
    console.log('[FileService] 笔记文件读取成功:', {
      id: data.id,
      title: data.title,
      contentLength: content.length
    });
    return data;
  } catch (error) {
    console.error('[FileService] 读取笔记失败:', error);
    throw new Error(`无法读取笔记: ${error}`);
  }
}

// 保存笔记
export async function saveNote(path: string, data: MindMapData): Promise<void> {
  try {
    console.log('[FileService] 开始保存笔记:', {
      path,
      id: data.id,
      title: data.title
    });
    const content = JSON.stringify(data, null, 2);
    await invoke('save_note', { path, content });
    console.log('[FileService] 笔记保存成功:', path);
  } catch (error) {
    console.error('[FileService] 保存笔记失败:', error);
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
    console.log('[FileService] 开始获取笔记列表，数据目录:', dataDir);
    
    try {
      const notes = await invoke('get_all_notes', { dataDir }) as BackendNote[];
      console.log('[FileService] 后端返回笔记数据:', notes.length, '个');
      
      // 将后端返回的数据转换为前端类型
      const result = notes.map((note: BackendNote) => ({
        id: note.id,
        title: note.title,
        path: note.path,
        categoryId: note.category_id,
        subCategoryId: note.sub_category_id,
        lastUpdated: note.last_updated,
        type: NotebookType.MINDMAP  // 默认设置为思维导图类型
      }));
      
      console.log('[FileService] 笔记列表转换完成:', result.length, '个');
      return result;
    } catch (error) {
      console.warn('[FileService] 获取笔记列表失败，可能在开发环境中:', error);
      return []; // 返回空数组，表示没有笔记
    }
  } catch (error) {
    console.error('[FileService] 获取笔记列表失败:', error);
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
    console.log('[FileService] 开始创建笔记:', {
      title,
      categoryId,
      subCategoryId
    });
    
    const dataDir = await getDataDir();
    
    // 生成与后端一致的唯一ID格式
    const id = subCategoryId 
      ? `${categoryId}#${subCategoryId}#${title}`
      : `${categoryId}##${title}`;
    
    console.log('[FileService] 生成笔记ID:', id);
    
    // 构建文件路径
    let notePath: string;
    if (subCategoryId) {
      notePath = `${dataDir}/${categoryId}/${subCategoryId}/${title}.json`;
    } else {
      notePath = `${dataDir}/${categoryId}/${title}.json`;
    }
    
    console.log('[FileService] 笔记文件路径:', notePath);
    
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
    
    console.log('[FileService] 创建初始数据:', {
      id: initialData.id,
      title: initialData.title,
      rootId: initialData.rootId
    });
    
    // 保存新笔记
    await saveNote(notePath, initialData);
    
    // 返回笔记元数据
    const metadata = {
      id,
      title,
      path: notePath,
      categoryId,
      subCategoryId,
      lastUpdated: initialData.lastUpdated,
      type: NotebookType.MINDMAP  // 设置默认类型为思维导图
    };
    
    console.log('[FileService] 笔记创建完成:', metadata);
    return metadata;
  } catch (error) {
    console.error('[FileService] 创建笔记失败:', error);
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

// 删除分类
export async function deleteCategory(categoryId: string): Promise<void> {
  try {
    const dataDir = await getDataDir();
    await invoke('delete_category', { dataDir, categoryId });
  } catch (error) {
    console.error('删除分类失败:', error);
    throw new Error(`无法删除分类: ${error}`);
  }
}

// 删除子分类
export async function deleteSubcategory(categoryId: string, subCategoryId: string): Promise<void> {
  try {
    const dataDir = await getDataDir();
    await invoke('delete_subcategory', { dataDir, categoryId, subCategoryId });
  } catch (error) {
    console.error('删除子分类失败:', error);
    throw new Error(`无法删除子分类: ${error}`);
  }
}

// 删除笔记
export async function deleteNote(noteId: string): Promise<void> {
  try {
    const dataDir = await getDataDir();
    await invoke('delete_note', { dataDir, noteId });
  } catch (error) {
    console.error('删除笔记失败:', error);
    throw new Error(`无法删除笔记: ${error}`);
  }
} 