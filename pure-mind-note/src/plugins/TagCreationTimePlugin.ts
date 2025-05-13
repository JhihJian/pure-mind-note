/**
 * 节点标签时间插件
 * 在设置节点标签时自动记录时间
 */
class TagCreationTimePlugin {

  // 插件实例名称，后续可通过 mindMap.nodeCreationTime 访问插件实例
  static instanceName = 'nodeCreationTime';
  
  // 思维导图实例
  private mindMap: any;
  // 绑定的事件处理器
  private handlers: { [key: string]: (...args: any[]) => void } = {};

  constructor({ mindMap }: { mindMap: any }) {
    this.mindMap = mindMap;
    
    // 初始化插件
    this.init();
  }

  /**
   * 初始化插件
   */
  init() {
    try {
      console.log('节点标签时间插件：初始化');
      
      // 绑定事件处理器
      this.bindEvents();
      
      console.log('节点标签时间插件：初始化成功');
    } catch (e) {
      console.error('节点标签时间插件：初始化失败', e);
    }
  }

  /**
   * 绑定事件处理器
   */
  private bindEvents(): void {
    // 创建事件处理函数并保持引用，以便后续解绑
    this.handlers = {
      onSetNodeTag: this.onSetNodeTag.bind(this),
    };

    // 只监听标签设置事件
    this.mindMap.on('set_node_tag', this.handlers.onSetNodeTag);
    
    console.log('节点标签时间插件：已注册set_node_tag事件监听器');
  }

  /**
   * 解绑事件处理器
   */
  private unbindEvents(): void {
    // 移除标签设置事件监听
    this.mindMap.off('set_node_tag', this.handlers.onSetNodeTag);
  }

  /**
   * 设置节点标签事件处理函数
   */
  private onSetNodeTag(node: any): void {
    console.log('节点标签时间插件：监听到set_node_tag事件');
    this.addTagTimeToNode(node);
  }

  /**
   * 为节点添加标签设置时间
   */
  private addTagTimeToNode(node: any) {
    try {
      if (!node) {
        console.warn('节点标签时间插件：收到无效节点');
        return;
      }
      
      // 获取当前时间（东八区，UTC+8）
      const now = new Date();
      // 添加8小时以转换为东八区时间
      const beijingTime = new Date(now.getTime() + 8 * 60 * 60 * 1000);
      const tagTime = beijingTime.toISOString();

      // 更新节点数据
      if (typeof node.setData === 'function') {
        node.setData({ tagCreateTime: tagTime });
        console.log('节点标签时间插件：为节点添加标签时间 -', tagTime);
      } else {
        console.warn('节点标签时间插件：无法设置tagCreateTime，节点没有setData方法');
      }
    } catch (e) {
      console.error('节点标签时间插件：添加标签时间失败', e);
    }
  }

  /**
   * 插件移除前的清理工作
   */
  beforePluginRemove() {
    // 解绑事件监听器
    this.unbindEvents();
    console.log('节点标签时间插件：清理资源');
  }

  /**
   * 插件销毁前的清理工作
   */
  beforePluginDestroy() {
    this.beforePluginRemove();
  }
}

export default TagCreationTimePlugin; 