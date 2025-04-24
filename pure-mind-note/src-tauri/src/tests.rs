#[cfg(test)]
mod tests {
    use std::fs;
    use tempfile::tempdir;
    use serde_json::json;

    // 测试读取和保存笔记函数
    // 注意：这些函数需要在main.rs中定义或重新实现
    // 以下为测试逻辑，您需要确保在main.rs中实现相应的函数

    #[test]
    fn test_file_operations() {
        // 创建临时目录
        let temp_dir = tempdir().expect("无法创建临时目录");
        let file_path = temp_dir.path().join("test_note.json");
        let _file_path_str = file_path.to_string_lossy().to_string();
        
        // 测试数据
        let content = json!({
            "id": "test123",
            "title": "测试笔记",
            "data": {
                "root": {
                    "data": {
                        "id": "root",
                        "text": "测试标题"
                    }
                }
            }
        }).to_string();
        
        // 写入文件
        fs::write(&file_path, &content).expect("无法写入测试文件");
        
        // 确认文件存在
        assert!(file_path.exists(), "文件未成功创建");
        
        // 读取文件
        let read_content = fs::read_to_string(&file_path).expect("无法读取文件");
        
        // 验证内容
        assert_eq!(read_content, content, "读取的内容与写入的内容不匹配");
    }
    
    #[test]
    fn test_directory_operations() {
        // 创建临时目录
        let temp_dir = tempdir().expect("无法创建临时目录");
        let _base_dir = temp_dir.path().to_string_lossy().to_string();
        
        // 测试创建目录结构
        let category_path = temp_dir.path().join("学习笔记");
        fs::create_dir(&category_path).expect("无法创建分类目录");
        
        let subcategory_path = category_path.join("编程语言");
        fs::create_dir(&subcategory_path).expect("无法创建子分类目录");
        
        // 确认目录已创建
        assert!(category_path.exists() && category_path.is_dir(), "分类目录未创建");
        assert!(subcategory_path.exists() && subcategory_path.is_dir(), "子分类目录未创建");
        
        // 创建测试笔记
        let note_path = subcategory_path.join("Rust基础.json");
        let note_content = json!({
            "id": "note1",
            "title": "Rust基础",
            "lastUpdated": "2023-07-01T10:00:00Z"
        }).to_string();
        
        fs::write(&note_path, &note_content).expect("无法创建笔记文件");
        
        // 确认笔记文件已创建
        assert!(note_path.exists(), "笔记文件未创建");
    }
    
    #[test]
    fn test_error_handling() {
        // 测试读取不存在的文件
        let result = fs::read_to_string("不存在的文件.json");
        assert!(result.is_err(), "读取不存在的文件应该失败");
        
        // 创建一个临时文件夹
        let temp_dir = tempdir().expect("无法创建临时目录");
        
        // 测试在不存在的路径中创建目录
        let nested_dir = temp_dir.path().join("level1").join("level2").join("level3");
        let result = fs::create_dir_all(&nested_dir);
        assert!(result.is_ok(), "创建嵌套目录应该成功");
        assert!(nested_dir.exists(), "嵌套目录应该被创建");
    }

    // 测试分类管理相关功能
    #[test]
    fn test_category_operations() {
        use app_lib::commands::{get_all_categories, create_category, create_subcategory};
        
        // 创建临时目录作为数据目录
        let temp_dir = tempdir().expect("无法创建临时目录");
        let data_dir = temp_dir.path().to_string_lossy().to_string();
        
        // 初始状态应该没有分类
        let categories = get_all_categories(data_dir.clone()).expect("获取分类失败");
        assert!(categories.is_empty(), "新创建的目录应该没有任何分类");
        
        // 测试创建分类
        let category_name = "学习笔记";
        let category_id = create_category(data_dir.clone(), category_name.to_string())
            .expect("创建分类失败");
        
        assert_eq!(category_id, category_name, "分类ID应该与名称相同");
        
        // 确认分类目录已创建
        let category_path = temp_dir.path().join(category_name);
        assert!(category_path.exists() && category_path.is_dir(), "分类目录未创建");
        
        // 获取更新后的分类列表
        let categories = get_all_categories(data_dir.clone()).expect("获取分类失败");
        assert_eq!(categories.len(), 1, "应该有一个分类");
        assert_eq!(categories[0].id, category_name);
        assert_eq!(categories[0].name, category_name);
        assert!(categories[0].sub_categories.is_empty(), "新分类不应该有子分类");
        
        // 测试创建子分类
        let subcategory_name = "编程语言";
        let subcategory_id = create_subcategory(
            data_dir.clone(), 
            category_name.to_string(), 
            subcategory_name.to_string()
        ).expect("创建子分类失败");
        
        assert_eq!(subcategory_id, subcategory_name, "子分类ID应该与名称相同");
        
        // 确认子分类目录已创建
        let subcategory_path = category_path.join(subcategory_name);
        assert!(subcategory_path.exists() && subcategory_path.is_dir(), "子分类目录未创建");
        
        // 验证更新后的分类列表
        let categories = get_all_categories(data_dir.clone()).expect("获取分类失败");
        assert_eq!(categories.len(), 1, "应该只有一个分类");
        assert_eq!(categories[0].sub_categories.len(), 1, "分类应该有一个子分类");
        
        let subcategory = &categories[0].sub_categories[0];
        assert_eq!(subcategory.id, subcategory_name);
        assert_eq!(subcategory.name, subcategory_name);
        assert_eq!(subcategory.parent_id, category_name);
        
        // 测试创建多个分类和子分类
        let category_name2 = "工作文档";
        create_category(data_dir.clone(), category_name2.to_string())
            .expect("创建第二个分类失败");
            
        let subcategory_name2 = "会议记录";
        create_subcategory(
            data_dir.clone(), 
            category_name2.to_string(), 
            subcategory_name2.to_string()
        ).expect("创建第二个子分类失败");
        
        let subcategory_name3 = "项目计划";
        create_subcategory(
            data_dir.clone(), 
            category_name2.to_string(), 
            subcategory_name3.to_string()
        ).expect("创建第三个子分类失败");
        
        // 验证最终的分类结构
        let categories = get_all_categories(data_dir.clone()).expect("获取分类失败");
        assert_eq!(categories.len(), 2, "应该有两个分类");
        
        // 找到工作文档分类
        let work_category = categories.iter()
            .find(|c| c.id == category_name2)
            .expect("未找到工作文档分类");
            
        assert_eq!(work_category.sub_categories.len(), 2, "工作文档分类应该有两个子分类");
        
        // 测试错误处理：无效的分类路径
        let result = create_subcategory(
            data_dir.clone(), 
            "不存在的分类".to_string(), 
            "测试子分类".to_string()
        );
        
        // 这里应该成功创建目录，因为create_dir_all会创建所有必要的父目录
        assert!(result.is_ok(), "在不存在的分类下创建子分类应该能成功");
    }
}
