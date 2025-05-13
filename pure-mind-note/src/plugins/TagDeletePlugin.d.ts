import { NodeTag } from '../types';
/**
 * 标签删除插件
 * 允许用户右键点击标签时删除该标签
 */
declare class TagDeletePlugin {
    static instanceName: string;
    private mindMap;
    private contextMenu;
    private currentNode;
    private clickedTag;
    constructor({ mindMap }: {
        mindMap: any;
    });
    /**
     * 初始化插件
     */
    init(): void;
    /**
     * 判断是否点击在标签上
     */
    isClickOnTag(e: MouseEvent, node: any): boolean;
    /**
     * 确定点击的是哪个标签
     */
    determineClickedTag(e: MouseEvent, node: any, tags: NodeTag[], rect: DOMRect): NodeTag | null;
    /**
     * 获取节点的标签
     */
    getNodeTags(node: any): NodeTag[];
    /**
     * 显示标签右键菜单
     */
    showTagContextMenu(e: MouseEvent): void;
    /**
     * 创建DOM右键菜单（兜底方案）
     */
    showDOMContextMenu(e: MouseEvent): void;
    /**
     * 注册右键菜单
     */
    registerContextMenu(): void;
    /**
     * 删除指定标签
     */
    deleteTag(node: any, tagToDelete: NodeTag | null): void;
    /**
     * 更新节点标签
     */
    updateNodeTags(node: any, tags: NodeTag[]): void;
    /**
     * 插件被移除前执行
     */
    beforePluginRemove(): void;
    /**
     * 插件被销毁前执行
     */
    beforePluginDestroy(): void;
}
export default TagDeletePlugin;
