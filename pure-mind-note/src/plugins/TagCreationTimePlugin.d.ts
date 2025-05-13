/**
 * 节点标签时间插件的类型定义
 */
declare class NodeCreationTimePlugin {
  static instanceName: string;
  
  private mindMap: any;
  private handlers: { [key: string]: (...args: any[]) => void };
  
  constructor(options: { mindMap: any });
  
  /**
   * 初始化插件
   */
  init(): void;
  
  /**
   * 绑定事件处理器
   */
  private bindEvents(): void;
  
  /**
   * 解绑事件处理器
   */
  private unbindEvents(): void;
  
  /**
   * 设置节点标签事件处理函数
   */
  private onSetNodeTag(node: any): void;
  
  /**
   * 为节点添加标签设置时间
   */
  private addTagTimeToNode(node: any): void;
  
  /**
   * 插件移除前的清理工作
   */
  beforePluginRemove(): void;
  
  /**
   * 插件销毁前的清理工作
   */
  beforePluginDestroy(): void;
}

export default NodeCreationTimePlugin; 