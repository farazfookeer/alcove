pub mod manifest;

use serde::{Deserialize, Serialize};

/// Which runtime backend is being used.
#[derive(Debug, Clone, Copy, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum RuntimeMode {
    Docker,
    Native,
}

/// Current status of the setup pipeline.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum SetupStatus {
    NotStarted,
    InProgress { step: String, progress: f32 },
    Complete,
    Failed { step: String, message: String },
    Cancelled,
}
