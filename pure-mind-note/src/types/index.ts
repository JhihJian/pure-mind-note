// 笔记元数据类型
export interface NoteMetadata {
  id: string;
  title: string;
  path: string;
  categoryId: string;
  subCategoryId?: string;
  lastUpdated: string;
  type: NotebookType;
}

// 分类类型
export interface Category {
  id: string;
  name: string;
  subCategories: SubCategory[];
  createdTime?: string;
}

// 子分类类型
export interface SubCategory {
  id: string;
  name: string;
  parentId: string;
  createdTime?: string;
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
      data: MindMapNodeData;
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
  [key: string]: any; // 允许其他字段存在，用于测试和未来扩展
}

// 应用状态类型
export interface AppState {
  categories: Category[];
  notes: NoteMetadata[];
  activeNote: NoteMetadata | null;
  userConfig: UserConfig;
}

// 节点标签枚举
export enum NodeTag {
  PROJECT = 'project',     // 项目
  PROGRESS = 'progress',   // 进展
  TODO = 'todo',           // TODO
  NOTE = 'note',           // 笔记
  QUESTION = 'question'    // 问题
}

// 标签显示文本映射
export const NODE_TAG_LABELS: Record<NodeTag, string> = {
  [NodeTag.PROJECT]: '项目',
  [NodeTag.PROGRESS]: '进展',
  [NodeTag.TODO]: 'TODO',
  [NodeTag.NOTE]: '笔记',
  [NodeTag.QUESTION]: '问题'
};

// 标签颜色映射
export const NODE_TAG_COLORS: Record<NodeTag, string> = {
  [NodeTag.PROJECT]: '#4CAF50',   // 绿色
  [NodeTag.PROGRESS]: '#2196F3',  // 蓝色
  [NodeTag.TODO]: '#FF9800',      // 橙色
  [NodeTag.NOTE]: '#9C27B0',      // 紫色
  [NodeTag.QUESTION]: '#FF5722'   // 深橙色
};

// 扩展脑图数据类型中的节点数据，添加标签字段
export interface MindMapNodeData {
  id: string;
  text: string;
  tags?: NodeTag[];
  [key: string]: any;
}

// 记事本类型枚举
export enum NotebookType {
  MINDMAP = 'mindmap',    // 思维导图
  MARKDOWN = 'markdown'   // Markdown
}

// 记事本基础接口
export interface BaseNotebook {
  id: string;
  title: string;
  type: NotebookType;
  lastUpdated: string;
}

// 思维导图记事本
export interface MindMapNotebook extends BaseNotebook {
  type: NotebookType.MINDMAP;
  rootId: string;
  theme?: string;
  data: {
    [key: string]: {
      data: MindMapNodeData;
      children?: string[];
    };
  };
}

// Markdown记事本
export interface MarkdownNotebook extends BaseNotebook {
  type: NotebookType.MARKDOWN;
  content: string;
} 