import React from 'react';
import './Settings.css';
interface SettingsProps {
    isVisible: boolean;
    onClose: () => void;
}
declare const Settings: React.FC<SettingsProps>;
export default Settings;
