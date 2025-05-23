// 引入命令模块
pub mod commands;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      // 注册文件系统插件
      app.handle().plugin(tauri_plugin_fs::init())?;
      Ok(())
    })
    .invoke_handler(tauri::generate_handler![
      commands::read_note,
      commands::save_note,
      commands::get_all_notes,
      commands::get_all_categories,
      commands::create_category,
      commands::create_subcategory,
      commands::delete_category,
      commands::delete_subcategory,
      commands::delete_note
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
