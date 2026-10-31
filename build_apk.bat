@echo off
set "JAVA_HOME=C:\Program Files\Android\Android Studio\jbr"
cd src-tauri\gen\android
call gradlew.bat assembleArm64Release

