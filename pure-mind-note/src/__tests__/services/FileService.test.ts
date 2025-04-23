import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as FileService from '../../services/FileService';
import { invoke } from '@tauri-apps/api/core';
import { exists, mkdir } from '@tauri-apps/plugin-fs';
import { appDataDir } from '@tauri-apps/api/path';

// 模拟tauri依赖
vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(),
}));

vi.mock('@tauri-apps/plugin-fs', () => ({
  exists: vi.fn(),
  mkdir: vi.fn(),
}));

vi.mock('@tauri-apps/api/path', () => ({
  appDataDir: vi.fn(),
}));

describe('FileService', () => {
  const defaultDataDir = '/default/app/data/dir';
  const customDataDir = '/custom/workspace/path';

  beforeEach(() => {
    // 重置所有模拟
    vi.resetAllMocks();
    
    // 设置模拟默认返回值
    vi.mocked(appDataDir).mockResolvedValue(defaultDataDir);
    vi.mocked(exists).mockResolvedValue(false);
    vi.mocked(mkdir).mockResolvedValue(undefined);
    vi.mocked(invoke).mockResolvedValue('默认分类');
    
    // 重置自定义工作区路径
    FileService.setCustomWorkspacePath(null);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('getDataDir (通过其他函数间接测试)', () => {
    it('当appDataDir失败时应该使用备用路径', async () => {
      // 模拟appDataDir失败
      vi.mocked(appDataDir).mockRejectedValue(new Error('获取应用数据目录失败'));
      
      // 执行测试
      await FileService.initializeWorkspace();
      
      // 应该使用备用路径 './data'
      expect(exists).toHaveBeenCalledWith('./data');
      expect(invoke).toHaveBeenCalledWith('create_category', { 
        dataDir: './data', 
        name: '默认分类' 
      });
    });
  });

  describe('initializeWorkspace', () => {
    it('应该使用默认应用数据目录初始化工作区', async () => {
      // 执行测试
      await FileService.initializeWorkspace();
      
      // 检查是否调用了appDataDir获取默认路径
      expect(appDataDir).toHaveBeenCalled();
      
      // 检查是否检查目录存在性
      expect(exists).toHaveBeenCalledWith(defaultDataDir);
      
      // 检查是否创建了目录
      expect(mkdir).toHaveBeenCalledWith(defaultDataDir, { recursive: true });
      
      // 检查是否调用了create_category来创建默认分类
      expect(invoke).toHaveBeenCalledWith('create_category', { 
        dataDir: defaultDataDir, 
        name: '默认分类' 
      });
    });

    it('应该使用自定义路径初始化工作区', async () => {
      // 执行测试
      await FileService.initializeWorkspace(customDataDir);
      
      // 检查appDataDir不应该被调用，因为我们提供了自定义路径
      expect(appDataDir).not.toHaveBeenCalled();
      
      // 检查是否检查了自定义目录的存在性
      expect(exists).toHaveBeenCalledWith(customDataDir);
      
      // 检查是否创建了自定义目录
      expect(mkdir).toHaveBeenCalledWith(customDataDir, { recursive: true });
      
      // 检查是否在自定义路径中创建了默认分类
      expect(invoke).toHaveBeenCalledWith('create_category', { 
        dataDir: customDataDir, 
        name: '默认分类' 
      });
    });

    it('如果目录已存在，不应该创建目录', async () => {
      // 模拟目录已存在
      vi.mocked(exists).mockResolvedValue(true);
      
      // 执行测试
      await FileService.initializeWorkspace();
      
      // 检查是否检查了目录存在性
      expect(exists).toHaveBeenCalledWith(defaultDataDir);
      
      // 检查mkdir不应该被调用，因为目录已存在
      expect(mkdir).not.toHaveBeenCalled();
      
      // 检查是否仍然尝试创建默认分类
      expect(invoke).toHaveBeenCalledWith('create_category', { 
        dataDir: defaultDataDir, 
        name: '默认分类' 
      });
    });

    it('应该处理创建分类时的错误', async () => {
      // 模拟创建分类失败
      const error = new Error('调用失败');
      vi.mocked(invoke).mockRejectedValue(error);
      
      // 执行测试
      await FileService.initializeWorkspace();
      
      // 应该不会抛出错误，只会记录警告
      expect(invoke).toHaveBeenCalledWith('create_category', { 
        dataDir: defaultDataDir, 
        name: '默认分类' 
      });
    });

    it('如果mkdir失败，应该抛出错误', async () => {
      // 模拟mkdir失败
      const mkdirError = new Error('无法创建目录');
      vi.mocked(mkdir).mockRejectedValue(mkdirError);
      
      // 执行测试并期望它抛出错误
      await expect(FileService.initializeWorkspace()).rejects.toThrow('无法初始化工作区');
    });
  });

  describe('setCustomWorkspacePath', () => {
    it('应该更新自定义工作区路径', async () => {
      // 设置自定义路径
      FileService.setCustomWorkspacePath(customDataDir);
      
      // 初始化工作区
      await FileService.initializeWorkspace();
      
      // 应该使用自定义路径，而不是默认路径
      expect(appDataDir).not.toHaveBeenCalled();
      expect(exists).toHaveBeenCalledWith(customDataDir);
      expect(invoke).toHaveBeenCalledWith('create_category', { 
        dataDir: customDataDir, 
        name: '默认分类' 
      });
    });

    it('设置null应该重置为默认路径', async () => {
      // 先设置自定义路径
      FileService.setCustomWorkspacePath(customDataDir);
      
      // 然后重置它
      FileService.setCustomWorkspacePath(null);
      
      // 初始化工作区
      await FileService.initializeWorkspace();
      
      // 应该回到使用默认路径
      expect(appDataDir).toHaveBeenCalled();
      expect(exists).toHaveBeenCalledWith(defaultDataDir);
      expect(invoke).toHaveBeenCalledWith('create_category', { 
        dataDir: defaultDataDir, 
        name: '默认分类' 
      });
    });
  });
}); 