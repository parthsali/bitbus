-- name: ListAllUsers :many
SELECT * FROM users ORDER BY created_at DESC;

-- name: AdminGetUserByID :one
SELECT * FROM users WHERE id = $1;

-- name: SetUserActivation :one
UPDATE users SET is_activated = $2, updated_at = NOW() WHERE id = $1 RETURNING *;

-- name: SetUserAdmin :one
UPDATE users SET is_admin = $2, updated_at = NOW() WHERE id = $1 RETURNING *;

-- name: AdminDeleteUser :exec
DELETE FROM users WHERE id = $1;

-- name: ListAllDevices :many
SELECT
    d.id,
    d.user_id,
    d.name,
    d.agent_version,
    d.last_seen_at,
    d.created_at,
    u.email AS owner_email,
    u.name AS owner_name,
    ds.is_online,
    ds.display_mode,
    ds.brightness,
    ds.cpu_percent,
    ds.mem_mb,
    ds.temp_c,
    ds.uptime_s,
    ds.wifi_dbm,
    ds.ip_address,
    ds.updated_at AS state_updated_at
FROM devices d
LEFT JOIN device_states ds ON ds.device_id = d.id
LEFT JOIN users u ON u.id = d.user_id
ORDER BY d.created_at DESC;

-- name: AdminDeleteDevice :exec
DELETE FROM devices WHERE id = $1;

-- name: ListAllAssets :many
SELECT
    a.*,
    u.email AS owner_email,
    u.name AS owner_name
FROM assets a
LEFT JOIN users u ON u.id = a.user_id
ORDER BY a.created_at DESC;

-- name: AdminGetAssetByID :one
SELECT * FROM assets WHERE id = $1;

-- name: AdminDeleteAsset :exec
DELETE FROM assets WHERE id = $1;

-- name: ListAllApiKeys :many
SELECT
    k.*,
    u.email AS owner_email,
    u.name AS owner_name
FROM api_keys k
LEFT JOIN users u ON u.id = k.user_id
ORDER BY k.created_at DESC;

-- name: AdminDeleteApiKey :exec
DELETE FROM api_keys WHERE id = $1;

-- name: CountUsers :one
SELECT COUNT(*) FROM users;

-- name: CountActiveUsers :one
SELECT COUNT(*) FROM users WHERE is_activated = true;

-- name: CountDevices :one
SELECT COUNT(*) FROM devices;

-- name: CountOnlineDevices :one
SELECT COUNT(*) FROM device_states WHERE is_online = true;

-- name: CountAssets :one
SELECT COUNT(*) FROM assets;

-- name: SumAssetBytes :one
SELECT COALESCE(SUM(size_bytes), 0)::bigint FROM assets;

-- name: CountApiKeys :one
SELECT COUNT(*) FROM api_keys;

-- name: CountDevicesByUser :one
SELECT COUNT(*) FROM devices WHERE user_id = $1;

-- name: HasSpotifyToken :one
SELECT EXISTS(SELECT 1 FROM spotify_tokens WHERE user_id = $1) AS has_token;
