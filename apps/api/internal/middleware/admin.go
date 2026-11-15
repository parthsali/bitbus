package middleware

import (
	"github.com/gin-gonic/gin"
	"github.com/parthsali/bitbus/apps/api/internal/response"
)

// Admin rejects requests from non-admin users with 403 Forbidden.
// Must be used after the Auth middleware (requires IsAdminKey in context).
func Admin() gin.HandlerFunc {
	return func(c *gin.Context) {
		isAdmin, exists := c.Get(IsAdminKey)
		if !exists || !isAdmin.(bool) {
			response.Forbidden(c, "admin access required")
			return
		}
		c.Next()
	}
}
