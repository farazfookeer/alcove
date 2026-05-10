use std::fs;
use std::path::{Path, PathBuf};
use std::process::Command;

use crate::paths;

const NODE_VERSION: &str = "v22.16.0";

/// Download Node.js to the runtime directory.
pub fn download_node() -> Result<PathBuf, String> {
    let runtime_dir = paths::runtime_dir();
    let node_dir = runtime_dir.join(format!("node-{}", NODE_VERSION));

    // Already downloaded?
    if node_dir.exists() && node_bin_path(&node_dir).exists() {
        return Ok(node_dir);
    }

    fs::create_dir_all(&runtime_dir)
        .map_err(|e| format!("Failed to create runtime directory: {}", e))?;

    let url = paths::node_download_url(NODE_VERSION);
    let archive_name = url.split('/').last().unwrap_or("node.tar.gz");
    let archive_path = runtime_dir.join(archive_name);

    // Download
    #[cfg(target_os = "windows")]
    {
        let output = Command::new("powershell")
            .args([
                "-Command",
                &format!(
                    "Invoke-WebRequest -Uri '{}' -OutFile '{}'",
                    url,
                    archive_path.to_string_lossy()
                ),
            ])
            .output()
            .map_err(|e| format!("Download failed: {}", e))?;

        if !output.status.success() {
            return Err(format!(
                "Download failed: {}",
                String::from_utf8_lossy(&output.stderr)
            ));
        }
    }

    #[cfg(not(target_os = "windows"))]
    {
        let output = Command::new("curl")
            .args([
                "-fsSL",
                "-o",
                &archive_path.to_string_lossy(),
                &url,
            ])
            .output()
            .map_err(|e| format!("Download failed: {}", e))?;

        if !output.status.success() {
            return Err(format!(
                "Download failed: {}",
                String::from_utf8_lossy(&output.stderr)
            ));
        }
    }

    // Extract
    #[cfg(target_os = "windows")]
    {
        let output = Command::new("powershell")
            .args([
                "-Command",
                &format!(
                    "Expand-Archive -Path '{}' -DestinationPath '{}' -Force",
                    archive_path.to_string_lossy(),
                    runtime_dir.to_string_lossy()
                ),
            ])
            .output()
            .map_err(|e| format!("Extraction failed: {}", e))?;

        if !output.status.success() {
            return Err(format!(
                "Extraction failed: {}",
                String::from_utf8_lossy(&output.stderr)
            ));
        }
    }

    #[cfg(not(target_os = "windows"))]
    {
        let output = Command::new("tar")
            .args([
                "xzf",
                &archive_path.to_string_lossy(),
                "-C",
                &runtime_dir.to_string_lossy(),
            ])
            .output()
            .map_err(|e| format!("Extraction failed: {}", e))?;

        if !output.status.success() {
            return Err(format!(
                "Extraction failed: {}",
                String::from_utf8_lossy(&output.stderr)
            ));
        }
    }

    // Clean up archive
    let _ = fs::remove_file(&archive_path);

    // Find the extracted directory (name varies by platform)
    let extracted = find_node_dir(&runtime_dir)?;

    // Rename to our standard name if needed
    if extracted != node_dir {
        fs::rename(&extracted, &node_dir)
            .map_err(|e| format!("Failed to rename Node directory: {}", e))?;
    }

    Ok(node_dir)
}

/// Install OpenClaw globally using the private Node runtime.
pub fn install_openclaw(node_dir: &Path) -> Result<(), String> {
    let npm = npm_path(node_dir);

    let output = Command::new(&npm)
        .args(["install", "-g", "openclaw@latest"])
        .env("PATH", node_bin_dir(node_dir).to_string_lossy().to_string())
        .output()
        .map_err(|e| format!("Failed to install OpenClaw: {}", e))?;

    if output.status.success() {
        Ok(())
    } else {
        Err(format!(
            "OpenClaw install failed: {}",
            String::from_utf8_lossy(&output.stderr)
        ))
    }
}

/// Start the OpenClaw gateway as a background process.
pub fn start_gateway(node_dir: &Path, port: u16) -> Result<u32, String> {
    let openclaw_bin = openclaw_bin_path(node_dir);

    let child = Command::new(&openclaw_bin)
        .args(["gateway", "--port", &port.to_string()])
        .env("PATH", node_bin_dir(node_dir).to_string_lossy().to_string())
        .stdin(std::process::Stdio::null())
        .stdout(std::process::Stdio::null())
        .stderr(std::process::Stdio::null())
        .spawn()
        .map_err(|e| format!("Failed to start gateway: {}", e))?;

    Ok(child.id())
}

/// Stop the gateway process by PID.
pub fn stop_gateway(pid: u32) -> Result<(), String> {
    #[cfg(unix)]
    {
        let output = Command::new("kill")
            .arg(pid.to_string())
            .output()
            .map_err(|e| format!("Failed to stop gateway: {}", e))?;

        if output.status.success() {
            Ok(())
        } else {
            Err("Gateway process not found".to_string())
        }
    }

    #[cfg(windows)]
    {
        let output = Command::new("taskkill")
            .args(["/PID", &pid.to_string(), "/F"])
            .output()
            .map_err(|e| format!("Failed to stop gateway: {}", e))?;

        if output.status.success() {
            Ok(())
        } else {
            Err("Gateway process not found".to_string())
        }
    }
}

/// Check if the runtime already exists.
pub fn runtime_exists() -> bool {
    let runtime_dir = paths::runtime_dir();
    if !runtime_dir.exists() {
        return false;
    }
    // Check for any node-* directory with a working binary
    find_node_dir(&runtime_dir)
        .map(|d| node_bin_path(&d).exists())
        .unwrap_or(false)
}

/// Uninstall: remove Node runtime and OpenClaw.
pub fn uninstall() -> Result<Vec<String>, String> {
    let mut actions = Vec::new();
    let runtime_dir = paths::runtime_dir();

    if runtime_dir.exists() {
        fs::remove_dir_all(&runtime_dir)
            .map_err(|e| format!("Failed to remove runtime: {}", e))?;
        actions.push("Removed runtime".to_string());
    }

    Ok(actions)
}

// ── Helpers ────────────────────────────────────────────────

fn node_bin_dir(node_dir: &Path) -> PathBuf {
    if cfg!(target_os = "windows") {
        node_dir.to_path_buf()
    } else {
        node_dir.join("bin")
    }
}

fn node_bin_path(node_dir: &Path) -> PathBuf {
    if cfg!(target_os = "windows") {
        node_dir.join("node.exe")
    } else {
        node_dir.join("bin").join("node")
    }
}

fn npm_path(node_dir: &Path) -> PathBuf {
    if cfg!(target_os = "windows") {
        node_dir.join("npm.cmd")
    } else {
        node_dir.join("bin").join("npm")
    }
}

fn openclaw_bin_path(node_dir: &Path) -> PathBuf {
    if cfg!(target_os = "windows") {
        node_dir.join("openclaw.cmd")
    } else {
        node_dir.join("bin").join("openclaw")
    }
}

fn find_node_dir(runtime_dir: &Path) -> Result<PathBuf, String> {
    for entry in fs::read_dir(runtime_dir).map_err(|e| format!("Can't read runtime dir: {}", e))? {
        let entry = entry.map_err(|e| format!("Can't read entry: {}", e))?;
        let path = entry.path();
        if path.is_dir() && path.file_name().map_or(false, |n| {
            n.to_string_lossy().starts_with("node-")
        }) {
            return Ok(path);
        }
    }
    Err("Node.js directory not found after extraction".to_string())
}
