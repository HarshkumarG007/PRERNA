// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    #[cfg(not(debug_assertions))]
    std::panic::set_hook(Box::new(|_| {
        // In release mode, silently abort on panic to prevent stack traces
        // or memory dumps from being written to disk/stdout.
        std::process::abort();
    }));

    app_lib::run()
}
