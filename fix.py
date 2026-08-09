
import os, re
files = ["src-tauri/src/commands/mod.rs", "src-tauri/src/commands/ai.rs", "src-tauri/src/school_api.rs"]
for f in files:
    with open(f, "r", encoding="utf-8") as file:
        content = file.read()
    
    # regex dotall replacement
    pattern = re.compile(r"session\.0\.lock\(\)\.map_err\(\|e\| e\.to_string\(\)\)\?\s*\.clone\(\)\.ok_or_else\(\|\| \"Unauthorized: No active session\"\.to_string\(\)\)\?;", re.DOTALL)
    content = pattern.sub(r"session.get_user_id()?;", content)
    
    pattern_logout = re.compile(r"let mut sess = session\.0\.lock\(\)\.map_err\(\|e\| e\.to_string\(\)\)\?;\s*// RED-025: Evict memory on logout\s*if let Some\(user_id\) = sess\.clone\(\) \{", re.DOTALL)
    content = pattern_logout.sub(r"let user_id_opt = session.get_user_id().ok();\n    // RED-025: Evict memory on logout\n    if let Some(user_id) = user_id_opt {", content)

    with open(f, "w", encoding="utf-8") as file:
        file.write(content)

