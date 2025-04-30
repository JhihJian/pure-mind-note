import { NodeTag } from '../types';

/**
 * 标签删除插件
 * 允许用户右键点击标签时删除该标签
 */
class TagDeletePlugin {
  // 插件实例名称，后续可通过 mindMap.tagDelete 访问插件实例
  static instanceName = 'tagDelete';
  
  // 思维导图实例
  private mindMap: any;
  // 右键菜单插件实例
  private contextMenu: any;
  // 当前节点
  private currentNode: any = null;
  // 右键点击的标签
  private clickedTag: NodeTag | null = null;

  constructor({ mindMap }: { mindMap: any }) {
    this.mindMap = mindMap;
    
    // 获取右键菜单插件实例
    this.contextMenu = mindMap.contextMenu;
    
    // 初始化插件
    this.init();
  }

  /**
   * 初始化插件
   */
  init() {
    // 注册右键菜单
    this.registerContextMenu();
    
    // 监听节点激活事件
    this.mindMap.on('node_active', (node: any) => {
      this.currentNode = node;
    });
    
    // 监听节点右键菜单事件
    this.mindMap.on('contextmenu', (e: MouseEvent, node: any) => {
      this.currentNode = node;
      
      // 检查是否点击的是标签
      if (this.isClickOnTag(e, node)) {
        e.preventDefault();
        e.stopPropagation();
        
        // 显示标签右键菜单
        this.showTagContextMenu(e);
      }
    });
  }

  /**
   * 判断是否点击在标签上
   */
  isClickOnTag(e: MouseEvent, node: any): boolean {
    try {
      // 获取节点的标签数据
      const tags = this.getNodeTags(node);
      if (!tags || tags.length === 0) return false;
      
      // 获取节点元素
      let nodeEl;
      if (typeof node.getNodeElement === 'function') {
        nodeEl = node.getNodeElement();
      } else if (node.nodeElement) {
        nodeEl = node.nodeElement;
      } else if (node.el) {
        nodeEl = node.el;
      } else {
        console.log('无法获取节点元素');
        return false;
      }
      
      if (!nodeEl) return false;
      
      console.log('检测点击位置:', e.clientX, e.clientY);
      
      // 获取节点位置信息
      let rect;
      try {
        rect = nodeEl.getBoundingClientRect();
        console.log('节点位置:', rect);
      } catch (e) {
        console.error('获取节点位置失败:', e);
        return false;
      }
      
      const { clientX, clientY } = e;
      
      // 扩大标签点击区域，标签通常在节点上方显示
      // 为了提高用户体验，我们认为节点上方一定区域内的点击都是点击标签
      const tagArea = {
        left: rect.left,
        right: rect.right,
        top: rect.top - 25, // 标签位置在节点上方约20-25px
        bottom: rect.top
      };
      
      const isInTagArea = 
        clientX >= tagArea.left && 
        clientX <= tagArea.right &&
        clientY >= tagArea.top && 
        clientY <= tagArea.bottom;
      
      if (isInTagArea) {
        console.log('点击在标签区域内');
        
        // 当点击在标签区域时，确定点击的是哪个标签
        this.clickedTag = this.determineClickedTag(e, node, tags, rect);
        
        if (this.clickedTag) {
          console.log('识别到点击标签:', this.clickedTag);
          return true;
        }
      }
      
      return false;
    } catch (e) {
      console.error('检测标签点击失败:', e);
      return false;
    }
  }
  
  /**
   * 确定点击的是哪个标签
   */
  determineClickedTag(e: MouseEvent, node: any, tags: NodeTag[], rect: DOMRect): NodeTag | null {
    try {
      const { clientX } = e;
      
      // 对于horizontal布局，标签位于节点上方，水平分布
      const nodeWidth = rect.width;
      const centerX = rect.left + nodeWidth / 2;
      
      // 标签点的间距
      const tagWidth = 10; // 每个标签点的宽度
      const tagSpacing = 10; // 标签点之间的间距
      
      // 计算所有标签的总宽度
      const totalWidth = tags.length * tagWidth + (tags.length - 1) * tagSpacing;
      // 第一个标签的起始位置
      const firstTagX = centerX - totalWidth / 2;
      
      console.log('标签数据:', tags, '计算宽度:', totalWidth, '起始位置:', firstTagX);
      
      // 确定点击的是哪个标签
      for (let i = 0; i < tags.length; i++) {
        const tagX = firstTagX + i * (tagWidth + tagSpacing);
        const tagEndX = tagX + tagWidth;
        
        if (clientX >= tagX && clientX <= tagEndX) {
          console.log(`点击标签${i}:`, tags[i], '位置:', tagX, '-', tagEndX);
          return tags[i];
        }
      }
      
      // 如果无法精确判断，当只有一个标签时，直接返回该标签
      if (tags.length === 1) {
        console.log('单标签自动选择:', tags[0]);
        return tags[0];
      }
      
      console.log('未能确定点击的具体标签');
      return null;
    } catch (e) {
      console.error('确定点击标签失败:', e);
      return null;
    }
  }
  
  /**
   * 获取节点的标签
   */
  getNodeTags(node: any): NodeTag[] {
    try {
      // 尝试各种可能的方式获取标签数据
      let tags = null;
      
      // 方法1: 使用getData获取
      if (typeof node.getData === 'function') {
        tags = node.getData('tag');
      }
      
      // 方法2: 直接从data属性获取
      if (!tags && node.data && node.data.tag) {
        tags = node.data.tag;
      }
      
      // 方法3: 从_data属性获取
      if (!tags && node._data && node._data.tag) {
        tags = node._data.tag;
      }
      
      // 方法4: 从node._nodeData.data.data获取
      if (!tags && node._nodeData && node._nodeData.data && node._nodeData.data.data) {
        tags = node._nodeData.data.data.tag;
      }
      
      // 兼容性检查，处理tags属性
      if (!tags) {
        // 使用getData获取tags
        if (typeof node.getData === 'function') {
          tags = node.getData('tags');
        }
        
        // 直接从data属性获取tags
        if (!tags && node.data && node.data.tags) {
          tags = node.data.tags;
        }
      }
      
      return Array.isArray(tags) ? tags : [];
    } catch (e) {
      console.error('获取节点标签失败:', e);
      return [];
    }
  }
  
  /**
   * 显示标签右键菜单
   */
  showTagContextMenu(e: MouseEvent) {
    try {
      // 如果没有右键菜单插件或者没有点击标签，则不显示菜单
      if (!this.contextMenu) {
        console.error('右键菜单插件不存在');
        return;
      }
      
      if (!this.clickedTag) {
        console.error('未检测到点击的标签');
        return;
      }
      
      // 获取菜单插件API
      let showMenuFn: Function | null = null;
      
      // 检查右键菜单插件的API形式
      if (typeof this.contextMenu.show === 'function') {
        showMenuFn = this.contextMenu.show.bind(this.contextMenu);
      } else if (typeof this.contextMenu.showContextMenu === 'function') {
        showMenuFn = this.contextMenu.showContextMenu.bind(this.contextMenu);
      } else {
        console.error('右键菜单插件没有可用的显示方法');
        
        // 兜底方案：创建一个DOM菜单
        this.showDOMContextMenu(e);
        return;
      }
      
      console.log('准备显示标签右键菜单:', this.clickedTag);
      
      // 准备菜单项
      const menuData = [
        {
          name: `删除标签: ${this.clickedTag}`,
          onClick: () => {
            this.deleteTag(this.currentNode, this.clickedTag);
          }
        }
      ];
      
      // 显示菜单
      try {
        if (showMenuFn) {
          showMenuFn(menuData, e);
          console.log('标签右键菜单已显示');
        } else {
          console.error('菜单显示函数为空');
          this.showDOMContextMenu(e);
        }
      } catch (error) {
        console.error('显示右键菜单失败:', error);
        
        // 兜底方案：创建一个DOM菜单
        this.showDOMContextMenu(e);
      }
    } catch (error) {
      console.error('显示标签右键菜单失败:', error);
    }
  }
  
  /**
   * 创建DOM右键菜单（兜底方案）
   */
  showDOMContextMenu(e: MouseEvent) {
    try {
      // 如果没有点击标签，不显示菜单
      if (!this.clickedTag) return;
      
      console.log('使用DOM创建右键菜单');
      
      // 移除已存在的菜单
      const existingMenu = document.getElementById('tag-context-menu');
      if (existingMenu) {
        document.body.removeChild(existingMenu);
      }
      
      // 创建菜单元素
      const menuEl = document.createElement('div');
      menuEl.id = 'tag-context-menu';
      menuEl.style.position = 'fixed';
      menuEl.style.left = `${e.clientX}px`;
      menuEl.style.top = `${e.clientY}px`;
      menuEl.style.backgroundColor = 'white';
      menuEl.style.border = '1px solid #ccc';
      menuEl.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
      menuEl.style.borderRadius = '4px';
      menuEl.style.padding = '4px 0';
      menuEl.style.zIndex = '9999';
      
      // 创建菜单项
      const menuItem = document.createElement('div');
      menuItem.textContent = `删除标签: ${this.clickedTag}`;
      menuItem.style.padding = '6px 20px';
      menuItem.style.cursor = 'pointer';
      menuItem.style.fontSize = '14px';
      
      // 添加悬停效果
      menuItem.addEventListener('mouseover', () => {
        menuItem.style.backgroundColor = '#f0f0f0';
      });
      
      menuItem.addEventListener('mouseout', () => {
        menuItem.style.backgroundColor = 'transparent';
      });
      
      // 添加点击事件
      menuItem.addEventListener('click', () => {
        this.deleteTag(this.currentNode, this.clickedTag);
        document.body.removeChild(menuEl);
      });
      
      // 添加菜单项到菜单
      menuEl.appendChild(menuItem);
      
      // 添加菜单到页面
      document.body.appendChild(menuEl);
      
      // 点击其他区域关闭菜单
      const closeMenu = (event: MouseEvent) => {
        if (!menuEl.contains(event.target as Node)) {
          document.body.removeChild(menuEl);
          document.removeEventListener('click', closeMenu);
        }
      };
      
      // 等待当前事件结束后再添加点击监听
      setTimeout(() => {
        document.addEventListener('click', closeMenu);
      }, 0);
      
      console.log('DOM右键菜单已创建');
    } catch (error) {
      console.error('创建DOM右键菜单失败:', error);
    }
  }
  
  /**
   * 注册右键菜单
   */
  registerContextMenu() {
    // 如果没有右键菜单插件则不注册
    if (!this.contextMenu) return;
    
    // 可以在这里注册全局右键菜单项，但我们这里使用的是动态创建的菜单
  }
  
  /**
   * 删除指定标签
   */
  deleteTag(node: any, tagToDelete: NodeTag | null) {
    if (!node || !tagToDelete) return;
    
    try {
      // 获取当前节点的标签
      const currentTags = this.getNodeTags(node);
      if (currentTags.length === 0) return;
      
      // 过滤掉要删除的标签
      const newTags = currentTags.filter(tag => tag !== tagToDelete);
      
      // 更新节点标签
      this.updateNodeTags(node, newTags);
      
      // 触发渲染
      this.mindMap.render();
    } catch (e) {
      console.error('删除标签失败:', e);
    }
  }
  
  /**
   * 更新节点标签
   */
  updateNodeTags(node: any, tags: NodeTag[]) {
    // 优先使用setTag方法
    if (typeof node.setTag === 'function') {
      if (tags.length === 0) {
        node.setTag(null);
      } else {
        node.setTag(tags);
      }
      return;
    }
    
    // 备选方法
    if (typeof node.setData === 'function') {
      const nodeData = node.getData() || {};
      if (!nodeData.data) nodeData.data = {};
      
      if (tags.length === 0) {
        delete nodeData.data.tag;
      } else {
        nodeData.data.tag = tags;
      }
      
      node.setData(nodeData);
      return;
    }
    
    // 直接修改data属性
    if (node.data) {
      if (tags.length === 0) {
        delete node.data.tag;
      } else {
        node.data.tag = tags;
      }
      
      if (typeof node.update === 'function') {
        node.update();
      }
      return;
    }
  }
  
  /**
   * 插件被移除前执行
   */
  beforePluginRemove() {
    // 移除事件监听
    this.mindMap.off('node_active');
    this.mindMap.off('contextmenu');
  }
  
  /**
   * 插件被销毁前执行
   */
  beforePluginDestroy() {
    this.beforePluginRemove();
  }
}

export default TagDeletePlugin; 