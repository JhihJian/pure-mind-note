// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::{fs, path::{Path, PathBuf}};
use serde::{Deserialize, Serialize};
use std::io::Write;

// 定义我们的结构体
#[derive(Debug, Serialize, Deserialize)]
struct NoteInfo {
    id: String,
    title: String,
    path: String,
    category_id: String,
    sub_category_id: Option<String>,
    last_updated: String,
}

// 读取笔记内容
#[tauri::command]
fn read_note(path: String) -> Result<String, String> {
    match fs::read_to_string(&path) {
        Ok(content) => Ok(content),
        Err(e) => Err(format!("无法读取笔记: {}", e)),
    }
}

// 保存笔记内容
#[tauri::command]
fn save_note(path: String, content: String) -> Result<(), String> {
    // 确保目录存在
    if let Some(parent) = Path::new(&path).parent() {
        fs::create_dir_all(parent).map_err(|e| format!("无法创建目录: {}", e))?;
    }
    
    // 写入文件
    let mut file = fs::File::create(&path).map_err(|e| format!("无法创建文件: {}", e))?;
    file.write_all(content.as_bytes()).map_err(|e| format!("无法写入文件: {}", e))?;
    Ok(())
}

// 获取所有笔记
#[tauri::command]
fn get_all_notes(data_dir: String) -> Result<Vec<NoteInfo>, String> {
    let mut notes = Vec::new();
    let base_path = PathBuf::from(&data_dir);
    
    // 确保数据目录存在
    if !base_path.exists() {
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
                                        
                                        let note_id = title.clone(); // 简单起见，使用标题作为ID
                                        
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
                            
                            let note_id = title.clone();
                            
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
    
    Ok(notes)
}

// 创建新分类
#[tauri::command]
fn create_category(data_dir: String, name: String) -> Result<String, String> {
    let category_id = name.clone();
    let category_path = PathBuf::from(&data_dir).join(&category_id);
    
    fs::create_dir_all(category_path).map_err(|e| format!("无法创建分类目录: {}", e))?;
    
    Ok(category_id)
}

// 创建新子分类
#[tauri::command]
fn create_subcategory(data_dir: String, category_id: String, name: String) -> Result<String, String> {
    let subcategory_id = name.clone();
    let subcategory_path = PathBuf::from(&data_dir).join(&category_id).join(&subcategory_id);
    
    fs::create_dir_all(subcategory_path).map_err(|e| format!("无法创建子分类目录: {}", e))?;
    
    Ok(subcategory_id)
}

// 主函数
fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            read_note,
            save_note,
            get_all_notes,
            create_category,
            create_subcategory
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
