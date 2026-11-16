-- name: CreateAPIKey :one
INSERT INTO api_keys (user_id, name, key_hash, key_prefix)
VALUES ($1, $2, $3, $4)
RETURNING *;

-- name: GetAPIKeysByUser :many
SELECT * FROM api_keys WHERE user_id = $1 ORDER BY created_at DESC;

-- name: DeleteAPIKey :exec
DELETE FROM api_keys WHERE id = $1 AND user_id = $2;

-- name: GetAPIKeysByPrefix :many
SELECT k.*, u.email, u.is_admin
FROM api_keys k
JOIN users u ON u.id = k.user_id
WHERE k.key_prefix = $1;

-- name: TouchAPIKeyLastUsed :exec
UPDATE api_keys SET last_used_at = NOW() WHERE id = $1;
