#[cfg(test)]
mod tests {
    use std::fs;
    use tempfile::tempdir;
    use serde_json::json;
    use crate::*;

    // 测试读取和保存笔记函数
    // 注意：这些函数需要在main.rs中定义或重新实现
    // 以下为测试逻辑，您需要确保在main.rs中实现相应的函数

    #[test]
    fn test_file_operations() {
        // 创建临时目录
        let temp_dir = tempdir().expect("无法创建临时目录");
        let file_path = temp_dir.path().join("test_note.json");
        let file_path_str = file_path.to_string_lossy().to_string();
        
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
        let base_dir = temp_dir.path().to_string_lossy().to_string();
        
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
}
