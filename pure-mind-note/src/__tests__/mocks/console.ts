import { vi } from 'vitest';

/**
 * 模拟控制台输出的工具函数
 * 在测试过程中禁用实际的控制台输出，以减少测试时的噪音
 */
export function mockConsole() {
  // 保存原始控制台方法
  const originalConsole = { ...console };
  
  // 模拟控制台方法
  console.log = vi.fn();
  console.error = vi.fn();
  console.warn = vi.fn();
  console.info = vi.fn();
  
  // 返回一个恢复函数，可以在需要时恢复原始控制台行为
  return () => {
    console.log = originalConsole.log;
    console.error = originalConsole.error;
    console.warn = originalConsole.warn;
    console.info = originalConsole.info;
  };
} 