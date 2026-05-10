use crate::paths;
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;

/// Tracks what setup steps have been completed, enabling rollback.
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct SetupManifest {
    /// Which runtime mode was chosen.
    pub runtime_mode: Option<String>,
    /// Path where Node.js was downloaded (native mode only).
    pub node_path: Option<PathBuf>,
    /// Whether OpenClaw was installed via npm.
    pub openclaw_installed: bool,
    /// Path where config was written.
    pub config_path: Option<PathBuf>,
    /// Whether a Docker image was pulled.
    pub docker_image_pulled: bool,
    /// Name of the Docker container if created.
    pub docker_container: Option<String>,
    /// PID of the gateway process (native mode only).
    pub gateway_pid: Option<u32>,
}

impl SetupManifest {
    /// Load manifest from disk, or return empty if not found.
    pub fn load() -> Self {
        let path = paths::manifest_path();
        match fs::read_to_string(&path) {
            Ok(content) => serde_json::from_str(&content).unwrap_or_default(),
            Err(_) => Self::default(),
        }
    }

    /// Save manifest to disk.
    pub fn save(&self) -> Result<(), String> {
        let path = paths::manifest_path();
        if let Some(parent) = path.parent() {
            fs::create_dir_all(parent).map_err(|e| format!("Failed to create directory: {}", e))?;
        }
        let json = serde_json::to_string_pretty(self)
            .map_err(|e| format!("Failed to serialize manifest: {}", e))?;
        fs::write(&path, json).map_err(|e| format!("Failed to write manifest: {}", e))?;
        Ok(())
    }

    /// Delete the manifest file.
    pub fn delete() -> Result<(), String> {
        let path = paths::manifest_path();
        if path.exists() {
            fs::remove_file(&path).map_err(|e| format!("Failed to delete manifest: {}", e))?;
        }
        Ok(())
    }

    /// Rollback all recorded setup steps in reverse order.
    pub fn rollback(&self) -> Vec<String> {
        let mut actions = Vec::new();

        // Stop gateway process (native)
        if let Some(pid) = self.gateway_pid {
            #[cfg(unix)]
            {
                use std::process::Command;
                let _ = Command::new("kill").arg(pid.to_string()).output();
            }
            #[cfg(windows)]
            {
                use std::process::Command;
                let _ = Command::new("taskkill")
                    .args(["/PID", &pid.to_string(), "/F"])
                    .output();
            }
            actions.push(format!("Stopped gateway process (PID {})", pid));
        }

        // Stop and remove Docker container
        if let Some(ref container) = self.docker_container {
            use std::process::Command;
            let _ = Command::new("docker").args(["stop", container]).output();
            let _ = Command::new("docker").args(["rm", container]).output();
            actions.push(format!("Removed container '{}'", container));
        }

        // Remove Docker image
        if self.docker_image_pulled {
            use std::process::Command;
            let _ = Command::new("docker")
                .args(["rmi", "openclaw/openclaw"])
                .output();
            actions.push("Removed OpenClaw Docker image".to_string());
        }

        // Delete config
        if let Some(ref config_path) = self.config_path {
            if config_path.exists() {
                let _ = fs::remove_file(config_path);
                actions.push("Removed configuration".to_string());
            }
        }

        // Uninstall OpenClaw (native)
        if self.openclaw_installed {
            if let Some(ref node_path) = self.node_path {
                use std::process::Command;
                let npm = node_path.join("bin").join("npm");
                let _ = Command::new(npm)
                    .args(["uninstall", "-g", "openclaw"])
                    .output();
                actions.push("Uninstalled OpenClaw".to_string());
            }
        }

        // Delete Node runtime
        if let Some(ref node_path) = self.node_path {
            if node_path.exists() {
                let _ = fs::remove_dir_all(node_path);
                actions.push("Removed runtime".to_string());
            }
        }

        // Delete manifest itself
        let _ = Self::delete();
        actions.push("Cleaned up setup data".to_string());

        actions
    }
}
