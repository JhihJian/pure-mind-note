import { vi } from 'vitest';
import { mockConsole } from './mocks/console';

// 禁用控制台输出，避免测试时产生噪音
mockConsole();

// 模拟localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    })
  };
})();

// 设置全局变量
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
}); 