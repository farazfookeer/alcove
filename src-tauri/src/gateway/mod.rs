use serde::{Deserialize, Serialize};
use std::net::TcpStream;
use tungstenite::{connect, Message};

const DEFAULT_PORT: u16 = 18789;

/// Result of a gateway RPC call.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RpcResult {
    pub success: bool,
    pub data: serde_json::Value,
    pub error: Option<String>,
}

/// Connect to the OpenClaw gateway WebSocket and send an RPC request.
pub fn rpc_call(
    port: u16,
    method: &str,
    params: serde_json::Value,
    token: Option<&str>,
) -> Result<RpcResult, String> {
    let url = format!("ws://127.0.0.1:{}", port);

    let (mut socket, _) =
        connect(&url).map_err(|e| format!("WebSocket connection failed: {}", e))?;

    // Build the RPC request
    let request = serde_json::json!({
        "id": uuid_v4(),
        "method": method,
        "params": params,
    });

    // If token is provided, send auth first
    if let Some(t) = token {
        let auth = serde_json::json!({
            "id": uuid_v4(),
            "method": "auth",
            "params": { "token": t },
        });
        socket
            .send(Message::Text(auth.to_string()))
            .map_err(|e| format!("Auth send failed: {}", e))?;
        // Read auth response
        let _ = socket.read();
    }

    // Send the RPC request
    socket
        .send(Message::Text(request.to_string()))
        .map_err(|e| format!("RPC send failed: {}", e))?;

    // Read the response
    let response = socket
        .read()
        .map_err(|e| format!("RPC read failed: {}", e))?;

    let _ = socket.close(None);

    match response {
        Message::Text(text) => {
            let parsed: serde_json::Value =
                serde_json::from_str(&text).map_err(|e| format!("Parse error: {}", e))?;

            if let Some(err) = parsed.get("error") {
                Ok(RpcResult {
                    success: false,
                    data: serde_json::Value::Null,
                    error: Some(err.to_string()),
                })
            } else {
                Ok(RpcResult {
                    success: true,
                    data: parsed.get("result").cloned().unwrap_or(parsed),
                    error: None,
                })
            }
        }
        _ => Err("Unexpected WebSocket message type".to_string()),
    }
}

/// Query the gateway HTTP status endpoint.
pub fn http_status(port: u16) -> Result<serde_json::Value, String> {
    // Use a raw TCP connection + minimal HTTP request to avoid adding reqwest
    let addr = format!("127.0.0.1:{}", port);
    let stream = TcpStream::connect_timeout(
        &addr.parse().map_err(|e| format!("Bad address: {}", e))?,
        std::time::Duration::from_secs(3),
    )
    .map_err(|e| format!("Connection failed: {}", e))?;

    stream
        .set_read_timeout(Some(std::time::Duration::from_secs(5)))
        .ok();

    use std::io::{Read, Write};
    let mut stream = stream;
    let request = format!(
        "GET /api/status HTTP/1.1\r\nHost: 127.0.0.1:{}\r\nConnection: close\r\n\r\n",
        port
    );
    stream
        .write_all(request.as_bytes())
        .map_err(|e| format!("Write failed: {}", e))?;

    let mut response = String::new();
    stream
        .read_to_string(&mut response)
        .map_err(|e| format!("Read failed: {}", e))?;

    // Extract JSON body after headers
    if let Some(body_start) = response.find("\r\n\r\n") {
        let body = &response[body_start + 4..];
        serde_json::from_str(body).map_err(|e| format!("JSON parse error: {}", e))
    } else {
        Err("Invalid HTTP response".to_string())
    }
}

/// List active sessions via RPC.
pub fn list_sessions(port: u16, token: Option<&str>) -> Result<RpcResult, String> {
    rpc_call(port, "sessions.list", serde_json::json!({}), token)
}

/// List installed skills via RPC.
pub fn list_skills(port: u16, token: Option<&str>) -> Result<RpcResult, String> {
    rpc_call(port, "skills.list", serde_json::json!({}), token)
}

/// List connected channels via RPC.
pub fn list_channels(port: u16, token: Option<&str>) -> Result<RpcResult, String> {
    rpc_call(port, "channels.list", serde_json::json!({}), token)
}

/// Get agent info via RPC.
pub fn get_agent(port: u16, agent_id: &str, token: Option<&str>) -> Result<RpcResult, String> {
    rpc_call(
        port,
        "agents.get",
        serde_json::json!({ "id": agent_id }),
        token,
    )
}

/// Simple UUID v4 generator (no external crate needed).
fn uuid_v4() -> String {
    use std::time::{SystemTime, UNIX_EPOCH};
    let now = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default();
    let seed = now.as_nanos();
    format!(
        "{:08x}-{:04x}-4{:03x}-{:04x}-{:012x}",
        (seed & 0xFFFFFFFF) as u32,
        ((seed >> 32) & 0xFFFF) as u16,
        ((seed >> 48) & 0x0FFF) as u16,
        (0x8000 | ((seed >> 60) & 0x3FFF)) as u16,
        (seed >> 76) as u64 ^ (seed & 0xFFFFFFFFFFFF) as u64,
    )
}
