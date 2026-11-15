package admin

import (
	"github.com/gin-gonic/gin"
	"github.com/parthsali/bitbus/apps/api/internal/response"
)

type Handler struct {
	svc *Service
}

func NewHandler(svc *Service) *Handler {
	return &Handler{svc: svc}
}

func (h *Handler) RegisterRoutes(rg *gin.RouterGroup) {
	rg.GET("/stats", h.Stats)

	rg.GET("/users", h.ListUsers)
	rg.GET("/users/:id", h.GetUser)
	rg.PATCH("/users/:id", h.UpdateUser)
	rg.DELETE("/users/:id", h.DeleteUser)

	rg.GET("/devices", h.ListDevices)
	rg.DELETE("/devices/:id", h.DeleteDevice)

	rg.GET("/assets", h.ListAssets)
	rg.GET("/assets/:id/url", h.AssetURL)
	rg.DELETE("/assets/:id", h.DeleteAsset)

	rg.GET("/api-keys", h.ListApiKeys)
	rg.DELETE("/api-keys/:id", h.DeleteApiKey)
}

func (h *Handler) Stats(c *gin.Context) {
	stats, err := h.svc.GetStats(c.Request.Context())
	if err != nil {
		response.Internal(c, err)
		return
	}
	response.OK(c, stats)
}

func (h *Handler) ListUsers(c *gin.Context) {
	users, err := h.svc.ListUsers(c.Request.Context())
	if err != nil {
		response.Internal(c, err)
		return
	}
	response.OK(c, users)
}

func (h *Handler) GetUser(c *gin.Context) {
	user, err := h.svc.GetUser(c.Request.Context(), c.Param("id"))
	if err != nil {
		response.NotFound(c, "user not found")
		return
	}
	response.OK(c, user)
}

type updateUserRequest struct {
	IsActivated *bool `json:"is_activated"`
}

func (h *Handler) UpdateUser(c *gin.Context) {
	var req updateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "invalid request body")
		return
	}

	if req.IsActivated == nil {
		response.BadRequest(c, "no fields to update")
		return
	}

	user, err := h.svc.SetUserActivation(c.Request.Context(), c.Param("id"), *req.IsActivated)
	if err != nil {
		response.Internal(c, err)
		return
	}

	response.OK(c, user)
}

func (h *Handler) DeleteUser(c *gin.Context) {
	if err := h.svc.DeleteUser(c.Request.Context(), c.Param("id")); err != nil {
		response.Internal(c, err)
		return
	}
	response.NoContent(c)
}

func (h *Handler) ListDevices(c *gin.Context) {
	devices, err := h.svc.ListDevices(c.Request.Context())
	if err != nil {
		response.Internal(c, err)
		return
	}
	response.OK(c, devices)
}

func (h *Handler) DeleteDevice(c *gin.Context) {
	if err := h.svc.DeleteDevice(c.Request.Context(), c.Param("id")); err != nil {
		response.Internal(c, err)
		return
	}
	response.NoContent(c)
}

func (h *Handler) ListAssets(c *gin.Context) {
	assets, err := h.svc.ListAssets(c.Request.Context())
	if err != nil {
		response.Internal(c, err)
		return
	}
	response.OK(c, assets)
}

func (h *Handler) AssetURL(c *gin.Context) {
	url, err := h.svc.GetAssetURL(c.Request.Context(), c.Param("id"))
	if err != nil {
		response.NotFound(c, "asset not found")
		return
	}
	response.OK(c, gin.H{"url": url})
}

func (h *Handler) DeleteAsset(c *gin.Context) {
	if err := h.svc.DeleteAsset(c.Request.Context(), c.Param("id")); err != nil {
		response.Internal(c, err)
		return
	}
	response.NoContent(c)
}

func (h *Handler) ListApiKeys(c *gin.Context) {
	keys, err := h.svc.ListApiKeys(c.Request.Context())
	if err != nil {
		response.Internal(c, err)
		return
	}
	response.OK(c, keys)
}

func (h *Handler) DeleteApiKey(c *gin.Context) {
	if err := h.svc.DeleteApiKey(c.Request.Context(), c.Param("id")); err != nil {
		response.Internal(c, err)
		return
	}
	response.NoContent(c)
}
