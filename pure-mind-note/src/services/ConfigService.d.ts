import { UserConfig } from '../types';
export declare function saveConfig(config: UserConfig): Promise<void>;
export declare function loadConfig(): Promise<UserConfig>;
export declare function testConfigStorage(): Promise<boolean>;
