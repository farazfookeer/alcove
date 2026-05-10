mod channels;
mod clawhub;
mod config;
mod docker;
mod gateway;
mod keychain;
mod native;
mod paths;
mod recovery;
mod setup;

use paths::TestMode;
use setup::manifest::SetupManifest;

use std::sync::atomic::{AtomicBool, Ordering};

/// Global abort signal for the setup pipeline.
static SETUP_ABORT: AtomicBool = AtomicBool::new(false);

// ── Test mode ──────────────────────────────────────────────

#[tauri::command]
fn get_test_mode() -> String {
    serde_json::to_string(&TestMode::current()).unwrap_or_else(|_| "\"mock\"".to_string())
}

// ── Docker ─────────────────────────────────────────────────

#[tauri::command]
fn check_docker() -> docker::DockerStatus {
    if TestMode::current().is_mock() {
        return docker::DockerStatus {
            available: true,
            version: Some("27.5.1 (mock)".to_string()),
            download_url: paths::docker_download_url().to_string(),
        };
    }
    docker::check_docker()
}

#[tauri::command]
fn get_container_status() -> docker::ContainerStatus {
    if TestMode::current().is_mock() {
        return docker::ContainerStatus {
            exists: false,
            running: false,
        };
    }
    docker::container_status()
}

#[tauri::command]
fn docker_pull_image() -> Result<String, String> {
    if TestMode::current().is_mock() {
        return Ok("Image pulled (mock)".to_string());
    }
    docker::pull_image()
}

#[tauri::command]
fn docker_start(api_key: String, port: u16) -> Result<String, String> {
    if TestMode::current().is_mock() {
        return Ok("mock-container-id".to_string());
    }
    let config_dir = paths::config_dir();
    std::fs::create_dir_all(&config_dir)
        .map_err(|e| format!("Failed to create config dir: {}", e))?;
    docker::start_container(&config_dir.to_string_lossy(), &api_key, port)
}

#[tauri::command]
fn docker_stop() -> Result<(), String> {
    if TestMode::current().is_mock() {
        return Ok(());
    }
    docker::stop_container()
}

#[tauri::command]
fn docker_restart() -> Result<(), String> {
    if TestMode::current().is_mock() {
        return Ok(());
    }
    docker::restart_container()
}

#[tauri::command]
fn docker_logs(tail: u32) -> Result<String, String> {
    if TestMode::current().is_mock() {
        return Ok("[mock] Gateway started on port 18789\n[mock] Channels: whatsapp, telegram\n[mock] Skills: 3 loaded\n[mock] Ready.".to_string());
    }
    docker::get_logs(tail)
}

#[tauri::command]
fn docker_uninstall(remove_image: bool) -> Result<Vec<String>, String> {
    if TestMode::current().is_mock() {
        return Ok(vec![
            "Stopped container (mock)".to_string(),
            "Removed container (mock)".to_string(),
        ]);
    }
    docker::uninstall(remove_image)
}

// ── Native runtime ─────────────────────────────────────────

#[tauri::command]
fn native_download_node() -> Result<String, String> {
    if TestMode::current().is_mock() {
        return Ok("/mock/runtime/node-v22.16.0".to_string());
    }
    let node_dir = native::download_node()?;
    Ok(node_dir.to_string_lossy().to_string())
}

#[tauri::command]
fn native_install_openclaw(node_dir: String) -> Result<(), String> {
    if TestMode::current().is_mock() {
        return Ok(());
    }
    native::install_openclaw(std::path::Path::new(&node_dir))
}

#[tauri::command]
fn native_start_gateway(node_dir: String, port: u16) -> Result<u32, String> {
    if TestMode::current().is_mock() {
        return Ok(99999);
    }
    native::start_gateway(std::path::Path::new(&node_dir), port)
}

#[tauri::command]
fn native_stop_gateway(pid: u32) -> Result<(), String> {
    if TestMode::current().is_mock() {
        return Ok(());
    }
    native::stop_gateway(pid)
}

#[tauri::command]
fn native_runtime_exists() -> bool {
    if TestMode::current().is_mock() {
        return false;
    }
    native::runtime_exists()
}

// ── Paths ──────────────────────────────────────────────────

#[tauri::command]
fn get_paths() -> std::collections::HashMap<String, String> {
    let mut map = std::collections::HashMap::new();
    map.insert(
        "base_dir".to_string(),
        paths::base_dir().to_string_lossy().to_string(),
    );
    map.insert(
        "openclaw_dir".to_string(),
        paths::openclaw_dir().to_string_lossy().to_string(),
    );
    map.insert(
        "runtime_dir".to_string(),
        paths::runtime_dir().to_string_lossy().to_string(),
    );
    map.insert(
        "config_dir".to_string(),
        paths::config_dir().to_string_lossy().to_string(),
    );
    map.insert(
        "docker_download_url".to_string(),
        paths::docker_download_url().to_string(),
    );
    map
}

// ── Config generation ──────────────────────────────────────

#[tauri::command]
fn generate_config(
    provider: String,
    quick_model: String,
    deep_model: String,
    api_key: String,
    channels: Vec<String>,
    skills: Vec<String>,
) -> Result<String, String> {
    if TestMode::current().is_mock() {
        return Ok("/mock/path/openclaw.json".to_string());
    }
    // Store API key in keychain before writing config
    let _ = keychain::set_api_key(&provider, &api_key);

    let wizard = config::WizardConfig {
        provider,
        quick_model,
        deep_model,
        api_key,
        channels,
        skills,
    };
    config::generate_config(&wizard)
}

// ── Setup manifest & rollback ──────────────────────────────

#[tauri::command]
fn get_setup_manifest() -> SetupManifest {
    if TestMode::current().is_mock() {
        return SetupManifest::default();
    }
    SetupManifest::load()
}

#[tauri::command]
fn rollback_setup() -> Vec<String> {
    if TestMode::current().is_mock() {
        return vec![
            "Stopped gateway (mock)".to_string(),
            "Removed configuration (mock)".to_string(),
            "Cleaned up (mock)".to_string(),
        ];
    }
    let manifest = SetupManifest::load();
    manifest.rollback()
}

// ── Health check ───────────────────────────────────────────

#[tauri::command]
async fn check_health(port: u16) -> Result<bool, String> {
    if TestMode::current().is_mock() {
        return Ok(true);
    }
    let url = format!("http://127.0.0.1:{}/health", port);
    // Simple TCP check — reqwest not needed, just try to connect
    match std::net::TcpStream::connect_timeout(
        &format!("127.0.0.1:{}", port).parse().unwrap(),
        std::time::Duration::from_secs(2),
    ) {
        Ok(_) => Ok(true),
        Err(_) => Ok(false),
    }
}

// ── Gateway status ─────────────────────────────────────────

#[tauri::command]
fn get_gateway_status() -> std::collections::HashMap<String, serde_json::Value> {
    let mut status = std::collections::HashMap::new();
    if TestMode::current().is_mock() {
        status.insert("running".to_string(), serde_json::Value::Bool(false));
        status.insert("port".to_string(), serde_json::json!(18789));
        status.insert(
            "mode".to_string(),
            serde_json::Value::String("mock".to_string()),
        );
        return status;
    }

    // Check Docker container first
    let container = docker::container_status();
    if container.exists {
        status.insert(
            "running".to_string(),
            serde_json::Value::Bool(container.running),
        );
        status.insert(
            "mode".to_string(),
            serde_json::Value::String("docker".to_string()),
        );
    } else {
        status.insert("running".to_string(), serde_json::Value::Bool(false));
        status.insert(
            "mode".to_string(),
            serde_json::Value::String("native".to_string()),
        );
    }
    status.insert("port".to_string(), serde_json::json!(18789));
    status
}

// ── Recovery (Claw Doctor) ─────────────────────────────────

#[tauri::command]
fn run_doctor(level: String) -> recovery::DoctorResult {
    if TestMode::current().is_mock() {
        return recovery::DoctorResult {
            success: true,
            output: "All checks passed (mock)".to_string(),
            issues_found: 0,
            issues_fixed: 0,
        };
    }
    // Find openclaw binary
    let openclaw = "openclaw"; // TODO: resolve from runtime dir
    match level.as_str() {
        "safe" => recovery::doctor_safe(openclaw),
        "repair" => recovery::doctor_repair(openclaw),
        "force" => recovery::doctor_force(openclaw),
        _ => recovery::recover(openclaw),
    }
}

// ── Uninstall ──────────────────────────────────────────────

#[tauri::command]
fn uninstall_all() -> Vec<String> {
    if TestMode::current().is_mock() {
        return vec![
            "Stopped assistant (mock)".to_string(),
            "Removed data (mock)".to_string(),
            "Cleaned keychain (mock)".to_string(),
            "Done (mock)".to_string(),
        ];
    }

    let mut actions = Vec::new();

    // Try Docker uninstall
    if let Ok(docker_actions) = docker::uninstall(true) {
        actions.extend(docker_actions);
    }

    // Try native uninstall
    if let Ok(native_actions) = native::uninstall() {
        actions.extend(native_actions);
    }

    // Clean keychain
    let keychain_actions = keychain::delete_all_keys();
    actions.extend(keychain_actions);

    // Delete config
    let openclaw_dir = paths::openclaw_dir();
    if openclaw_dir.exists() {
        let _ = std::fs::remove_dir_all(&openclaw_dir);
        actions.push("Removed configuration".to_string());
    }

    // Delete base dir
    let base_dir = paths::base_dir();
    if base_dir.exists() {
        let _ = std::fs::remove_dir_all(&base_dir);
        actions.push("Removed all Alcove data".to_string());
    }

    actions
}

// ── Abort signal ──────────────────────────────────────────

#[tauri::command]
fn abort_setup() {
    SETUP_ABORT.store(true, Ordering::SeqCst);
}

#[tauri::command]
fn reset_abort() {
    SETUP_ABORT.store(false, Ordering::SeqCst);
}

#[tauri::command]
fn is_setup_aborted() -> bool {
    SETUP_ABORT.load(Ordering::SeqCst)
}

// ── Docker updates ────────────────────────────────────────

#[tauri::command]
fn docker_check_update() -> Result<(bool, String, String), String> {
    if TestMode::current().is_mock() {
        return Ok((false, "sha256:abc123".to_string(), "sha256:abc123".to_string()));
    }
    docker::check_for_update()
}

// ── Status parsing ────────────────────────────────────────

#[tauri::command]
fn get_health_status() -> recovery::HealthStatus {
    if TestMode::current().is_mock() {
        return recovery::HealthStatus {
            gateway_running: true,
            gateway_port: Some(18789),
            channels_connected: vec!["whatsapp".to_string()],
            skills_loaded: 3,
            uptime_seconds: Some(3600),
            raw_output: "Gateway running on port 18789 (mock)".to_string(),
        };
    }
    let openclaw = "openclaw";
    recovery::parse_status(openclaw).unwrap_or(recovery::HealthStatus {
        gateway_running: false,
        gateway_port: None,
        channels_connected: vec![],
        skills_loaded: 0,
        uptime_seconds: None,
        raw_output: "Status unavailable".to_string(),
    })
}

// ── Doctor on first launch ────────────────────────────────

#[tauri::command]
fn run_doctor_deep() -> recovery::DoctorResult {
    if TestMode::current().is_mock() {
        return recovery::DoctorResult {
            success: true,
            output: "Deep scan complete — no conflicts found (mock)".to_string(),
            issues_found: 0,
            issues_fixed: 0,
        };
    }
    let openclaw = "openclaw";
    recovery::doctor_deep(openclaw)
}

// ── Keychain ──────────────────────────────────────────────

#[tauri::command]
fn keychain_set(provider: String, key: String) -> Result<(), String> {
    if TestMode::current().is_mock() {
        return Ok(());
    }
    keychain::set_api_key(&provider, &key)
}

#[tauri::command]
fn keychain_get(provider: String) -> Result<Option<String>, String> {
    if TestMode::current().is_mock() {
        return Ok(Some("sk-ant-api03-mock-key".to_string()));
    }
    keychain::get_api_key(&provider)
}

#[tauri::command]
fn keychain_delete(provider: String) -> Result<(), String> {
    if TestMode::current().is_mock() {
        return Ok(());
    }
    keychain::delete_api_key(&provider)
}

// ── Gateway RPC ──────────────────────────────────────────

#[tauri::command]
fn gateway_rpc(method: String, params: serde_json::Value, port: Option<u16>) -> Result<gateway::RpcResult, String> {
    if TestMode::current().is_mock() {
        return Ok(gateway::RpcResult {
            success: true,
            data: serde_json::json!({ "mock": true }),
            error: None,
        });
    }
    gateway::rpc_call(port.unwrap_or(18789), &method, params, None)
}

#[tauri::command]
fn gateway_http_status(port: Option<u16>) -> Result<serde_json::Value, String> {
    if TestMode::current().is_mock() {
        return Ok(serde_json::json!({
            "status": "running",
            "version": "1.0.0",
            "uptime": 3600,
            "agents": 1,
            "channels": 1,
            "skills": 3,
        }));
    }
    gateway::http_status(port.unwrap_or(18789))
}

#[tauri::command]
fn gateway_list_sessions(port: Option<u16>) -> Result<gateway::RpcResult, String> {
    if TestMode::current().is_mock() {
        return Ok(gateway::RpcResult {
            success: true,
            data: serde_json::json!({ "sessions": [] }),
            error: None,
        });
    }
    gateway::list_sessions(port.unwrap_or(18789), None)
}

#[tauri::command]
fn gateway_list_skills(port: Option<u16>) -> Result<gateway::RpcResult, String> {
    if TestMode::current().is_mock() {
        return Ok(gateway::RpcResult {
            success: true,
            data: serde_json::json!({ "skills": ["email", "calendar", "notes"] }),
            error: None,
        });
    }
    gateway::list_skills(port.unwrap_or(18789), None)
}

#[tauri::command]
fn gateway_list_channels(port: Option<u16>) -> Result<gateway::RpcResult, String> {
    if TestMode::current().is_mock() {
        return Ok(gateway::RpcResult {
            success: true,
            data: serde_json::json!({ "channels": [] }),
            error: None,
        });
    }
    gateway::list_channels(port.unwrap_or(18789), None)
}

// ── Auto-updater ──────────────────────────────────────────

#[derive(serde::Serialize)]
struct UpdateInfo {
    alcove_current: String,
    alcove_latest: Option<String>,
    alcove_update_available: bool,
    openclaw_current: Option<String>,
    openclaw_latest: Option<String>,
    openclaw_update_available: bool,
}

#[tauri::command]
fn check_updates() -> UpdateInfo {
    if TestMode::current().is_mock() {
        return UpdateInfo {
            alcove_current: env!("CARGO_PKG_VERSION").to_string(),
            alcove_latest: Some(env!("CARGO_PKG_VERSION").to_string()),
            alcove_update_available: false,
            openclaw_current: Some("1.0.250".to_string()),
            openclaw_latest: Some("1.0.250".to_string()),
            openclaw_update_available: false,
        };
    }

    let alcove_current = env!("CARGO_PKG_VERSION").to_string();

    // Check OpenClaw version
    let openclaw_current = std::process::Command::new("openclaw")
        .args(["--version"])
        .output()
        .ok()
        .filter(|o| o.status.success())
        .map(|o| String::from_utf8_lossy(&o.stdout).trim().to_string());

    // Check latest OpenClaw via npm
    let openclaw_latest = std::process::Command::new("npm")
        .args(["view", "openclaw", "version"])
        .output()
        .ok()
        .filter(|o| o.status.success())
        .map(|o| String::from_utf8_lossy(&o.stdout).trim().to_string());

    let openclaw_update_available = match (&openclaw_current, &openclaw_latest) {
        (Some(current), Some(latest)) => current != latest,
        _ => false,
    };

    UpdateInfo {
        alcove_current,
        alcove_latest: None, // TODO: check GitHub releases
        alcove_update_available: false,
        openclaw_current,
        openclaw_latest,
        openclaw_update_available,
    }
}

// ── ClawHub Skill Store ───────────────────────────────────

#[tauri::command]
fn clawhub_search(query: String, limit: Option<u32>) -> Result<clawhub::SearchResult, String> {
    if TestMode::current().is_mock() {
        return Ok(mock_search_result(&query));
    }
    clawhub::search(&query, limit.unwrap_or(20))
}

#[tauri::command]
fn clawhub_browse(category: String, limit: Option<u32>) -> Result<clawhub::SearchResult, String> {
    if TestMode::current().is_mock() {
        return Ok(mock_search_result(&category));
    }
    clawhub::browse(&category, limit.unwrap_or(20))
}

#[tauri::command]
fn clawhub_get_skill(slug: String) -> Result<clawhub::SkillInfo, String> {
    if TestMode::current().is_mock() {
        return Ok(mock_skill(&slug));
    }
    clawhub::get_skill(&slug)
}

#[tauri::command]
fn clawhub_install(slug: String) -> Result<String, String> {
    if TestMode::current().is_mock() {
        return Ok(format!("Installed {} (mock)", slug));
    }
    clawhub::install_skill("openclaw", &slug)
}

#[tauri::command]
fn clawhub_remove(slug: String) -> Result<String, String> {
    if TestMode::current().is_mock() {
        return Ok(format!("Removed {} (mock)", slug));
    }
    clawhub::remove_skill("openclaw", &slug)
}

#[tauri::command]
fn clawhub_update_all() -> Result<String, String> {
    if TestMode::current().is_mock() {
        return Ok("All skills up to date (mock)".to_string());
    }
    clawhub::update_all("openclaw")
}

#[tauri::command]
fn clawhub_list_installed() -> Result<Vec<clawhub::InstalledSkill>, String> {
    if TestMode::current().is_mock() {
        return Ok(vec![
            clawhub::InstalledSkill { name: "Email".to_string(), slug: "email".to_string(), version: "1.2.0".to_string(), has_update: false },
            clawhub::InstalledSkill { name: "Calendar".to_string(), slug: "calendar".to_string(), version: "1.0.3".to_string(), has_update: true },
            clawhub::InstalledSkill { name: "Notes".to_string(), slug: "notes".to_string(), version: "2.1.0".to_string(), has_update: false },
        ]);
    }
    clawhub::list_installed("openclaw")
}

fn mock_skill(slug: &str) -> clawhub::SkillInfo {
    clawhub::SkillInfo {
        slug: slug.to_string(),
        name: slug.replace('-', " ").to_string(),
        description: format!("A useful skill for {}", slug.replace('-', " ")),
        author: "community".to_string(),
        category: "productivity".to_string(),
        version: "1.0.0".to_string(),
        downloads: 1200,
        stars: 45,
        safety: "high".to_string(),
        license: "MIT-0".to_string(),
        requires_bins: vec![],
        requires_env: vec![],
        os: vec!["darwin".to_string(), "linux".to_string(), "win32".to_string()],
    }
}

fn mock_search_result(query: &str) -> clawhub::SearchResult {
    let mock_skills = vec![
        ("gmail-reader", "Gmail Reader", "Read and summarize Gmail messages", "productivity", 5200, 180, "medium"),
        ("slack-notify", "Slack Notify", "Send notifications to Slack channels", "communication", 3400, 95, "medium"),
        ("file-organizer", "File Organizer", "Organize files by type and date", "utility", 2100, 67, "low"),
        ("weather-check", "Weather Check", "Get weather forecasts for any location", "information", 4800, 210, "high"),
        ("code-reviewer", "Code Reviewer", "Review code and suggest improvements", "development", 6700, 340, "high"),
        ("pdf-reader", "PDF Reader", "Extract and summarize PDF content", "productivity", 3900, 120, "low"),
        ("web-scraper", "Web Scraper", "Extract data from web pages", "data", 2800, 88, "low"),
        ("calendar-sync", "Calendar Sync", "Sync calendars across platforms", "productivity", 1900, 55, "medium"),
    ];

    let skills: Vec<clawhub::SkillInfo> = mock_skills
        .iter()
        .filter(|(slug, name, desc, ..)| {
            let q = query.to_lowercase();
            slug.contains(&q) || name.to_lowercase().contains(&q) || desc.to_lowercase().contains(&q) || slug.contains(&q)
        })
        .chain(mock_skills.iter().take(4)) // always show some results
        .take(8)
        .map(|(slug, name, desc, cat, downloads, stars, safety)| clawhub::SkillInfo {
            slug: slug.to_string(),
            name: name.to_string(),
            description: desc.to_string(),
            author: "community".to_string(),
            category: cat.to_string(),
            version: "1.0.0".to_string(),
            downloads: *downloads,
            stars: *stars,
            safety: safety.to_string(),
            license: "MIT-0".to_string(),
            requires_bins: if *safety == "low" { vec!["node".to_string()] } else { vec![] },
            requires_env: if *safety == "medium" { vec!["API_KEY".to_string()] } else { vec![] },
            os: vec!["darwin".to_string(), "linux".to_string(), "win32".to_string()],
        })
        .collect();

    let total = skills.len() as u64;
    clawhub::SearchResult { skills, total }
}

// ── Channel Pairing ──────────────────────────────────────

#[tauri::command]
fn channel_get_all_status() -> Vec<channels::ChannelStatus> {
    if TestMode::current().is_mock() {
        return vec![
            channels::ChannelStatus { id: "whatsapp".to_string(), name: "WhatsApp".to_string(), paired: false, status: "disconnected".to_string(), detail: None },
            channels::ChannelStatus { id: "telegram".to_string(), name: "Telegram".to_string(), paired: false, status: "disconnected".to_string(), detail: None },
            channels::ChannelStatus { id: "discord".to_string(), name: "Discord".to_string(), paired: false, status: "disconnected".to_string(), detail: None },
            channels::ChannelStatus { id: "signal".to_string(), name: "Signal".to_string(), paired: false, status: "disconnected".to_string(), detail: None },
        ];
    }
    channels::get_all_status(18789)
}

#[tauri::command]
fn channel_whatsapp_qr(port: Option<u16>) -> Result<channels::QrCode, String> {
    if TestMode::current().is_mock() {
        return Ok(channels::QrCode {
            data: "MOCK_QR_DATA_FOR_WHATSAPP_PAIRING_12345".to_string(),
            expires_in: 60,
        });
    }
    channels::whatsapp_get_qr(port.unwrap_or(18789))
}

#[tauri::command]
fn channel_whatsapp_status(port: Option<u16>) -> Result<channels::ChannelStatus, String> {
    if TestMode::current().is_mock() {
        return Ok(channels::ChannelStatus {
            id: "whatsapp".to_string(),
            name: "WhatsApp".to_string(),
            paired: true,
            status: "connected".to_string(),
            detail: Some("+1 (555) 012-3456".to_string()),
        });
    }
    channels::whatsapp_status(port.unwrap_or(18789))
}

#[tauri::command]
fn channel_telegram_verify(token: String) -> Result<String, String> {
    if TestMode::current().is_mock() {
        if token.contains(':') && token.len() > 20 {
            return Ok("@alcove_assistant_bot".to_string());
        }
        return Err("Invalid bot token format".to_string());
    }
    channels::telegram_verify_token(&token)
}

#[tauri::command]
fn channel_telegram_pair(token: String) -> Result<channels::PairingResult, String> {
    if TestMode::current().is_mock() {
        return Ok(channels::PairingResult {
            success: true,
            message: "Telegram bot @alcove_assistant_bot connected".to_string(),
            channel_id: "telegram".to_string(),
        });
    }
    channels::telegram_pair("openclaw", &token)
}

#[tauri::command]
fn channel_discord_verify(token: String) -> Result<String, String> {
    if TestMode::current().is_mock() {
        if token.len() > 50 {
            return Ok("AlcoveBot#1234".to_string());
        }
        return Err("Invalid bot token".to_string());
    }
    channels::discord_verify_token(&token)
}

#[tauri::command]
fn channel_discord_pair(token: String) -> Result<channels::PairingResult, String> {
    if TestMode::current().is_mock() {
        return Ok(channels::PairingResult {
            success: true,
            message: "Discord bot AlcoveBot#1234 connected".to_string(),
            channel_id: "discord".to_string(),
        });
    }
    channels::discord_pair("openclaw", &token)
}

#[tauri::command]
fn channel_signal_qr(port: Option<u16>) -> Result<channels::QrCode, String> {
    if TestMode::current().is_mock() {
        return Ok(channels::QrCode {
            data: "MOCK_QR_DATA_FOR_SIGNAL_LINKING_67890".to_string(),
            expires_in: 45,
        });
    }
    channels::signal_get_qr(port.unwrap_or(18789))
}

#[tauri::command]
fn channel_disconnect(channel_id: String) -> Result<String, String> {
    if TestMode::current().is_mock() {
        return Ok(format!("{} disconnected (mock)", channel_id));
    }
    channels::disconnect_channel("openclaw", &channel_id)
}

// ── App entry ──────────────────────────────────────────────

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            get_test_mode,
            check_docker,
            get_container_status,
            docker_pull_image,
            docker_start,
            docker_stop,
            docker_restart,
            docker_logs,
            docker_uninstall,
            native_download_node,
            native_install_openclaw,
            native_start_gateway,
            native_stop_gateway,
            native_runtime_exists,
            get_paths,
            generate_config,
            get_setup_manifest,
            rollback_setup,
            check_health,
            get_gateway_status,
            run_doctor,
            uninstall_all,
            abort_setup,
            reset_abort,
            is_setup_aborted,
            docker_check_update,
            get_health_status,
            run_doctor_deep,
            keychain_set,
            keychain_get,
            keychain_delete,
            gateway_rpc,
            gateway_http_status,
            gateway_list_sessions,
            gateway_list_skills,
            gateway_list_channels,
            check_updates,
            clawhub_search,
            clawhub_browse,
            clawhub_get_skill,
            clawhub_install,
            clawhub_remove,
            clawhub_update_all,
            clawhub_list_installed,
            channel_get_all_status,
            channel_whatsapp_qr,
            channel_whatsapp_status,
            channel_telegram_verify,
            channel_telegram_pair,
            channel_discord_verify,
            channel_discord_pair,
            channel_signal_qr,
            channel_disconnect,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
