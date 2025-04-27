import { UserConfig } from '../types';
import { invoke } from '@tauri-apps/api/core';
import { appDataDir, join } from '@tauri-apps/api/path';
import { BaseDirectory, exists, readTextFile, writeTextFile, mkdir } from '@tauri-apps/plugin-fs';

// 配置文件名
const CONFIG_FILE_NAME = 'app-config.json';
const APP_DATA_FOLDER = 'pure-mind-note';

// 获取配置文件路径
async function getConfigFilePath(): Promise<string> {
  try {
    const appDir = await appDataDir();
    const appDataFolder = await join(appDir, APP_DATA_FOLDER);
    
    // 确保应用数据目录存在
    try {
      const folderExists = await exists(appDataFolder);
      if (!folderExists) {
        await mkdir(appDataFolder, { recursive: true });
        console.log('创建应用数据目录成功:', appDataFolder);
      }
    } catch (error) {
      console.error('检查或创建应用数据目录失败:', error);
    }
    
    return await join(appDataFolder, CONFIG_FILE_NAME);
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
    
    console.log('正在保存配置到文件:', configPath);
    await writeTextFile(configPath, JSON.stringify(config, null, 2));
    console.log('配置已成功保存到文件');
    
    // 验证保存是否成功
    const verifyExists = await exists(configPath);
    if (!verifyExists) {
      throw new Error(`配置文件保存验证失败: 文件不存在 ${configPath}`);
    }
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
    console.log('尝试从文件加载配置:', configPath);
    
    const fileExists = await exists(configPath);
    
    if (fileExists) {
      try {
        const configData = await readTextFile(configPath);
        const config = JSON.parse(configData) as UserConfig;
        
        // 同时更新localStorage
        try {
          localStorage.setItem('userConfig', JSON.stringify(config));
        } catch (error) {
          console.warn('更新localStorage失败:', error);
        }
        
        console.log('成功从文件加载配置');
        return config;
      } catch (error) {
        console.error('读取配置文件内容失败:', error);
        // 继续尝试其他方法
      }
    } else {
      console.log('配置文件不存在:', configPath);
    }
    
    // 如果文件不存在或读取失败，尝试从localStorage读取
    try {
      const storedConfig = localStorage.getItem('userConfig');
      if (storedConfig) {
        console.log('从localStorage加载配置');
        const config = JSON.parse(storedConfig) as UserConfig;
        // 同步到文件系统
        await saveConfig(config);
        return config;
      }
    } catch (error) {
      console.warn('从localStorage读取失败:', error);
    }
    
    // 如果都没有，返回默认配置并保存
    console.log('没有找到配置，使用默认配置');
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
    console.log('开始测试配置存储');
    const testConfig: UserConfig = {
      workspacePath: '__test__',
      _testTimestamp: Date.now()
    };
    
    // 保存测试配置
    await saveConfig(testConfig);
    
    // 加载配置
    const loadedConfig = await loadConfig();
    
    // 检查是否正确加载
    const isSuccess = loadedConfig.workspacePath === '__test__' && 
           loadedConfig._testTimestamp === testConfig._testTimestamp;
           
    console.log('配置存储测试结果:', isSuccess ? '成功' : '失败');
    return isSuccess;
  } catch (error) {
    console.error('配置存储测试失败:', error);
    return false;
  }
} 