// 笔记元数据类型
export interface NoteMetadata {
  id: string;
  title: string;
  path: string;
  categoryId: string;
  subCategoryId?: string;
  lastUpdated: string;
}

// 分类类型
export interface Category {
  id: string;
  name: string;
  subCategories: SubCategory[];
}

// 子分类类型
export interface SubCategory {
  id: string;
  name: string;
  parentId: string;
}

// 脑图数据类型
export interface MindMapData {
  id: string;
  title: string;
  rootId: string;
  lastUpdated: string;
  theme?: string;
  data: {
    [key: string]: {
      data: {
        id: string;
        text: string;
        [key: string]: any;
      };
      children?: string[];
    };
  };
}

// 主题配置类型
export interface ThemeConfig {
  mode: 'light' | 'dark' | 'system';
  fontSize: 'small' | 'medium' | 'large';
}

// 用户配置类型
export interface UserConfig {
  workspacePath: string;
  theme?: ThemeConfig;
}

// 应用状态类型
export interface AppState {
  categories: Category[];
  notes: NoteMetadata[];
  activeNote: NoteMetadata | null;
  userConfig: UserConfig;
} 