package middleware

import (
	"context"
	"strings"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"

	"github.com/parthsali/bitbus/apps/api/internal/response"
	"github.com/parthsali/bitbus/apps/api/internal/store"
)

// APIKeyAuth validates an X-API-Key header and injects the same context keys
// as the JWT Auth middleware (UserIDKey, EmailKey, IsAdminKey).
// The caller sends the full plaintext key; the middleware derives the prefix,
// looks up candidate rows, and bcrypt-verifies.
func APIKeyAuth(queries *store.Queries) gin.HandlerFunc {
	return func(c *gin.Context) {
		plain := strings.TrimSpace(c.GetHeader("X-API-Key"))
		if plain == "" {
			response.Unauthorized(c, "X-API-Key header required")
			return
		}

		if len(plain) < 8 {
			response.Unauthorized(c, "invalid api key")
			return
		}

		prefix := "bit_" + plain[:8]

		rows, err := queries.GetAPIKeysByPrefix(c.Request.Context(), prefix)
		if err != nil || len(rows) == 0 {
			response.Unauthorized(c, "invalid api key")
			return
		}

		var matched *store.GetAPIKeysByPrefixRow
		for i := range rows {
			if bcrypt.CompareHashAndPassword([]byte(rows[i].KeyHash), []byte(plain)) == nil {
				matched = &rows[i]
				break
			}
		}

		if matched == nil {
			response.Unauthorized(c, "invalid api key")
			return
		}

		go func(id string) {
			_ = queries.TouchAPIKeyLastUsed(context.Background(), id)
		}(matched.ID)

		c.Set(UserIDKey, matched.UserID)
		c.Set(EmailKey, matched.Email)
		c.Set(IsAdminKey, matched.IsAdmin)
		c.Next()
	}
}

// AuthOrAPIKey tries JWT auth first (Authorization header), then falls back
// to API key auth (X-API-Key header). If neither is present, returns 401.
func AuthOrAPIKey(jwtSecret string, queries *store.Queries) gin.HandlerFunc {
	jwtMiddleware := Auth(jwtSecret)
	apikeyMiddleware := APIKeyAuth(queries)

	return func(c *gin.Context) {
		if c.GetHeader("Authorization") != "" {
			jwtMiddleware(c)
			return
		}
		if c.GetHeader("X-API-Key") != "" {
			apikeyMiddleware(c)
			return
		}
		response.Unauthorized(c, "authorization required: provide a Bearer token or X-API-Key")
	}
}
