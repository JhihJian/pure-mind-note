import { UserConfig } from '../types';
import { invoke } from '@tauri-apps/api/core';
import { appDataDir } from '@tauri-apps/api/path';
import { BaseDirectory, exists, readTextFile, writeTextFile } from '@tauri-apps/plugin-fs';

// 配置文件名
const CONFIG_FILE_NAME = 'app-config.json';

// 获取配置文件路径
async function getConfigFilePath(): Promise<string> {
  try {
    const appDir = await appDataDir();
    return `${appDir}/${CONFIG_FILE_NAME}`;
  } catch (error) {
    console.error('获取应用数据目录失败:', error);
    // 开发环境或非Tauri环境下的备用方案
    return `./${CONFIG_FILE_NAME}`;
  }
}

// 默认配置
const defaultConfig: UserConfig = {
  workspacePath: ''
};

// 保存配置到文件
export async function saveConfig(config: UserConfig): Promise<void> {
  try {
    // 首先使用localStorage作为备份存储
    try {
      localStorage.setItem('userConfig', JSON.stringify(config));
    } catch (error) {
      console.warn('保存到localStorage失败，将仅保存到文件:', error);
    }
    
    // 然后保存到文件
    const configPath = await getConfigFilePath();
    await writeTextFile(configPath, JSON.stringify(config, null, 2));
    console.log('配置已保存到文件:', configPath);
  } catch (error) {
    console.error('保存配置文件失败:', error);
    throw new Error(`无法保存配置: ${error}`);
  }
}

// 从文件加载配置
export async function loadConfig(): Promise<UserConfig> {
  try {
    // 先尝试从文件读取
    const configPath = await getConfigFilePath();
    const fileExists = await exists(configPath);
    
    if (fileExists) {
      const configData = await readTextFile(configPath);
      const config = JSON.parse(configData) as UserConfig;
      
      // 同时更新localStorage
      try {
        localStorage.setItem('userConfig', JSON.stringify(config));
      } catch (error) {
        console.warn('更新localStorage失败:', error);
      }
      
      return config;
    }
    
    // 如果文件不存在，尝试从localStorage读取
    try {
      const storedConfig = localStorage.getItem('userConfig');
      if (storedConfig) {
        const config = JSON.parse(storedConfig) as UserConfig;
        // 同步到文件系统
        await saveConfig(config);
        return config;
      }
    } catch (error) {
      console.warn('从localStorage读取失败:', error);
    }
    
    // 如果都没有，返回默认配置并保存
    await saveConfig(defaultConfig);
    return defaultConfig;
  } catch (error) {
    console.error('加载配置文件失败:', error);
    return defaultConfig;
  }
}

// 测试配置是否可以正常保存和加载
export async function testConfigStorage(): Promise<boolean> {
  try {
    const testConfig: UserConfig = {
      workspacePath: '__test__',
      _testTimestamp: Date.now()
    };
    
    // 保存测试配置
    await saveConfig(testConfig);
    
    // 加载配置
    const loadedConfig = await loadConfig();
    
    // 检查是否正确加载
    return loadedConfig.workspacePath === '__test__' && 
           loadedConfig._testTimestamp === testConfig._testTimestamp;
  } catch (error) {
    console.error('配置存储测试失败:', error);
    return false;
  }
} 