import './MindMapEditor.css';
declare global {
    interface Window {
        PureMindNote?: {
            getCurrentNoteData?: () => any;
            saveCurrentNote?: (data: any) => void;
            [key: string]: any;
        };
        _mindMap?: any;
    }
}
export default function MindMapEditorWithVersion(): import("react/jsx-runtime").JSX.Element;
