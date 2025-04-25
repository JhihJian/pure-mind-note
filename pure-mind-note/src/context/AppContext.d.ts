import React, { ReactNode } from 'react';
import { AppState, MindMapData, UserConfig } from '../types';
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
export declare const AppProvider: React.FC<{
    children: ReactNode;
}>;
export declare const useAppContext: () => AppContextProps;
export {};
