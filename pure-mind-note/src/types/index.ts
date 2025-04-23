// 定义笔记的基本类型
export interface MindMapData {
  id: string;
  title: string;
  rootId: string;
  theme?: string;
  lastUpdated: string;
  data: {
    // Mind-map组件所需的数据结构
    root: MindMapNode;
    // 可能包含更多字段，根据 simple-mind-map 库的要求
  };
}

// 思维导图节点类型
export interface MindMapNode {
  data: {
    id: string;
    text: string;
    [key: string]: any;
  };
  children?: MindMapNode[];
  [key: string]: any;
}

// 笔记元数据，用于显示在侧边栏
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

// 应用状态类型
export interface AppState {
  categories: Category[];
  activeNote: NoteMetadata | null;
  notes: NoteMetadata[];
} 