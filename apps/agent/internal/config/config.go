// Package config loads agent configuration from a JSON file or env vars.
package config

import (
	"encoding/json"
	"fmt"
	"os"
)

type Config struct {
	// BackendURL is the WebSocket URL of the backend, e.g. wss://api.bitbus.tech/ws
	BackendURL string `json:"backend_url"`
	// DeviceID is the UUID assigned during device registration.
	DeviceID string `json:"device_id"`
	// DeviceSecret is the plain secret from the registration response (shown once).
	DeviceSecret string `json:"device_secret"`
	// Brightness is the initial LED matrix brightness (0-100).
	Brightness int `json:"brightness"`
	// MatrixRows and MatrixCols define the LED panel dimensions.
	MatrixRows int `json:"matrix_rows"`
	MatrixCols int `json:"matrix_cols"`
}

const defaultConfigPath = "/etc/bitbus-agent/config.json"

// Load reads config from the path in BITBUS_CONFIG_PATH env var, or the default path.
// Individual fields can be overridden by environment variables.
func Load() (*Config, error) {
	path := os.Getenv("BITBUS_CONFIG_PATH")
	if path == "" {
		path = defaultConfigPath
	}

	cfg := &Config{
		Brightness: 80,
		MatrixRows: 32,
		MatrixCols: 64,
	}

	if data, err := os.ReadFile(path); err == nil {
		if err := json.Unmarshal(data, cfg); err != nil {
			return nil, fmt.Errorf("parse config %s: %w", path, err)
		}
	}

	// Environment variable overrides (useful for containers / testing).
	if v := os.Getenv("BITBUS_BACKEND_URL"); v != "" {
		cfg.BackendURL = v
	}
	if v := os.Getenv("BITBUS_DEVICE_ID"); v != "" {
		cfg.DeviceID = v
	}
	if v := os.Getenv("BITBUS_DEVICE_SECRET"); v != "" {
		cfg.DeviceSecret = v
	}

	if cfg.BackendURL == "" {
		return nil, fmt.Errorf("backend_url is required (set BITBUS_BACKEND_URL or config.json)")
	}
	if cfg.DeviceID == "" || cfg.DeviceSecret == "" {
		return nil, fmt.Errorf("device_id and device_secret are required")
	}
	return cfg, nil
}
