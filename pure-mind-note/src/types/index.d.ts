export interface NoteMetadata {
    id: string;
    title: string;
    path: string;
    categoryId: string;
    subCategoryId?: string;
    lastUpdated: string;
    type: NotebookType;
}
export interface Category {
    id: string;
    name: string;
    subCategories: SubCategory[];
}
export interface SubCategory {
    id: string;
    name: string;
    parentId: string;
}
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
export interface ThemeConfig {
    mode: 'light' | 'dark' | 'system';
    fontSize: 'small' | 'medium' | 'large';
}
export interface UserConfig {
    workspacePath: string;
    theme?: ThemeConfig;
    [key: string]: any;
}
export interface AppState {
    categories: Category[];
    notes: NoteMetadata[];
    activeNote: NoteMetadata | null;
    userConfig: UserConfig;
}
export declare enum NodeTag {
    PROJECT = "project",// 项目
    PROGRESS = "progress",// 进展
    TODO = "todo",// TODO
    NOTE = "note",// 笔记
    QUESTION = "question"
}
export declare const NODE_TAG_LABELS: Record<NodeTag, string>;
export declare const NODE_TAG_COLORS: Record<NodeTag, string>;
export interface MindMapNodeData {
    id: string;
    text: string;
    tags?: NodeTag[];
    [key: string]: any;
}
export declare enum NotebookType {
    MINDMAP = "mindmap",// 思维导图
    MARKDOWN = "markdown"
}
export interface BaseNotebook {
    id: string;
    title: string;
    type: NotebookType;
    lastUpdated: string;
}
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
export interface MarkdownNotebook extends BaseNotebook {
    type: NotebookType.MARKDOWN;
    content: string;
}
