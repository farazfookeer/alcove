use std::process::Command;

use serde::Serialize;

/// Result of running openclaw doctor.
#[derive(Debug, Clone, Serialize)]
pub struct DoctorResult {
    pub success: bool,
    pub output: String,
    pub issues_found: u32,
    pub issues_fixed: u32,
}

/// Run `openclaw doctor --non-interactive` (safe fixes only).
pub fn doctor_safe(openclaw_bin: &str) -> DoctorResult {
    run_doctor(openclaw_bin, &["--non-interactive"])
}

/// Run `openclaw doctor --repair` (recommended fixes).
pub fn doctor_repair(openclaw_bin: &str) -> DoctorResult {
    run_doctor(openclaw_bin, &["--repair"])
}

/// Run `openclaw doctor --repair --force` (aggressive fixes).
pub fn doctor_force(openclaw_bin: &str) -> DoctorResult {
    run_doctor(openclaw_bin, &["--repair", "--force"])
}

/// Run `openclaw status --all` and return output.
pub fn status_report(openclaw_bin: &str) -> Result<String, String> {
    let output = Command::new(openclaw_bin)
        .args(["status", "--all"])
        .output()
        .map_err(|e| format!("Failed to run openclaw status: {}", e))?;

    let stdout = String::from_utf8_lossy(&output.stdout).to_string();
    let stderr = String::from_utf8_lossy(&output.stderr).to_string();
    Ok(format!("{}{}", stdout, stderr))
}

/// Escalating recovery: try safe → repair → force.
pub fn recover(openclaw_bin: &str) -> DoctorResult {
    // First try safe fixes
    let result = doctor_safe(openclaw_bin);
    if result.success {
        return result;
    }

    // Escalate to repair
    let result = doctor_repair(openclaw_bin);
    if result.success {
        return result;
    }

    // Last resort — force (caller should have confirmed with user)
    doctor_force(openclaw_bin)
}

/// Run `openclaw doctor --deep` to check for conflicting installations.
pub fn doctor_deep(openclaw_bin: &str) -> DoctorResult {
    run_doctor(openclaw_bin, &["--deep"])
}

/// Parse `openclaw status --all` into structured health data.
#[derive(Debug, Clone, Serialize)]
pub struct HealthStatus {
    pub gateway_running: bool,
    pub gateway_port: Option<u16>,
    pub channels_connected: Vec<String>,
    pub skills_loaded: u32,
    pub uptime_seconds: Option<u64>,
    pub raw_output: String,
}

pub fn parse_status(openclaw_bin: &str) -> Result<HealthStatus, String> {
    let output = Command::new(openclaw_bin)
        .args(["status", "--all"])
        .output()
        .map_err(|e| format!("Failed to run openclaw status: {}", e))?;

    let stdout = String::from_utf8_lossy(&output.stdout).to_string();
    let stderr = String::from_utf8_lossy(&output.stderr).to_string();
    let raw = format!("{}{}", stdout, stderr);

    // Parse structured data from status output
    let gateway_running = raw.contains("running") || raw.contains("active");
    let gateway_port = raw
        .lines()
        .find(|l| l.contains("port"))
        .and_then(|l| l.split_whitespace().filter_map(|w| w.parse::<u16>().ok()).next());

    let channels_connected: Vec<String> = raw
        .lines()
        .filter(|l| l.contains("connected") || l.contains("paired"))
        .filter_map(|l| l.split_whitespace().next().map(|s| s.to_string()))
        .collect();

    let skills_loaded = raw
        .lines()
        .find(|l| l.contains("skills") || l.contains("loaded"))
        .and_then(|l| l.split_whitespace().filter_map(|w| w.parse::<u32>().ok()).next())
        .unwrap_or(0);

    let uptime_seconds = raw
        .lines()
        .find(|l| l.contains("uptime"))
        .and_then(|l| l.split_whitespace().filter_map(|w| w.parse::<u64>().ok()).next());

    Ok(HealthStatus {
        gateway_running,
        gateway_port,
        channels_connected,
        skills_loaded,
        uptime_seconds,
        raw_output: raw,
    })
}

fn run_doctor(openclaw_bin: &str, args: &[&str]) -> DoctorResult {
    let mut cmd_args = vec!["doctor"];
    cmd_args.extend_from_slice(args);

    let output = Command::new(openclaw_bin).args(&cmd_args).output();

    match output {
        Ok(out) => {
            let stdout = String::from_utf8_lossy(&out.stdout).to_string();
            let stderr = String::from_utf8_lossy(&out.stderr).to_string();
            let full_output = format!("{}{}", stdout, stderr);

            // Parse output for issue counts (best-effort)
            let issues_found = full_output.matches("ISSUE").count() as u32
                + full_output.matches("WARNING").count() as u32;
            let issues_fixed = full_output.matches("FIXED").count() as u32
                + full_output.matches("REPAIRED").count() as u32;

            DoctorResult {
                success: out.status.success(),
                output: full_output,
                issues_found,
                issues_fixed,
            }
        }
        Err(e) => DoctorResult {
            success: false,
            output: format!("Failed to run doctor: {}", e),
            issues_found: 0,
            issues_fixed: 0,
        },
    }
}
