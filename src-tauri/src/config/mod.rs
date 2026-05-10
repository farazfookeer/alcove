use serde::{Deserialize, Serialize};
use std::fs;

use crate::paths;

/// Wizard answers from the frontend, used to generate OpenClaw config.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WizardConfig {
    pub provider: String,
    pub quick_model: String,
    pub deep_model: String,
    pub api_key: String,
    pub channels: Vec<String>,
    pub skills: Vec<String>,
}

/// Generate OpenClaw JSON5 config from wizard answers and write to disk.
pub fn generate_config(wizard: &WizardConfig) -> Result<String, String> {
    let config_dir = paths::openclaw_dir();
    fs::create_dir_all(&config_dir)
        .map_err(|e| format!("Failed to create config directory: {}", e))?;

    let config_path = config_dir.join("openclaw.json");

    // Build channel config
    let channels: Vec<String> = wizard
        .channels
        .iter()
        .map(|ch| format!("    {}: {{ enabled: true }}", ch))
        .collect();

    // Build skills config
    let skills: Vec<String> = wizard
        .skills
        .iter()
        .map(|sk| format!("      \"{}\": {{ enabled: true }}", sk))
        .collect();

    let config = format!(
        r#"{{
  agents: {{
    defaults: {{
      model: {{
        primary: "{}",
        fallbacks: ["{}"]
      }}
    }}
  }},
  channels: {{
{}
  }},
  skills: {{
    entries: {{
{}
    }}
  }},
  gateway: {{
    port: 18789
  }}
}}"#,
        wizard.quick_model,
        wizard.deep_model,
        channels.join(",\n"),
        skills.join(",\n"),
    );

    fs::write(&config_path, &config)
        .map_err(|e| format!("Failed to write config: {}", e))?;

    Ok(config_path.to_string_lossy().to_string())
}
