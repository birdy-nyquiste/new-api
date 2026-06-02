package model

import (
	"strings"

	"gorm.io/gorm"
)

type UserEmailIdentity struct {
	Id              int    `json:"id" gorm:"primaryKey"`
	UserId          int    `json:"user_id" gorm:"not null;uniqueIndex;index"`
	Email           string `json:"email" gorm:"type:varchar(255);not null"`
	NormalizedEmail string `json:"normalized_email" gorm:"type:varchar(255);not null;uniqueIndex"`
	VerifiedAt      int64  `json:"verified_at" gorm:"type:bigint;not null"`
	CreatedAt       int64  `json:"created_at" gorm:"autoCreateTime;column:created_at"`
	UpdatedAt       int64  `json:"updated_at" gorm:"autoUpdateTime;column:updated_at"`
}

func NormalizeEmailIdentity(email string) string {
	return strings.ToLower(strings.TrimSpace(email))
}

func GetUserEmailIdentityByNormalizedEmail(normalizedEmail string) (*UserEmailIdentity, error) {
	var identity UserEmailIdentity
	err := DB.Where("normalized_email = ?", normalizedEmail).First(&identity).Error
	if err != nil {
		return nil, err
	}
	return &identity, nil
}

func GetUserByEmailIdentity(normalizedEmail string) (*User, error) {
	identity, err := GetUserEmailIdentityByNormalizedEmail(normalizedEmail)
	if err != nil {
		return nil, err
	}
	var user User
	err = DB.First(&user, identity.UserId).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func IsEmailIdentityClaimed(normalizedEmail string) bool {
	var count int64
	DB.Model(&UserEmailIdentity{}).Where("normalized_email = ?", normalizedEmail).Count(&count)
	return count > 0
}

func CanClaimEmailIdentityForUser(userId int, normalizedEmail string) bool {
	if normalizedEmail == "" {
		return false
	}
	var identityCount int64
	DB.Model(&UserEmailIdentity{}).Where("normalized_email = ? AND user_id <> ?", normalizedEmail, userId).Count(&identityCount)
	if identityCount > 0 {
		return false
	}
	var usernameCount int64
	DB.Unscoped().Model(&User{}).Where("username = ? AND id <> ?", normalizedEmail, userId).Count(&usernameCount)
	if usernameCount > 0 {
		return false
	}
	var emailCount int64
	DB.Unscoped().Model(&User{}).Where("LOWER(TRIM(email)) = ? AND id <> ?", normalizedEmail, userId).Count(&emailCount)
	return emailCount == 0
}

func CreateUserEmailIdentityWithTx(tx *gorm.DB, identity *UserEmailIdentity) error {
	identity.Email = strings.TrimSpace(identity.Email)
	identity.NormalizedEmail = NormalizeEmailIdentity(identity.NormalizedEmail)
	if identity.NormalizedEmail == "" {
		identity.NormalizedEmail = NormalizeEmailIdentity(identity.Email)
	}
	return tx.Create(identity).Error
}

func backfillUserEmailIdentities() error {
	var rows []struct {
		Email string
		Count int64
	}
	if err := DB.Model(&User{}).
		Select("LOWER(TRIM(email)) as email, COUNT(*) as count").
		Where("email <> ''").
		Group("LOWER(TRIM(email))").
		Find(&rows).Error; err != nil {
		return err
	}

	uniqueEmails := make(map[string]struct{})
	for _, row := range rows {
		if row.Email != "" && row.Count == 1 {
			uniqueEmails[row.Email] = struct{}{}
		}
	}
	if len(uniqueEmails) == 0 {
		return nil
	}

	var users []User
	if err := DB.Select("id", "email").Where("email <> ''").Find(&users).Error; err != nil {
		return err
	}
	for _, user := range users {
		normalized := NormalizeEmailIdentity(user.Email)
		if _, ok := uniqueEmails[normalized]; !ok {
			continue
		}
		if IsEmailIdentityClaimed(normalized) {
			continue
		}
		identity := UserEmailIdentity{
			UserId:          user.Id,
			Email:           strings.TrimSpace(user.Email),
			NormalizedEmail: normalized,
			VerifiedAt:      1,
		}
		if err := DB.Create(&identity).Error; err != nil {
			return err
		}
	}
	return nil
}
