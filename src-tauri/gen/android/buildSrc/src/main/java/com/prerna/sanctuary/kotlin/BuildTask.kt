import java.io.File
import org.apache.tools.ant.taskdefs.condition.Os
import org.gradle.api.DefaultTask
import org.gradle.api.GradleException
import org.gradle.api.logging.LogLevel
import org.gradle.api.tasks.Input
import org.gradle.api.tasks.TaskAction

open class BuildTask : DefaultTask() {
    @Input
    var rootDirRel: String? = null
    @Input
    var target: String? = null
    @Input
    var release: Boolean? = null

    @TaskAction
    fun assemble() {
        val currentTarget = target ?: "aarch64"
        val abi = when (currentTarget) {
            "aarch64" -> "arm64-v8a"
            "armv7" -> "armeabi-v7a"
            "i686" -> "x86"
            "x86_64" -> "x86_64"
            else -> "arm64-v8a"
        }
        val rustTarget = when (currentTarget) {
            "aarch64" -> "aarch64-linux-android"
            "armv7" -> "armv7-linux-androideabi"
            "i686" -> "i686-linux-android"
            "x86_64" -> "x86_64-linux-android"
            else -> currentTarget
        }
        val mode = if (release == true) "release" else "debug"
        val rootDir = File(project.projectDir, rootDirRel ?: "../../../")
        val soSource = File(rootDir, "target/$rustTarget/$mode/libapp_lib.so")
        val jniDest = File(project.projectDir, "src/main/jniLibs/$abi/libapp_lib.so")
        val distSource = File(rootDir, "../dist")
        val assetsDest = File(project.projectDir, "src/main/assets")

        // Ensure web assets are present in the Android assets directory
        if (distSource.exists()) {
            assetsDest.mkdirs()
            distSource.copyRecursively(assetsDest, overwrite = true)
            println("Synchronized frontend assets from ${distSource.canonicalPath} to ${assetsDest.canonicalPath}")
        }

        // Copy native library
        if (soSource.exists()) {
            println("Found compiled native library at ${soSource.canonicalPath}; copying to ${jniDest.canonicalPath}")
            jniDest.parentFile.mkdirs()
            soSource.copyTo(jniDest, overwrite = true)
            return
        }

        if (jniDest.exists()) {
            println("Using existing JNI library at ${jniDest.canonicalPath}")
            return
        }

        val executable = """npm""";
        try {
            runTauriCli(executable)
        } catch (e: Exception) {
            if (Os.isFamily(Os.FAMILY_WINDOWS)) {
                // Try different Windows-specific extensions
                val fallbacks = listOf(
                    "$executable.exe",
                    "$executable.cmd",
                    "$executable.bat",
                )
                
                var lastException: Exception = e
                for (fallback in fallbacks) {
                    try {
                        runTauriCli(fallback)
                        return
                    } catch (fallbackException: Exception) {
                        lastException = fallbackException
                    }
                }
                throw lastException
            } else {
                throw e;
            }
        }
    }

    fun runTauriCli(executable: String) {
        val rootDirRel = rootDirRel ?: throw GradleException("rootDirRel cannot be null")
        val target = target ?: throw GradleException("target cannot be null")
        val release = release ?: throw GradleException("release cannot be null")
        val args = listOf("run", "--", "tauri", "android", "android-studio-script");

        project.exec {
            workingDir(File(project.projectDir, rootDirRel))
            executable(executable)
            args(args)
            if (project.logger.isEnabled(LogLevel.DEBUG)) {
                args("-vv")
            } else if (project.logger.isEnabled(LogLevel.INFO)) {
                args("-v")
            }
            if (release) {
                args("--release")
            }
            args(listOf("--target", target))
        }.assertNormalExitValue()
    }
}
