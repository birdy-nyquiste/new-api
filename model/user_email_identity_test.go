package model

import (
	"testing"

	"github.com/glebarez/sqlite"
	"github.com/stretchr/testify/require"
	"gorm.io/gorm"
)

func setupEmailIdentityTestDB(t *testing.T) *gorm.DB {
	t.Helper()
	previousDB := DB
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	require.NoError(t, err)
	require.NoError(t, db.AutoMigrate(&User{}, &UserEmailIdentity{}))
	DB = db
	t.Cleanup(func() {
		sqlDB, err := db.DB()
		if err == nil {
			_ = sqlDB.Close()
		}
		DB = previousDB
	})
	return db
}

func TestNormalizeEmailIdentity(t *testing.T) {
	require.Equal(t, "user@example.com", NormalizeEmailIdentity(" User@Example.COM "))
}

func TestBackfillUserEmailIdentitiesSkipsDuplicateLegacyEmails(t *testing.T) {
	db := setupEmailIdentityTestDB(t)
	require.NoError(t, db.Create(&User{Username: "unique", Email: " Unique@Example.COM ", AffCode: "aff-unique"}).Error)
	require.NoError(t, db.Create(&User{Username: "dupe-a", Email: "same@example.com", AffCode: "aff-dupe-a"}).Error)
	require.NoError(t, db.Create(&User{Username: "dupe-b", Email: " SAME@example.com ", AffCode: "aff-dupe-b"}).Error)
	require.NoError(t, db.Create(&User{Username: "empty", Email: "", AffCode: "aff-empty"}).Error)

	require.NoError(t, backfillUserEmailIdentities())
	require.NoError(t, backfillUserEmailIdentities())

	var identities []UserEmailIdentity
	require.NoError(t, db.Find(&identities).Error)
	require.Len(t, identities, 1)
	require.Equal(t, "unique@example.com", identities[0].NormalizedEmail)
	require.Equal(t, int64(1), identities[0].VerifiedAt)
}

func TestCanClaimEmailIdentityForUserRejectsConflicts(t *testing.T) {
	db := setupEmailIdentityTestDB(t)
	owner := User{Username: "owner", Email: "owner@example.com", AffCode: "aff-owner"}
	other := User{Username: "other", Email: "other@example.com", AffCode: "aff-other"}
	usernameConflict := User{Username: "login@example.com", AffCode: "aff-login"}
	require.NoError(t, db.Create(&owner).Error)
	require.NoError(t, db.Create(&other).Error)
	require.NoError(t, db.Create(&usernameConflict).Error)
	require.NoError(t, db.Create(&UserEmailIdentity{
		UserId:          other.Id,
		Email:           "other@example.com",
		NormalizedEmail: "other@example.com",
		VerifiedAt:      1,
	}).Error)

	require.True(t, CanClaimEmailIdentityForUser(owner.Id, "new@example.com"))
	require.False(t, CanClaimEmailIdentityForUser(owner.Id, "other@example.com"))
	require.False(t, CanClaimEmailIdentityForUser(owner.Id, "login@example.com"))
}
