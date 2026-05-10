use serde::{Deserialize, Serialize};
use std::process::Command;

const CLAWHUB_API: &str = "https://clawhub.ai";

/// Skill metadata from ClawHub.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SkillInfo {
    pub slug: String,
    pub name: String,
    pub description: String,
    pub author: String,
    pub category: String,
    pub version: String,
    pub downloads: u64,
    pub stars: u64,
    pub safety: String, // "high", "medium", "low"
    pub license: String,
    pub requires_bins: Vec<String>,
    pub requires_env: Vec<String>,
    pub os: Vec<String>,
}

/// Search result from ClawHub API.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SearchResult {
    pub skills: Vec<SkillInfo>,
    pub total: u64,
}

/// Installed skill from `openclaw skills list`.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InstalledSkill {
    pub name: String,
    pub slug: String,
    pub version: String,
    pub has_update: bool,
}

/// Search ClawHub for skills by query.
pub fn search(query: &str, limit: u32) -> Result<SearchResult, String> {
    let url = format!("{}/api/v1/search?q={}&limit={}", CLAWHUB_API, urlenc(query), limit);
    let body = http_get(&url)?;
    parse_search_response(&body)
}

/// Browse skills by category.
pub fn browse(category: &str, limit: u32) -> Result<SearchResult, String> {
    let url = format!(
        "{}/api/v1/search?q=category:{}&limit={}",
        CLAWHUB_API,
        urlenc(category),
        limit
    );
    let body = http_get(&url)?;
    parse_search_response(&body)
}

/// Get skill metadata by slug.
pub fn get_skill(slug: &str) -> Result<SkillInfo, String> {
    let url = format!("{}/api/v1/skills/{}", CLAWHUB_API, slug);
    let body = http_get(&url)?;
    parse_skill_response(&body)
}

/// Install a skill via openclaw CLI.
pub fn install_skill(openclaw_bin: &str, slug: &str) -> Result<String, String> {
    let output = Command::new(openclaw_bin)
        .args(["skills", "install", slug])
        .output()
        .map_err(|e| format!("Failed to install skill: {}", e))?;

    if output.status.success() {
        Ok(format!("Installed {}", slug))
    } else {
        Err(format!(
            "Install failed: {}",
            String::from_utf8_lossy(&output.stderr).trim()
        ))
    }
}

/// Remove a skill via openclaw CLI.
pub fn remove_skill(openclaw_bin: &str, slug: &str) -> Result<String, String> {
    let output = Command::new(openclaw_bin)
        .args(["skills", "remove", slug])
        .output()
        .map_err(|e| format!("Failed to remove skill: {}", e))?;

    if output.status.success() {
        Ok(format!("Removed {}", slug))
    } else {
        Err(format!(
            "Remove failed: {}",
            String::from_utf8_lossy(&output.stderr).trim()
        ))
    }
}

/// Update all skills via openclaw CLI.
pub fn update_all(openclaw_bin: &str) -> Result<String, String> {
    let output = Command::new(openclaw_bin)
        .args(["skills", "update", "--all"])
        .output()
        .map_err(|e| format!("Failed to update skills: {}", e))?;

    let stdout = String::from_utf8_lossy(&output.stdout).to_string();
    if output.status.success() {
        Ok(stdout)
    } else {
        Err(format!(
            "Update failed: {}",
            String::from_utf8_lossy(&output.stderr).trim()
        ))
    }
}

/// List installed skills via openclaw CLI.
pub fn list_installed(openclaw_bin: &str) -> Result<Vec<InstalledSkill>, String> {
    let output = Command::new(openclaw_bin)
        .args(["skills", "list"])
        .output()
        .map_err(|e| format!("Failed to list skills: {}", e))?;

    let stdout = String::from_utf8_lossy(&output.stdout).to_string();

    // Parse output lines — typically "name@version" format
    let skills: Vec<InstalledSkill> = stdout
        .lines()
        .filter(|l| !l.trim().is_empty() && !l.starts_with("─") && !l.starts_with("Skills"))
        .filter_map(|line| {
            let parts: Vec<&str> = line.trim().splitn(2, '@').collect();
            if parts.is_empty() {
                return None;
            }
            let name = parts[0].trim().to_string();
            let version = parts.get(1).map(|v| v.trim().to_string()).unwrap_or_default();
            Some(InstalledSkill {
                slug: name.clone(),
                name,
                version,
                has_update: false,
            })
        })
        .collect();

    Ok(skills)
}

// ── Helpers ────────────────────────────────────────────────

/// Minimal URL encoding for query strings.
fn urlenc(s: &str) -> String {
    s.replace(' ', "%20")
        .replace('&', "%26")
        .replace('=', "%3D")
        .replace('#', "%23")
}

/// Simple HTTP GET using raw TCP + TLS via curl (avoids adding reqwest).
fn http_get(url: &str) -> Result<String, String> {
    let output = Command::new("curl")
        .args(["-fsSL", "--max-time", "10", url])
        .output()
        .map_err(|e| format!("HTTP request failed: {}", e))?;

    if output.status.success() {
        Ok(String::from_utf8_lossy(&output.stdout).to_string())
    } else {
        Err(format!(
            "HTTP request failed: {}",
            String::from_utf8_lossy(&output.stderr).trim()
        ))
    }
}

/// Parse a search response JSON into SearchResult.
fn parse_search_response(body: &str) -> Result<SearchResult, String> {
    let json: serde_json::Value =
        serde_json::from_str(body).map_err(|e| format!("JSON parse error: {}", e))?;

    let items = json
        .get("data")
        .or_else(|| json.get("results"))
        .or_else(|| json.get("skills"))
        .and_then(|v| v.as_array())
        .cloned()
        .unwrap_or_default();

    let total = json
        .get("total")
        .and_then(|v| v.as_u64())
        .unwrap_or(items.len() as u64);

    let skills: Vec<SkillInfo> = items
        .iter()
        .filter_map(|item| parse_skill_item(item))
        .collect();

    Ok(SearchResult { skills, total })
}

/// Parse a single skill JSON into SkillInfo.
fn parse_skill_response(body: &str) -> Result<SkillInfo, String> {
    let json: serde_json::Value =
        serde_json::from_str(body).map_err(|e| format!("JSON parse error: {}", e))?;
    parse_skill_item(&json).ok_or_else(|| "Failed to parse skill data".to_string())
}

fn parse_skill_item(item: &serde_json::Value) -> Option<SkillInfo> {
    let slug = item
        .get("slug")
        .or_else(|| item.get("name"))
        .and_then(|v| v.as_str())?
        .to_string();

    let name = item
        .get("displayName")
        .or_else(|| item.get("name"))
        .and_then(|v| v.as_str())
        .unwrap_or(&slug)
        .to_string();

    let description = item
        .get("description")
        .and_then(|v| v.as_str())
        .unwrap_or("")
        .to_string();

    let author = item
        .get("author")
        .or_else(|| item.get("publisher"))
        .and_then(|v| v.as_str())
        .unwrap_or("unknown")
        .to_string();

    let category = item
        .get("category")
        .and_then(|v| v.as_str())
        .unwrap_or("general")
        .to_string();

    let version = item
        .get("version")
        .or_else(|| item.get("latestVersion"))
        .and_then(|v| v.as_str())
        .unwrap_or("1.0.0")
        .to_string();

    let downloads = item
        .get("downloads")
        .and_then(|v| v.as_u64())
        .unwrap_or(0);

    let stars = item
        .get("stars")
        .or_else(|| item.get("starCount"))
        .and_then(|v| v.as_u64())
        .unwrap_or(0);

    // Derive safety from required binaries/env vars
    let requires_bins: Vec<String> = item
        .get("requires")
        .and_then(|r| r.get("bins"))
        .and_then(|v| v.as_array())
        .map(|arr| {
            arr.iter()
                .filter_map(|v| v.as_str().map(|s| s.to_string()))
                .collect()
        })
        .unwrap_or_default();

    let requires_env: Vec<String> = item
        .get("requires")
        .and_then(|r| r.get("env"))
        .and_then(|v| v.as_array())
        .map(|arr| {
            arr.iter()
                .filter_map(|v| v.as_str().map(|s| s.to_string()))
                .collect()
        })
        .unwrap_or_default();

    let os: Vec<String> = item
        .get("os")
        .and_then(|v| v.as_array())
        .map(|arr| {
            arr.iter()
                .filter_map(|v| v.as_str().map(|s| s.to_string()))
                .collect()
        })
        .unwrap_or_default();

    // Safety rating: high (no external deps), medium (env vars only), low (requires binaries)
    let safety = if !requires_bins.is_empty() {
        "low".to_string()
    } else if !requires_env.is_empty() {
        "medium".to_string()
    } else {
        "high".to_string()
    };

    let license = item
        .get("license")
        .and_then(|v| v.as_str())
        .unwrap_or("MIT-0")
        .to_string();

    Some(SkillInfo {
        slug,
        name,
        description,
        author,
        category,
        version,
        downloads,
        stars,
        safety,
        license,
        requires_bins,
        requires_env,
        os,
    })
}
