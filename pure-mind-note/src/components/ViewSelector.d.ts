import React from 'react';
import './ViewSelector.css';
export declare enum ViewType {
    MINDMAP = "mindmap",
    JSON = "json",
    TODO = "todo",
    QUESTION = "question",
    PROJECT = "project"
}
interface ViewSelectorProps {
    currentView: ViewType;
    onViewChange: (view: ViewType) => void;
}
declare const ViewSelector: React.FC<ViewSelectorProps>;
export default ViewSelector;
