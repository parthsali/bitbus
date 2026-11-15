package auth

import (
	"context"
	"errors"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/jackc/pgx/v5"
	"github.com/parthsali/bitbus/apps/api/internal/store"
)

// GoogleUserInfo is the subset of Google's /userinfo response we need.
type GoogleUserInfo struct {
	ID      string `json:"id"`
	Email   string `json:"email"`
	Name    string `json:"name"`
	Picture string `json:"picture"`
}

// Service handles auth business logic: find-or-create users and JWT issuance.
type Service struct {
	queries     *store.Queries
	jwtSecret   string
	adminEmails map[string]bool
}

func NewService(queries *store.Queries, jwtSecret, adminEmails string) *Service {
	emails := make(map[string]bool)
	for _, e := range strings.Split(adminEmails, ",") {
		e = strings.TrimSpace(e)
		if e != "" {
			emails[strings.ToLower(e)] = true
		}
	}
	return &Service{queries: queries, jwtSecret: jwtSecret, adminEmails: emails}
}

// FindOrCreateUser looks up a user by Google ID, falls back to email,
// and creates a new record if neither exists.
func (s *Service) FindOrCreateUser(ctx context.Context, info *GoogleUserInfo) (store.User, error) {
	googleID := info.ID

	// 1. Try by Google ID
	user, err := s.queries.GetUserByGoogleID(ctx, &googleID)
	if err == nil {
		updated, err := s.queries.UpdateUser(ctx, store.UpdateUserParams{
			Name: info.Name, AvatarUrl: info.Picture, GoogleID: &googleID, ID: user.ID,
		})
		if err != nil {
			return store.User{}, err
		}
		return s.maybePromoteAdmin(ctx, updated)
	}
	if !errors.Is(err, pgx.ErrNoRows) {
		return store.User{}, err
	}

	// 2. Try by email (link existing account)
	user, err = s.queries.GetUserByEmail(ctx, info.Email)
	if err == nil {
		updated, err := s.queries.UpdateUser(ctx, store.UpdateUserParams{
			Name: info.Name, AvatarUrl: info.Picture, GoogleID: &googleID, ID: user.ID,
		})
		if err != nil {
			return store.User{}, err
		}
		return s.maybePromoteAdmin(ctx, updated)
	}
	if !errors.Is(err, pgx.ErrNoRows) {
		return store.User{}, err
	}

	// 3. Create new user
	user, err = s.queries.CreateUser(ctx, store.CreateUserParams{
		Email:     info.Email,
		Name:      info.Name,
		AvatarUrl: info.Picture,
		GoogleID:  &googleID,
	})
	if err != nil {
		return store.User{}, err
	}

	return s.maybePromoteAdmin(ctx, user)
}

// maybePromoteAdmin auto-promotes users whose email is in ADMIN_EMAILS.
func (s *Service) maybePromoteAdmin(ctx context.Context, user store.User) (store.User, error) {
	if len(s.adminEmails) > 0 && s.adminEmails[strings.ToLower(user.Email)] && !user.IsAdmin {
		return s.queries.SetUserAdmin(ctx, store.SetUserAdminParams{ID: user.ID, IsAdmin: true})
	}
	return user, nil
}

// GenerateJWT signs a 24-hour HS256 token for the given user.
// Claims include name and avatar so the frontend can render the user without an API call.
func (s *Service) GenerateJWT(user store.User) (string, error) {
	claims := jwt.MapClaims{
		"user_id":    user.ID,
		"email":      user.Email,
		"name":       user.Name,
		"avatar_url": user.AvatarUrl,
		"is_admin":   user.IsAdmin,
		"exp":        time.Now().Add(24 * time.Hour).Unix(),
		"iat":        time.Now().Unix(),
	}
	return jwt.NewWithClaims(jwt.SigningMethodHS256, claims).SignedString([]byte(s.jwtSecret))
}
