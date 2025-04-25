export interface NoteMetadata {
    id: string;
    title: string;
    path: string;
    categoryId: string;
    subCategoryId?: string;
    lastUpdated: string;
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
            data: {
                id: string;
                text: string;
                [key: string]: any;
            };
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
