use keyring::Entry;

const SERVICE: &str = "com.alcove.app";

/// Store the API key in the OS keychain.
pub fn set_api_key(provider: &str, key: &str) -> Result<(), String> {
    let entry = Entry::new(SERVICE, &format!("api-key-{}", provider))
        .map_err(|e| format!("Keychain error: {}", e))?;
    entry
        .set_password(key)
        .map_err(|e| format!("Failed to store key: {}", e))
}

/// Retrieve the API key from the OS keychain.
pub fn get_api_key(provider: &str) -> Result<Option<String>, String> {
    let entry = Entry::new(SERVICE, &format!("api-key-{}", provider))
        .map_err(|e| format!("Keychain error: {}", e))?;
    match entry.get_password() {
        Ok(key) => Ok(Some(key)),
        Err(keyring::Error::NoEntry) => Ok(None),
        Err(e) => Err(format!("Failed to retrieve key: {}", e)),
    }
}

/// Delete the API key from the OS keychain.
pub fn delete_api_key(provider: &str) -> Result<(), String> {
    let entry = Entry::new(SERVICE, &format!("api-key-{}", provider))
        .map_err(|e| format!("Keychain error: {}", e))?;
    match entry.delete_credential() {
        Ok(()) => Ok(()),
        Err(keyring::Error::NoEntry) => Ok(()), // already gone
        Err(e) => Err(format!("Failed to delete key: {}", e)),
    }
}

/// Delete all stored API keys (used during uninstall).
pub fn delete_all_keys() -> Vec<String> {
    let mut actions = Vec::new();
    let providers = ["claude", "gpt4o", "gemini", "llama"];
    for provider in &providers {
        let entry = Entry::new(SERVICE, &format!("api-key-{}", provider));
        if let Ok(entry) = entry {
            if entry.delete_credential().is_ok() {
                actions.push(format!("Removed {} API key from keychain", provider));
            }
        }
    }
    actions
}
