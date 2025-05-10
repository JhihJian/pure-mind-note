import { NoteMetadata, MindMapData, Category } from '../types';
export declare function setCustomWorkspacePath(path: string | null): void;
export declare function initializeWorkspace(customPath?: string): Promise<void>;
export declare function scanWorkspaceDirectory(): Promise<{
    categories: Category[];
    notes: NoteMetadata[];
}>;
export declare function getAllCategories(): Promise<Category[]>;
export declare function readNote(path: string): Promise<MindMapData>;
export declare function saveNote(path: string, data: MindMapData): Promise<void>;
export declare function getAllNotes(): Promise<NoteMetadata[]>;
export declare function createNote(title: string, categoryId: string, subCategoryId?: string): Promise<NoteMetadata>;
export declare function createCategory(name: string): Promise<string>;
export declare function createSubcategory(categoryId: string, name: string): Promise<string>;
export declare function deleteCategory(categoryId: string): Promise<void>;
export declare function deleteSubcategory(categoryId: string, subCategoryId: string): Promise<void>;
export declare function deleteNote(noteId: string): Promise<void>;
