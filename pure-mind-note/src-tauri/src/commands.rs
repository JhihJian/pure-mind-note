use std::{fs, path::{Path, PathBuf}};
use serde::{Deserialize, Serialize};
use std::io::Write;

// 定义笔记信息结构体
#[derive(Debug, Serialize, Deserialize)]
pub struct NoteInfo {
    pub id: String,
    pub title: String,
    pub path: String,
    pub category_id: String,
    pub sub_category_id: Option<String>,
    pub last_updated: String,
}

// 定义分类信息结构体
#[derive(Debug, Serialize, Deserialize)]
pub struct CategoryInfo {
    pub id: String,
    pub name: String,
    pub sub_categories: Vec<SubCategoryInfo>,
    pub created_time: String,
}

// 定义子分类信息结构体
#[derive(Debug, Serialize, Deserialize)]
pub struct SubCategoryInfo {
    pub id: String,
    pub name: String,
    pub parent_id: String,
    pub created_time: String,
}

// 读取笔记内容
#[tauri::command]
pub fn read_note(path: String) -> Result<String, String> {
    println!("[后端] 读取笔记文件: {}", path);
    match fs::read_to_string(&path) {
        Ok(content) => {
            println!("[后端] 成功读取文件，内容长度: {} 字符", content.len());
            Ok(content)
        },
        Err(e) => {
            println!("[后端] 读取文件失败: {}", e);
            Err(format!("无法读取笔记: {}", e))
        },
    }
}

// 保存笔记内容
#[tauri::command]
pub fn save_note(path: String, content: String) -> Result<(), String> {
    println!("[后端] 保存笔记到文件: {}", path);
    println!("[后端] 保存内容长度: {} 字符", content.len());
    
    // 确保目录存在
    if let Some(parent) = Path::new(&path).parent() {
        println!("[后端] 确保目录存在: {:?}", parent);
        fs::create_dir_all(parent).map_err(|e| format!("无法创建目录: {}", e))?;
    }
    
    // 写入文件
    let mut file = fs::File::create(&path).map_err(|e| format!("无法创建文件: {}", e))?;
    file.write_all(content.as_bytes()).map_err(|e| format!("无法写入文件: {}", e))?;
    
    println!("[后端] 文件保存成功: {}", path);
    Ok(())
}

// 获取所有笔记
#[tauri::command]
pub fn get_all_notes(data_dir: String) -> Result<Vec<NoteInfo>, String> {
    println!("[后端] 开始扫描笔记，数据目录: {}", data_dir);
    let mut notes = Vec::new();
    let base_path = PathBuf::from(&data_dir);
    
    // 确保数据目录存在
    if !base_path.exists() {
        println!("[后端] 数据目录不存在，创建目录: {}", data_dir);
        fs::create_dir_all(&base_path).map_err(|e| format!("无法创建数据目录: {}", e))?;
        return Ok(notes);
    }
    
    // 遍历分类目录
    for category_entry in fs::read_dir(&base_path).map_err(|e| format!("无法读取目录: {}", e))? {
        if let Ok(category_dir) = category_entry {
            let category_path = category_dir.path();
            
            // 确保这是一个目录
            if category_path.is_dir() {
                let category_id = category_path.file_name()
                    .and_then(|name| name.to_str())
                    .unwrap_or("unknown")
                    .to_string();
                
                // 遍历子分类目录
                for subcategory_entry in fs::read_dir(&category_path).map_err(|e| format!("无法读取子目录: {}", e))? {
                    if let Ok(subcategory_dir) = subcategory_entry {
                        let subcategory_path = subcategory_dir.path();
                        
                        // 如果是目录，则为子分类
                        if subcategory_path.is_dir() {
                            let subcategory_id = subcategory_path.file_name()
                                .and_then(|name| name.to_str())
                                .unwrap_or("unknown")
                                .to_string();
                            
                            // 读取子分类目录中的所有JSON文件
                            for note_entry in fs::read_dir(&subcategory_path).map_err(|e| format!("无法读取笔记: {}", e))? {
                                if let Ok(note_file) = note_entry {
                                    let note_path = note_file.path();
                                    
                                    // 确保这是一个JSON文件
                                    if note_path.is_file() && note_path.extension().and_then(|ext| ext.to_str()) == Some("json") {
                                        // 尝试解析文件名作为标题
                                        let title = note_path.file_stem()
                                            .and_then(|name| name.to_str())
                                            .unwrap_or("未命名笔记")
                                            .to_string();
                                        
                                        // 生成唯一的笔记ID，包含分类和子分类信息
                                        let note_id = format!("{}#{}#{}", category_id, subcategory_id, title);
                                        
                                        notes.push(NoteInfo {
                                            id: note_id,
                                            title,
                                            path: note_path.to_string_lossy().to_string(),
                                            category_id: category_id.clone(),
                                            sub_category_id: Some(subcategory_id.clone()),
                                            last_updated: fs::metadata(&note_path)
                                                .and_then(|meta| meta.modified())
                                                .map(|time| format!("{:?}", time))
                                                .unwrap_or_else(|_| "未知".to_string()),
                                        });
                                    }
                                }
                            }
                        } else if subcategory_path.is_file() && subcategory_path.extension().and_then(|ext| ext.to_str()) == Some("json") {
                            // 这是分类目录下的直接笔记文件
                            let title = subcategory_path.file_stem()
                                .and_then(|name| name.to_str())
                                .unwrap_or("未命名笔记")
                                .to_string();
                            
                            // 生成唯一的笔记ID，分类下的直接笔记
                            let note_id = format!("{}##{}", category_id, title);
                            
                            notes.push(NoteInfo {
                                id: note_id,
                                title,
                                path: subcategory_path.to_string_lossy().to_string(),
                                category_id: category_id.clone(),
                                sub_category_id: None,
                                last_updated: fs::metadata(&subcategory_path)
                                    .and_then(|meta| meta.modified())
                                    .map(|time| format!("{:?}", time))
                                    .unwrap_or_else(|_| "未知".to_string()),
                            });
                        }
                    }
                }
            }
        }
    }
    
    // 按创建时间排序（最新的在前）
    notes.sort_by(|a, b| {
        // 尝试解析时间字符串进行比较
        let time_a = fs::metadata(&a.path)
            .and_then(|meta| meta.created())
            .unwrap_or_else(|_| std::time::SystemTime::UNIX_EPOCH);
        let time_b = fs::metadata(&b.path)
            .and_then(|meta| meta.created())
            .unwrap_or_else(|_| std::time::SystemTime::UNIX_EPOCH);
        time_b.cmp(&time_a) // 降序排列，最新的在前
    });
    
    println!("[后端] 扫描完成，找到 {} 个笔记", notes.len());
    for note in &notes {
        println!("[后端] 笔记: ID={}, 标题={}, 路径={}", note.id, note.title, note.path);
    }
    
    Ok(notes)
}

// 获取所有分类
#[tauri::command]
pub fn get_all_categories(data_dir: String) -> Result<Vec<CategoryInfo>, String> {
    println!("[后端] 开始扫描分类，数据目录: {}", data_dir);
    let mut categories = Vec::new();
    let base_path = PathBuf::from(&data_dir);
    
    // 确保数据目录存在
    if !base_path.exists() {
        println!("[后端] 数据目录不存在，创建目录: {}", data_dir);
        fs::create_dir_all(&base_path).map_err(|e| format!("无法创建数据目录: {}", e))?;
        return Ok(categories);
    }
    
    // 遍历分类目录
    for category_entry in fs::read_dir(&base_path).map_err(|e| format!("无法读取目录: {}", e))? {
        if let Ok(category_dir) = category_entry {
            let category_path = category_dir.path();
            
            // 确保这是一个目录
            if category_path.is_dir() {
                let category_id = category_path.file_name()
                    .and_then(|name| name.to_str())
                    .unwrap_or("unknown")
                    .to_string();
                
                let mut sub_categories = Vec::new();
                
                // 遍历子分类目录
                for subcategory_entry in fs::read_dir(&category_path).map_err(|e| format!("无法读取子目录: {}", e))? {
                    if let Ok(subcategory_dir) = subcategory_entry {
                        let subcategory_path = subcategory_dir.path();
                        
                        // 如果是目录，则为子分类
                        if subcategory_path.is_dir() {
                            let subcategory_id = subcategory_path.file_name()
                                .and_then(|name| name.to_str())
                                .unwrap_or("unknown")
                                .to_string();
                            
                            let created_time = fs::metadata(&subcategory_path)
                                .and_then(|meta| meta.created())
                                .map(|time| format!("{:?}", time))
                                .unwrap_or_else(|_| "未知".to_string());
                            
                            sub_categories.push(SubCategoryInfo {
                                id: subcategory_id.clone(),
                                name: subcategory_id,
                                parent_id: category_id.clone(),
                                created_time,
                            });
                        }
                    }
                }
                
                // 按创建时间排序子分类（最新的在前）
                sub_categories.sort_by(|a, b| {
                    let time_a = fs::metadata(PathBuf::from(&data_dir).join(&category_id).join(&a.id))
                        .and_then(|meta| meta.created())
                        .unwrap_or_else(|_| std::time::SystemTime::UNIX_EPOCH);
                    let time_b = fs::metadata(PathBuf::from(&data_dir).join(&category_id).join(&b.id))
                        .and_then(|meta| meta.created())
                        .unwrap_or_else(|_| std::time::SystemTime::UNIX_EPOCH);
                    time_b.cmp(&time_a) // 降序排列，最新的在前
                });
                
                let created_time = fs::metadata(&category_path)
                    .and_then(|meta| meta.created())
                    .map(|time| format!("{:?}", time))
                    .unwrap_or_else(|_| "未知".to_string());
                
                categories.push(CategoryInfo {
                    id: category_id.clone(),
                    name: category_id,
                    sub_categories,
                    created_time,
                });
            }
        }
    }
    
    // 按创建时间排序分类（最新的在前）
    categories.sort_by(|a, b| {
        let time_a = fs::metadata(PathBuf::from(&data_dir).join(&a.id))
            .and_then(|meta| meta.created())
            .unwrap_or_else(|_| std::time::SystemTime::UNIX_EPOCH);
        let time_b = fs::metadata(PathBuf::from(&data_dir).join(&b.id))
            .and_then(|meta| meta.created())
            .unwrap_or_else(|_| std::time::SystemTime::UNIX_EPOCH);
        time_b.cmp(&time_a) // 降序排列，最新的在前
    });
    
    Ok(categories)
}

// 创建新分类
#[tauri::command]
pub fn create_category(data_dir: String, name: String) -> Result<String, String> {
    let category_id = name.clone();
    let category_path = PathBuf::from(&data_dir).join(&category_id);
    
    fs::create_dir_all(category_path).map_err(|e| format!("无法创建分类目录: {}", e))?;
    
    Ok(category_id)
}

// 创建新子分类
#[tauri::command]
pub fn create_subcategory(data_dir: String, category_id: String, name: String) -> Result<String, String> {
    let subcategory_id = name.clone();
    let subcategory_path = PathBuf::from(&data_dir).join(&category_id).join(&subcategory_id);
    
    fs::create_dir_all(subcategory_path).map_err(|e| format!("无法创建子分类目录: {}", e))?;
    
    Ok(subcategory_id)
}

// 删除分类
#[tauri::command]
pub fn delete_category(data_dir: String, category_id: String) -> Result<(), String> {
    let category_path = PathBuf::from(&data_dir).join(&category_id);
    
    // 检查目录是否存在
    if !category_path.exists() {
        return Err(format!("分类 '{}' 不存在", category_id));
    }
    
    // 检查目录是否为空
    let is_empty = fs::read_dir(&category_path)
        .map_err(|e| format!("无法读取分类目录: {}", e))?
        .next()
        .is_none();
    
    if !is_empty {
        return Err(format!("分类 '{}' 不为空，请先删除其中的内容", category_id));
    }
    
    // 删除目录
    fs::remove_dir(&category_path)
        .map_err(|e| format!("无法删除分类目录: {}", e))?;
    
    Ok(())
}

// 删除子分类
#[tauri::command]
pub fn delete_subcategory(data_dir: String, category_id: String, sub_category_id: String) -> Result<(), String> {
    let subcategory_path = PathBuf::from(&data_dir).join(&category_id).join(&sub_category_id);
    
    // 检查目录是否存在
    if !subcategory_path.exists() {
        return Err(format!("子分类 '{}' 不存在", sub_category_id));
    }
    
    // 删除目录及其所有内容
    fs::remove_dir_all(&subcategory_path)
        .map_err(|e| format!("无法删除子分类目录: {}", e))?;
    
    Ok(())
}

// 删除笔记
#[tauri::command]
pub fn delete_note(data_dir: String, note_id: String) -> Result<(), String> {
    // 解析笔记ID来获取路径信息
    // ID格式: "category#subcategory#title" 或 "category##title"
    let parts: Vec<&str> = note_id.split('#').collect();
    
    if parts.len() < 3 {
        return Err(format!("无效的笔记ID格式: {}", note_id));
    }
    
    let category_id = parts[0];
    let subcategory_id = if parts[1].is_empty() { None } else { Some(parts[1]) };
    let title = parts[2];
    
    // 构建文件路径
    let base_path = PathBuf::from(&data_dir);
    let note_path = if let Some(sub_id) = subcategory_id {
        // 子分类下的笔记
        base_path.join(category_id).join(sub_id).join(format!("{}.json", title))
    } else {
        // 分类下的直接笔记
        base_path.join(category_id).join(format!("{}.json", title))
    };
    
    // 检查文件是否存在
    if !note_path.exists() {
        return Err(format!("笔记文件不存在: {}", note_path.display()));
    }
    
    // 删除文件
    fs::remove_file(&note_path)
        .map_err(|e| format!("无法删除笔记文件: {}", e))?;
    
    Ok(())
} 