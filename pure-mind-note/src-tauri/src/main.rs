// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// Tauri 2.0 的handler实现
#[cfg(not(test))]
fn main() {
    app_lib::run();
}

// 对于测试，我们需要提供一个空的main函数
#[cfg(test)]
fn main() {}

// 引入测试模块，测试时使用
#[cfg(test)]
mod tests;
