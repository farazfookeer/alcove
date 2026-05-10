use std::process::Command;

use serde::Serialize;

/// Result of checking Docker availability.
#[derive(Debug, Clone, Serialize)]
pub struct DockerStatus {
    pub available: bool,
    pub version: Option<String>,
    pub download_url: String,
}

/// Check if Docker is installed and running.
pub fn check_docker() -> DockerStatus {
    let download_url = crate::paths::docker_download_url().to_string();

    let output = Command::new("docker")
        .args(["info", "--format", "{{.ServerVersion}}"])
        .output();

    match output {
        Ok(out) if out.status.success() => {
            let version = String::from_utf8_lossy(&out.stdout).trim().to_string();
            DockerStatus {
                available: true,
                version: if version.is_empty() {
                    None
                } else {
                    Some(version)
                },
                download_url,
            }
        }
        _ => DockerStatus {
            available: false,
            version: None,
            download_url,
        },
    }
}

/// Check if the alcove-openclaw container exists and its state.
#[derive(Debug, Clone, Serialize)]
pub struct ContainerStatus {
    pub exists: bool,
    pub running: bool,
}

pub fn container_status() -> ContainerStatus {
    let output = Command::new("docker")
        .args([
            "inspect",
            "--format",
            "{{.State.Running}}",
            "alcove-openclaw",
        ])
        .output();

    match output {
        Ok(out) if out.status.success() => {
            let running = String::from_utf8_lossy(&out.stdout)
                .trim()
                .eq_ignore_ascii_case("true");
            ContainerStatus {
                exists: true,
                running,
            }
        }
        _ => ContainerStatus {
            exists: false,
            running: false,
        },
    }
}

/// Pull the OpenClaw Docker image.
pub fn pull_image() -> Result<String, String> {
    let output = Command::new("docker")
        .args(["pull", "openclaw/openclaw:latest"])
        .output()
        .map_err(|e| format!("Failed to run docker pull: {}", e))?;

    if output.status.success() {
        Ok("Image pulled successfully".to_string())
    } else {
        let stderr = String::from_utf8_lossy(&output.stderr);
        Err(format!("Docker pull failed: {}", stderr.trim()))
    }
}

/// Start a new OpenClaw container.
pub fn start_container(
    config_dir: &str,
    api_key: &str,
    port: u16,
) -> Result<String, String> {
    // Remove existing container if present
    let _ = Command::new("docker")
        .args(["rm", "-f", "alcove-openclaw"])
        .output();

    let port_mapping = format!("{}:18789", port);
    let volume = format!("{}:/etc/openclaw", config_dir);

    let output = Command::new("docker")
        .args([
            "run",
            "-d",
            "--name",
            "alcove-openclaw",
            "-p",
            &port_mapping,
            "-v",
            &volume,
            "-e",
            &format!("OPENROUTER_API_KEY={}", api_key),
            "openclaw/openclaw:latest",
        ])
        .output()
        .map_err(|e| format!("Failed to start container: {}", e))?;

    if output.status.success() {
        let container_id = String::from_utf8_lossy(&output.stdout).trim().to_string();
        Ok(container_id)
    } else {
        let stderr = String::from_utf8_lossy(&output.stderr);
        Err(format!("Failed to start container: {}", stderr.trim()))
    }
}

/// Stop the OpenClaw container.
pub fn stop_container() -> Result<(), String> {
    let output = Command::new("docker")
        .args(["stop", "alcove-openclaw"])
        .output()
        .map_err(|e| format!("Failed to stop container: {}", e))?;

    if output.status.success() {
        Ok(())
    } else {
        Err("Container not running".to_string())
    }
}

/// Restart the OpenClaw container.
pub fn restart_container() -> Result<(), String> {
    let output = Command::new("docker")
        .args(["restart", "alcove-openclaw"])
        .output()
        .map_err(|e| format!("Failed to restart container: {}", e))?;

    if output.status.success() {
        Ok(())
    } else {
        let stderr = String::from_utf8_lossy(&output.stderr);
        Err(format!("Failed to restart: {}", stderr.trim()))
    }
}

/// Get recent logs from the container.
pub fn get_logs(tail: u32) -> Result<String, String> {
    let output = Command::new("docker")
        .args([
            "logs",
            "--tail",
            &tail.to_string(),
            "alcove-openclaw",
        ])
        .output()
        .map_err(|e| format!("Failed to get logs: {}", e))?;

    let stdout = String::from_utf8_lossy(&output.stdout).to_string();
    let stderr = String::from_utf8_lossy(&output.stderr).to_string();
    Ok(format!("{}{}", stdout, stderr))
}

/// Get the local image digest for openclaw/openclaw:latest.
pub fn local_image_digest() -> Option<String> {
    let output = Command::new("docker")
        .args(["inspect", "--format", "{{.Id}}", "openclaw/openclaw:latest"])
        .output()
        .ok()?;

    if output.status.success() {
        let digest = String::from_utf8_lossy(&output.stdout).trim().to_string();
        if digest.is_empty() { None } else { Some(digest) }
    } else {
        None
    }
}

/// Check if a newer image is available by comparing digests.
/// Returns (has_update, local_digest, remote_digest).
pub fn check_for_update() -> Result<(bool, String, String), String> {
    let local = local_image_digest().unwrap_or_default();

    // Pull latest manifest without downloading layers
    let output = Command::new("docker")
        .args(["pull", "openclaw/openclaw:latest"])
        .output()
        .map_err(|e| format!("Failed to check for updates: {}", e))?;

    if !output.status.success() {
        return Err("Failed to pull latest image info".to_string());
    }

    let remote = local_image_digest().unwrap_or_default();
    let has_update = !local.is_empty() && !remote.is_empty() && local != remote;

    Ok((has_update, local, remote))
}

/// Remove the container and optionally the image.
pub fn uninstall(remove_image: bool) -> Result<Vec<String>, String> {
    let mut actions = Vec::new();

    // Stop container
    let _ = Command::new("docker")
        .args(["stop", "alcove-openclaw"])
        .output();
    actions.push("Stopped container".to_string());

    // Remove container
    let _ = Command::new("docker")
        .args(["rm", "alcove-openclaw"])
        .output();
    actions.push("Removed container".to_string());

    // Optionally remove image
    if remove_image {
        let _ = Command::new("docker")
            .args(["rmi", "openclaw/openclaw"])
            .output();
        actions.push("Removed Docker image".to_string());
    }

    Ok(actions)
}
