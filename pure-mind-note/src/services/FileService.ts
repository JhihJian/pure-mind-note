import { NoteMetadata, MindMapData } from '../types';

// 声明调用Tauri API的接口
declare global {
  interface Window {
    __TAURI__: {
      invoke(cmd: string, args?: any): Promise<any>;
      path: {
        appDataDir(): Promise<string>;
      };
    };
  }
}

// 简化调用
const invoke = (cmd: string, args?: any) => window.__TAURI__.invoke(cmd, args);
const appDataDir = () => window.__TAURI__.path.appDataDir();

// 获取应用数据目录
let cachedDataDir: string | null = null;

async function getDataDir(): Promise<string> {
  if (cachedDataDir === null) {
    cachedDataDir = await appDataDir();
    // 创建基本的笔记存储目录
    await invoke('create_category', { dataDir: cachedDataDir, name: '默认分类' });
  }
  return cachedDataDir as string;
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
    console.error('获取笔记列表失败:', error);
    throw new Error(`无法获取笔记列表: ${error}`);
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