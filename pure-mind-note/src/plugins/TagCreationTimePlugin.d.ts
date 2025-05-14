/**
 * 节点标签时间插件
 * 在设置节点标签时自动记录时间
 */
declare class TagCreationTimePlugin {
    static instanceName: string;
    private mindMap;
    private handlers;
    constructor({ mindMap }: {
        mindMap: any;
    });
    /**
     * 初始化插件
     */
    init(): void;
    /**
     * 绑定事件处理器
     */
    private bindEvents;
    /**
     * 解绑事件处理器
     */
    private unbindEvents;
    /**
     * 设置节点标签事件处理函数
     */
    private onSetNodeTag;
    /**
     * 为节点添加标签设置时间
     */
    private addTagTimeToNode;
    /**
     * 插件移除前的清理工作
     */
    beforePluginRemove(): void;
    /**
     * 插件销毁前的清理工作
     */
    beforePluginDestroy(): void;
}
export default TagCreationTimePlugin;
