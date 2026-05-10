use std::env;
use std::path::PathBuf;

/// The runtime mode Alcove is operating in.
#[derive(Debug, Clone, Copy, PartialEq, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum TestMode {
    Mock,
    Sandbox,
    Production,
}

impl TestMode {
    pub fn current() -> Self {
        match env::var("ALCOVE_TEST_MODE").as_deref() {
            Ok("sandbox") => TestMode::Sandbox,
            Ok("production") => TestMode::Production,
            Ok("mock") => TestMode::Mock,
            _ => {
                if cfg!(debug_assertions) {
                    TestMode::Mock
                } else {
                    TestMode::Production
                }
            }
        }
    }

    pub fn is_mock(&self) -> bool {
        matches!(self, TestMode::Mock)
    }
}

/// Root directory for all Alcove data (runtime, config, manifests, logs).
///
/// - Production macOS: `~/.alcove/`
/// - Production Windows: `%LOCALAPPDATA%\Alcove\`
/// - Sandbox: `/tmp/alcove-test/` (macOS/Linux) or `%TEMP%\alcove-test\` (Windows)
/// - Mock: returns a path but nothing is written
pub fn base_dir() -> PathBuf {
    match TestMode::current() {
        TestMode::Sandbox => {
            if cfg!(target_os = "windows") {
                PathBuf::from(env::var("TEMP").unwrap_or_else(|_| "C:\\Temp".to_string()))
                    .join("alcove-test")
            } else {
                PathBuf::from("/tmp/alcove-test")
            }
        }
        TestMode::Mock | TestMode::Production => {
            if cfg!(target_os = "windows") {
                PathBuf::from(
                    env::var("LOCALAPPDATA").unwrap_or_else(|_| {
                        dirs_next::data_local_dir()
                            .unwrap_or_else(|| PathBuf::from("C:\\Users\\Default\\AppData\\Local"))
                            .to_string_lossy()
                            .to_string()
                    }),
                )
                .join("Alcove")
            } else {
                dirs_next::home_dir()
                    .unwrap_or_else(|| PathBuf::from("/tmp"))
                    .join(".alcove")
            }
        }
    }
}

/// OpenClaw config directory.
///
/// - macOS: `~/.openclaw/`
/// - Windows: `%LOCALAPPDATA%\OpenClaw\`
/// - Sandbox: `{sandbox_root}/openclaw/`
pub fn openclaw_dir() -> PathBuf {
    match TestMode::current() {
        TestMode::Sandbox => base_dir().join("openclaw"),
        TestMode::Mock | TestMode::Production => {
            if cfg!(target_os = "windows") {
                PathBuf::from(
                    env::var("LOCALAPPDATA").unwrap_or_else(|_| {
                        dirs_next::data_local_dir()
                            .unwrap_or_else(|| PathBuf::from("C:\\Users\\Default\\AppData\\Local"))
                            .to_string_lossy()
                            .to_string()
                    }),
                )
                .join("OpenClaw")
            } else {
                dirs_next::home_dir()
                    .unwrap_or_else(|| PathBuf::from("/tmp"))
                    .join(".openclaw")
            }
        }
    }
}

/// Directory where the private Node.js runtime is stored.
pub fn runtime_dir() -> PathBuf {
    base_dir().join("runtime")
}

/// Directory where mounted config lives (used by Docker volume mount).
pub fn config_dir() -> PathBuf {
    base_dir().join("config")
}

/// Path to the setup manifest file.
pub fn manifest_path() -> PathBuf {
    base_dir().join("setup-manifest.json")
}

/// Build the Node.js download URL for the current platform.
pub fn node_download_url(version: &str) -> String {
    let os = if cfg!(target_os = "windows") {
        "win"
    } else if cfg!(target_os = "macos") {
        "darwin"
    } else {
        "linux"
    };

    let arch = if cfg!(target_arch = "aarch64") {
        "arm64"
    } else {
        "x64"
    };

    let ext = if cfg!(target_os = "windows") {
        "zip"
    } else {
        "tar.gz"
    };

    format!(
        "https://nodejs.org/dist/{version}/node-{version}-{os}-{arch}.{ext}",
        version = version,
        os = os,
        arch = arch,
        ext = ext
    )
}

/// Docker Desktop download URL for the current platform.
pub fn docker_download_url() -> &'static str {
    if cfg!(target_os = "windows") {
        "https://docs.docker.com/desktop/setup/install/windows-install/"
    } else {
        "https://docs.docker.com/desktop/setup/install/mac-install/"
    }
}
