use serde::{Deserialize, Serialize};
use std::process::Command;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChannelStatus {
    pub id: String,
    pub name: String,
    pub paired: bool,
    pub status: String, // "connected", "disconnected", "pairing", "error"
    pub detail: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QrCode {
    pub data: String, // base64-encoded QR image or raw text for QR generation
    pub expires_in: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PairingResult {
    pub success: bool,
    pub message: String,
    pub channel_id: String,
}

// ── WhatsApp ─────────────────────────────────────────────

/// Start WhatsApp pairing — requests a QR code from the gateway
pub fn whatsapp_get_qr(port: u16) -> Result<QrCode, String> {
    // In real mode, call OpenClaw gateway RPC to get QR data
    let output = Command::new("curl")
        .args([
            "-s",
            &format!("http://127.0.0.1:{}/api/channels/whatsapp/qr", port),
        ])
        .output()
        .map_err(|e| format!("Failed to request QR: {}", e))?;

    if !output.status.success() {
        return Err("Gateway did not return a QR code".to_string());
    }

    let body = String::from_utf8_lossy(&output.stdout);
    let parsed: serde_json::Value =
        serde_json::from_str(&body).map_err(|e| format!("Invalid QR response: {}", e))?;

    Ok(QrCode {
        data: parsed["qr"]
            .as_str()
            .unwrap_or("")
            .to_string(),
        expires_in: parsed["expires_in"].as_u64().unwrap_or(60) as u32,
    })
}

/// Check WhatsApp pairing status
pub fn whatsapp_status(port: u16) -> Result<ChannelStatus, String> {
    let output = Command::new("curl")
        .args([
            "-s",
            &format!("http://127.0.0.1:{}/api/channels/whatsapp/status", port),
        ])
        .output()
        .map_err(|e| format!("Failed to check status: {}", e))?;

    let body = String::from_utf8_lossy(&output.stdout);
    let parsed: serde_json::Value =
        serde_json::from_str(&body).unwrap_or(serde_json::json!({"status": "disconnected"}));

    let status_str = parsed["status"].as_str().unwrap_or("disconnected");
    Ok(ChannelStatus {
        id: "whatsapp".to_string(),
        name: "WhatsApp".to_string(),
        paired: status_str == "connected",
        status: status_str.to_string(),
        detail: parsed["phone"].as_str().map(|s| s.to_string()),
    })
}

// ── Telegram ─────────────────────────────────────────────

/// Pair Telegram with a bot token
pub fn telegram_pair(openclaw_bin: &str, bot_token: &str) -> Result<PairingResult, String> {
    let output = Command::new(openclaw_bin)
        .args(["channels", "telegram", "pair", "--token", bot_token])
        .output()
        .map_err(|e| format!("Failed to pair Telegram: {}", e))?;

    let stdout = String::from_utf8_lossy(&output.stdout).to_string();
    if output.status.success() {
        Ok(PairingResult {
            success: true,
            message: stdout.trim().to_string(),
            channel_id: "telegram".to_string(),
        })
    } else {
        let stderr = String::from_utf8_lossy(&output.stderr).to_string();
        Err(format!(
            "Telegram pairing failed: {}",
            if stderr.is_empty() { &stdout } else { &stderr }
        ))
    }
}

/// Verify a Telegram bot token by calling the Bot API
pub fn telegram_verify_token(token: &str) -> Result<String, String> {
    let output = Command::new("curl")
        .args([
            "-s",
            &format!("https://api.telegram.org/bot{}/getMe", token),
        ])
        .output()
        .map_err(|e| format!("Failed to verify token: {}", e))?;

    let body = String::from_utf8_lossy(&output.stdout);
    let parsed: serde_json::Value =
        serde_json::from_str(&body).map_err(|e| format!("Invalid response: {}", e))?;

    if parsed["ok"].as_bool() == Some(true) {
        let bot_name = parsed["result"]["username"]
            .as_str()
            .unwrap_or("unknown");
        Ok(format!("@{}", bot_name))
    } else {
        Err("Invalid bot token".to_string())
    }
}

// ── Discord ──────────────────────────────────────────────

/// Pair Discord with a bot token
pub fn discord_pair(openclaw_bin: &str, bot_token: &str) -> Result<PairingResult, String> {
    let output = Command::new(openclaw_bin)
        .args(["channels", "discord", "pair", "--token", bot_token])
        .output()
        .map_err(|e| format!("Failed to pair Discord: {}", e))?;

    let stdout = String::from_utf8_lossy(&output.stdout).to_string();
    if output.status.success() {
        Ok(PairingResult {
            success: true,
            message: stdout.trim().to_string(),
            channel_id: "discord".to_string(),
        })
    } else {
        let stderr = String::from_utf8_lossy(&output.stderr).to_string();
        Err(format!(
            "Discord pairing failed: {}",
            if stderr.is_empty() { &stdout } else { &stderr }
        ))
    }
}

/// Verify a Discord bot token
pub fn discord_verify_token(token: &str) -> Result<String, String> {
    let output = Command::new("curl")
        .args([
            "-s",
            "-H",
            &format!("Authorization: Bot {}", token),
            "https://discord.com/api/v10/users/@me",
        ])
        .output()
        .map_err(|e| format!("Failed to verify token: {}", e))?;

    let body = String::from_utf8_lossy(&output.stdout);
    let parsed: serde_json::Value =
        serde_json::from_str(&body).map_err(|e| format!("Invalid response: {}", e))?;

    if let Some(username) = parsed["username"].as_str() {
        Ok(username.to_string())
    } else {
        Err(parsed["message"]
            .as_str()
            .unwrap_or("Invalid bot token")
            .to_string())
    }
}

// ── Signal ───────────────────────────────────────────────

/// Start Signal linking — requests a QR code from the gateway
pub fn signal_get_qr(port: u16) -> Result<QrCode, String> {
    let output = Command::new("curl")
        .args([
            "-s",
            &format!("http://127.0.0.1:{}/api/channels/signal/qr", port),
        ])
        .output()
        .map_err(|e| format!("Failed to request Signal QR: {}", e))?;

    if !output.status.success() {
        return Err("Gateway did not return a QR code".to_string());
    }

    let body = String::from_utf8_lossy(&output.stdout);
    let parsed: serde_json::Value =
        serde_json::from_str(&body).map_err(|e| format!("Invalid QR response: {}", e))?;

    Ok(QrCode {
        data: parsed["qr"].as_str().unwrap_or("").to_string(),
        expires_in: parsed["expires_in"].as_u64().unwrap_or(60) as u32,
    })
}

// ── Generic ──────────────────────────────────────────────

/// Get status of all configured channels
pub fn get_all_status(port: u16) -> Vec<ChannelStatus> {
    let output = Command::new("curl")
        .args([
            "-s",
            &format!("http://127.0.0.1:{}/api/channels", port),
        ])
        .output();

    match output {
        Ok(o) if o.status.success() => {
            let body = String::from_utf8_lossy(&o.stdout);
            serde_json::from_str(&body).unwrap_or_default()
        }
        _ => vec![],
    }
}

/// Disconnect a channel
pub fn disconnect_channel(openclaw_bin: &str, channel_id: &str) -> Result<String, String> {
    let output = Command::new(openclaw_bin)
        .args(["channels", channel_id, "disconnect"])
        .output()
        .map_err(|e| format!("Failed to disconnect {}: {}", channel_id, e))?;

    if output.status.success() {
        Ok(format!("{} disconnected", channel_id))
    } else {
        let stderr = String::from_utf8_lossy(&output.stderr);
        Err(format!("Failed to disconnect: {}", stderr))
    }
}
