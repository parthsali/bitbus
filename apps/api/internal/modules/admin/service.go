package admin

import (
	"context"
	"fmt"

	"github.com/parthsali/bitbus/apps/api/internal/store"
)

type Stats struct {
	TotalUsers    int64 `json:"total_users"`
	ActiveUsers   int64 `json:"active_users"`
	TotalDevices  int64 `json:"total_devices"`
	OnlineDevices int64 `json:"online_devices"`
	TotalAssets   int64 `json:"total_assets"`
	StorageBytes  int64 `json:"storage_bytes"`
	TotalApiKeys  int64 `json:"total_api_keys"`
}

type UserDetail struct {
	store.User
	DeviceCount int64 `json:"device_count"`
	HasSpotify  bool  `json:"has_spotify"`
}

type AssetStorage interface {
	GenerateSignedDownloadURL(gcsPath string) (string, error)
	DeleteByPath(ctx context.Context, gcsPath string)
}

type Service struct {
	queries      *store.Queries
	assetStorage AssetStorage
}

func NewService(queries *store.Queries, assetStorage AssetStorage) *Service {
	return &Service{queries: queries, assetStorage: assetStorage}
}

func (s *Service) GetStats(ctx context.Context) (Stats, error) {
	totalUsers, err := s.queries.CountUsers(ctx)
	if err != nil {
		return Stats{}, err
	}
	activeUsers, err := s.queries.CountActiveUsers(ctx)
	if err != nil {
		return Stats{}, err
	}
	totalDevices, err := s.queries.CountDevices(ctx)
	if err != nil {
		return Stats{}, err
	}
	onlineDevices, err := s.queries.CountOnlineDevices(ctx)
	if err != nil {
		return Stats{}, err
	}
	totalAssets, err := s.queries.CountAssets(ctx)
	if err != nil {
		return Stats{}, err
	}
	storageBytes, err := s.queries.SumAssetBytes(ctx)
	if err != nil {
		return Stats{}, err
	}
	totalApiKeys, err := s.queries.CountApiKeys(ctx)
	if err != nil {
		return Stats{}, err
	}

	return Stats{
		TotalUsers:    totalUsers,
		ActiveUsers:   activeUsers,
		TotalDevices:  totalDevices,
		OnlineDevices: onlineDevices,
		TotalAssets:   totalAssets,
		StorageBytes:  storageBytes,
		TotalApiKeys:  totalApiKeys,
	}, nil
}

func (s *Service) ListUsers(ctx context.Context) ([]store.User, error) {
	return s.queries.ListAllUsers(ctx)
}

func (s *Service) GetUser(ctx context.Context, id string) (UserDetail, error) {
	user, err := s.queries.AdminGetUserByID(ctx, id)
	if err != nil {
		return UserDetail{}, err
	}
	deviceCount, err := s.queries.CountDevicesByUser(ctx, id)
	if err != nil {
		return UserDetail{}, err
	}
	hasSpotify, err := s.queries.HasSpotifyToken(ctx, id)
	if err != nil {
		return UserDetail{}, err
	}
	return UserDetail{User: user, DeviceCount: deviceCount, HasSpotify: hasSpotify}, nil
}

func (s *Service) SetUserActivation(ctx context.Context, id string, activated bool) (store.User, error) {
	return s.queries.SetUserActivation(ctx, store.SetUserActivationParams{ID: id, IsActivated: activated})
}

func (s *Service) SetUserAdmin(ctx context.Context, id string, isAdmin bool) (store.User, error) {
	return s.queries.SetUserAdmin(ctx, store.SetUserAdminParams{ID: id, IsAdmin: isAdmin})
}

func (s *Service) DeleteUser(ctx context.Context, id string) error {
	return s.queries.AdminDeleteUser(ctx, id)
}

func (s *Service) ListDevices(ctx context.Context) ([]store.ListAllDevicesRow, error) {
	return s.queries.ListAllDevices(ctx)
}

func (s *Service) DeleteDevice(ctx context.Context, id string) error {
	return s.queries.AdminDeleteDevice(ctx, id)
}

type AssetView struct {
	store.ListAllAssetsRow
	URL string `json:"url"`
}

func (s *Service) ListAssets(ctx context.Context) ([]AssetView, error) {
	rows, err := s.queries.ListAllAssets(ctx)
	if err != nil {
		return nil, err
	}
	out := make([]AssetView, len(rows))
	for i, r := range rows {
		url, _ := s.assetStorage.GenerateSignedDownloadURL(r.GcsPath)
		out[i] = AssetView{ListAllAssetsRow: r, URL: url}
	}
	return out, nil
}

func (s *Service) GetAssetURL(ctx context.Context, id string) (string, error) {
	asset, err := s.queries.AdminGetAssetByID(ctx, id)
	if err != nil {
		return "", fmt.Errorf("asset not found: %w", err)
	}
	return s.assetStorage.GenerateSignedDownloadURL(asset.GcsPath)
}

func (s *Service) DeleteAsset(ctx context.Context, id string) error {
	asset, err := s.queries.AdminGetAssetByID(ctx, id)
	if err != nil {
		return fmt.Errorf("asset not found: %w", err)
	}
	if err := s.queries.AdminDeleteAsset(ctx, id); err != nil {
		return err
	}
	s.assetStorage.DeleteByPath(ctx, asset.GcsPath)
	return nil
}

func (s *Service) ListApiKeys(ctx context.Context) ([]store.ListAllApiKeysRow, error) {
	return s.queries.ListAllApiKeys(ctx)
}

func (s *Service) DeleteApiKey(ctx context.Context, id string) error {
	return s.queries.AdminDeleteApiKey(ctx, id)
}
