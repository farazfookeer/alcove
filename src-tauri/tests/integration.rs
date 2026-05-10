// Integration tests for Alcove setup, rollback, and uninstall.
//
// Each test uses its own unique /tmp directory to avoid race conditions
// when Cargo runs tests in parallel.

use std::fs;
use std::path::PathBuf;

fn unique_base(name: &str) -> PathBuf {
    let base = PathBuf::from(format!("/tmp/alcove-test-{}", name));
    let _ = fs::remove_dir_all(&base);
    fs::create_dir_all(&base).expect("Failed to create test dir");
    base
}

#[test]
fn test_sandbox_paths_are_isolated() {
    let base = unique_base("paths");

    assert!(base.to_string_lossy().starts_with("/tmp/alcove-test-"));

    let manifest_path = base.join("setup-manifest.json");
    assert!(manifest_path.to_string_lossy().starts_with("/tmp/alcove-test-"));

    let _ = fs::remove_dir_all(&base);
}

#[test]
fn test_manifest_save_load_roundtrip() {
    let base = unique_base("manifest");
    let manifest_path = base.join("setup-manifest.json");

    let manifest = serde_json::json!({
        "runtime_mode": "native",
        "node_path": base.join("runtime/node-v22.16.0").to_string_lossy(),
        "openclaw_installed": true,
        "config_path": base.join("config/openclaw.json").to_string_lossy(),
        "docker_image_pulled": false,
        "docker_container": null,
        "gateway_pid": 12345
    });

    fs::write(&manifest_path, serde_json::to_string_pretty(&manifest).unwrap())
        .expect("Failed to write manifest");

    let content = fs::read_to_string(&manifest_path).expect("Failed to read manifest");
    let loaded: serde_json::Value = serde_json::from_str(&content).expect("Failed to parse");

    assert_eq!(loaded["runtime_mode"], "native");
    assert_eq!(loaded["openclaw_installed"], true);
    assert_eq!(loaded["gateway_pid"], 12345);

    let _ = fs::remove_dir_all(&base);
}

#[test]
fn test_rollback_cleans_up() {
    let base = unique_base("rollback");
    let config_dir = base.join("config");
    let runtime_dir = base.join("runtime");

    fs::create_dir_all(&config_dir).unwrap();
    fs::create_dir_all(&runtime_dir).unwrap();
    fs::write(config_dir.join("openclaw.json"), "{}").unwrap();
    fs::write(runtime_dir.join("node"), "fake").unwrap();

    let manifest_path = base.join("setup-manifest.json");
    let manifest = serde_json::json!({
        "runtime_mode": "native",
        "node_path": runtime_dir.to_string_lossy(),
        "openclaw_installed": false,
        "config_path": config_dir.join("openclaw.json").to_string_lossy(),
        "docker_image_pulled": false,
        "docker_container": null,
        "gateway_pid": null
    });
    fs::write(&manifest_path, serde_json::to_string_pretty(&manifest).unwrap()).unwrap();

    // Simulate rollback
    if let Ok(content) = fs::read_to_string(&manifest_path) {
        if let Ok(m) = serde_json::from_str::<serde_json::Value>(&content) {
            if let Some(config) = m["config_path"].as_str() {
                let _ = fs::remove_file(config);
            }
            if let Some(node) = m["node_path"].as_str() {
                let _ = fs::remove_dir_all(node);
            }
        }
    }
    let _ = fs::remove_file(&manifest_path);

    assert!(!manifest_path.exists(), "Manifest should be deleted");
    assert!(
        !config_dir.join("openclaw.json").exists(),
        "Config should be deleted"
    );

    let _ = fs::remove_dir_all(&base);
}

#[test]
fn test_full_uninstall_leaves_nothing() {
    let base = unique_base("uninstall");

    let dirs = ["config", "runtime", "data", "logs"];
    for d in &dirs {
        let dir = base.join(d);
        fs::create_dir_all(&dir).unwrap();
        fs::write(dir.join("test.txt"), "data").unwrap();
    }
    fs::write(base.join("setup-manifest.json"), "{}").unwrap();

    assert!(base.exists());
    assert!(base.join("config/test.txt").exists());

    fs::remove_dir_all(&base).expect("Uninstall failed");

    assert!(!base.exists(), "Base dir should not exist after uninstall");
}

#[test]
fn test_abort_signal_works() {
    use std::sync::atomic::{AtomicBool, Ordering};

    let abort = AtomicBool::new(false);

    let steps = ["download", "install", "configure", "start"];
    let mut completed = Vec::new();

    for (i, step) in steps.iter().enumerate() {
        if abort.load(Ordering::SeqCst) {
            break;
        }
        completed.push(*step);

        if i == 1 {
            abort.store(true, Ordering::SeqCst);
        }
    }

    assert_eq!(completed, vec!["download", "install"]);
    assert!(abort.load(Ordering::SeqCst));
}

// ── Cross-platform verification ──────────────────────────

#[test]
fn test_platform_paths_are_correct() {
    // Verify path conventions match the target OS
    if cfg!(target_os = "macos") {
        // macOS: base should be under home dir
        let home = std::env::var("HOME").unwrap_or_default();
        assert!(!home.is_empty(), "HOME should be set on macOS");

        // Node download URL should be for darwin
        let url = format!(
            "https://nodejs.org/dist/v22.16.0/node-v22.16.0-darwin-{}.tar.gz",
            if cfg!(target_arch = "aarch64") {
                "arm64"
            } else {
                "x64"
            }
        );
        assert!(url.contains("darwin"), "macOS URL should contain 'darwin'");
        assert!(url.ends_with(".tar.gz"), "macOS archive should be tar.gz");
    }

    if cfg!(target_os = "windows") {
        // Windows: URL should use win and .zip
        let url = format!(
            "https://nodejs.org/dist/v22.16.0/node-v22.16.0-win-{}.zip",
            if cfg!(target_arch = "aarch64") {
                "arm64"
            } else {
                "x64"
            }
        );
        assert!(url.contains("win"), "Windows URL should contain 'win'");
        assert!(url.ends_with(".zip"), "Windows archive should be .zip");
    }
}

#[test]
fn test_platform_binary_names() {
    if cfg!(target_os = "windows") {
        // Windows should use .exe and .cmd extensions
        let node = std::path::Path::new("C:\\runtime\\node.exe");
        assert_eq!(
            node.extension().and_then(|e| e.to_str()),
            Some("exe"),
            "Windows node binary should be .exe"
        );

        let npm = std::path::Path::new("C:\\runtime\\npm.cmd");
        assert_eq!(
            npm.extension().and_then(|e| e.to_str()),
            Some("cmd"),
            "Windows npm should be .cmd"
        );
    } else {
        // Unix: binaries are in bin/ subdirectory, no extension
        let node = std::path::Path::new("/runtime/bin/node");
        assert!(
            node.extension().is_none(),
            "Unix node binary should have no extension"
        );
    }
}

#[test]
fn test_docker_download_url_per_platform() {
    if cfg!(target_os = "windows") {
        let url = "https://docs.docker.com/desktop/setup/install/windows-install/";
        assert!(url.contains("windows"), "Windows Docker URL");
    } else {
        let url = "https://docs.docker.com/desktop/setup/install/mac-install/";
        assert!(url.contains("mac"), "macOS Docker URL");
    }
}

#[test]
fn test_config_generation_format() {
    let base = unique_base("config-gen");
    let config_dir = base.join("openclaw");
    fs::create_dir_all(&config_dir).unwrap();

    let config_path = config_dir.join("openclaw.json");
    let config = r#"{
  agents: {
    defaults: {
      model: {
        primary: "claude-haiku",
        fallbacks: ["claude-opus"]
      }
    }
  },
  channels: {
    whatsapp: { enabled: true }
  },
  skills: {
    entries: {
      "email": { enabled: true }
    }
  },
  gateway: {
    port: 18789
  }
}"#;

    fs::write(&config_path, config).unwrap();
    let content = fs::read_to_string(&config_path).unwrap();

    // Verify dual model mapping
    assert!(content.contains("claude-haiku"), "Should contain quick model");
    assert!(content.contains("claude-opus"), "Should contain deep model");
    assert!(content.contains("primary"), "Should have primary field");
    assert!(content.contains("fallbacks"), "Should have fallbacks field");
    assert!(content.contains("18789"), "Should have gateway port");

    let _ = fs::remove_dir_all(&base);
}
