package service

import (
	"context"
	"crypto/rand"
	"errors"
	"fmt"
	"math/big"
	"strings"
	"time"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/constant"
	"github.com/QuantumNous/new-api/logger"
	"github.com/QuantumNous/new-api/model"
	"github.com/QuantumNous/new-api/setting"
	"github.com/QuantumNous/new-api/setting/operation_setting"
	"github.com/go-redis/redis/v8"
	"gorm.io/gorm"
)

const (
	EmailOTPPurposeLogin    = "login"
	EmailOTPPurposeRegister = "register"
)

const genericEmailOTPMessage = "If this email can receive a code, we sent one."

type EmailOTPSendResult struct {
	ChallengeID string `json:"challenge_id"`
	Message     string `json:"message"`
}

type emailOTPChallenge struct {
	ChallengeID     string `json:"challenge_id"`
	Purpose         string `json:"purpose"`
	NormalizedEmail string `json:"normalized_email"`
	CodeHash        string `json:"code_hash"`
	Attempts        int    `json:"attempts"`
	ExpiresAt       int64  `json:"expires_at"`
}

var ErrEmailOTPUnavailable = errors.New("email OTP is temporarily unavailable")
var ErrEmailOTPInvalid = errors.New("email OTP code is invalid or expired")
var ErrEmailOTPMaxAttempts = errors.New("email OTP maximum attempts exceeded")

func GenericEmailOTPMessage() string {
	return genericEmailOTPMessage
}

func NormalizeEmailForAuth(email string) string {
	return model.NormalizeEmailIdentity(email)
}

func SendEmailOTP(email string, purpose string, ip string) (*EmailOTPSendResult, error) {
	normalizedEmail := NormalizeEmailForAuth(email)
	challengeID, err := randomToken(24)
	if err != nil {
		return nil, err
	}
	result := &EmailOTPSendResult{
		ChallengeID: challengeID,
		Message:     genericEmailOTPMessage,
	}

	if !emailOTPPurposeEnabled(purpose) {
		return result, nil
	}
	if err := requireEmailOTPRedis(); err != nil {
		common.SysLog("email OTP Redis is not available: " + err.Error())
		return nil, ErrEmailOTPUnavailable
	}
	if ready, reason := common.SMTPReadyForAuthEmail(); !ready {
		common.SysLog("email OTP SMTP is not ready: " + reason)
		return result, nil
	}
	if !allowEmailOTPSend(normalizedEmail, ip) {
		return result, nil
	}
	if purpose == EmailOTPPurposeRegister {
		if err := ValidateEmailPolicyForRegistration(normalizedEmail); err != nil {
			return result, nil
		}
		if !CanRegisterEmailIdentity(normalizedEmail) {
			return result, nil
		}
	} else if purpose == EmailOTPPurposeLogin {
		if _, err := model.GetUserByEmailIdentity(normalizedEmail); err != nil {
			return result, nil
		}
	} else {
		return result, nil
	}

	code, err := randomNumericCode(8)
	if err != nil {
		return nil, err
	}
	state, _ := getEmailOTPChallenge(purpose, normalizedEmail)
	attempts := 0
	if state != nil {
		attempts = state.Attempts
	}
	state = &emailOTPChallenge{
		ChallengeID:     challengeID,
		Purpose:         purpose,
		NormalizedEmail: normalizedEmail,
		CodeHash:        hashEmailOTPCode(challengeID, purpose, normalizedEmail, code),
		Attempts:        attempts,
		ExpiresAt:       time.Now().Add(emailOTPValidity()).Unix(),
	}
	data, err := common.Marshal(state)
	if err != nil {
		return nil, err
	}
	if err := common.RDB.Set(context.Background(), emailOTPStateKey(purpose, normalizedEmail), string(data), emailOTPValidity()).Err(); err != nil {
		common.SysLog("failed to store email OTP challenge: " + err.Error())
		return nil, ErrEmailOTPUnavailable
	}
	subject := fmt.Sprintf("%s sign-in code", common.SystemName)
	if purpose == EmailOTPPurposeRegister {
		subject = fmt.Sprintf("%s sign-up code", common.SystemName)
	}
	content := fmt.Sprintf("<p>Your %s verification code is:</p><p><strong style='font-size: 24px;'>%s</strong></p><p>This code expires in %d minutes. If you did not request it, ignore this email.</p>", common.SystemName, code, common.EmailOTPValidityMinutes)
	if err := common.SendEmail(subject, normalizedEmail, content); err != nil {
		common.SysLog(fmt.Sprintf("failed to send email OTP to %s: %v", normalizedEmail, err))
		_ = common.RDB.Del(context.Background(), emailOTPStateKey(purpose, normalizedEmail)).Err()
		return result, nil
	}
	return result, nil
}

func VerifyEmailOTP(email string, purpose string, challengeID string, code string) error {
	normalizedEmail := NormalizeEmailForAuth(email)
	if err := requireEmailOTPRedis(); err != nil {
		return ErrEmailOTPUnavailable
	}
	if !emailOTPPurposeEnabled(purpose) {
		return ErrEmailOTPInvalid
	}
	stateKey := emailOTPStateKey(purpose, normalizedEmail)
	ctx := context.Background()
	for attempts := 0; attempts < 3; attempts++ {
		err := common.RDB.Watch(ctx, func(tx *redis.Tx) error {
			raw, err := tx.Get(ctx, stateKey).Result()
			if errors.Is(err, redis.Nil) {
				return ErrEmailOTPInvalid
			}
			if err != nil {
				return err
			}
			var state emailOTPChallenge
			if err := common.Unmarshal([]byte(raw), &state); err != nil {
				return err
			}
			if state.Attempts >= common.EmailOTPMaxAttempts {
				_, _ = tx.TxPipelined(ctx, func(pipe redis.Pipeliner) error {
					pipe.Del(ctx, stateKey)
					return nil
				})
				return ErrEmailOTPMaxAttempts
			}
			if state.ChallengeID != challengeID ||
				state.Purpose != purpose ||
				state.NormalizedEmail != normalizedEmail ||
				time.Now().Unix() >= state.ExpiresAt ||
				state.CodeHash != hashEmailOTPCode(challengeID, purpose, normalizedEmail, strings.TrimSpace(code)) {
				state.Attempts++
				ttl := time.Until(time.Unix(state.ExpiresAt, 0))
				if ttl <= 0 {
					ttl = time.Second
				}
				updated, marshalErr := common.Marshal(state)
				if marshalErr != nil {
					return marshalErr
				}
				_, pipeErr := tx.TxPipelined(ctx, func(pipe redis.Pipeliner) error {
					pipe.Set(ctx, stateKey, string(updated), ttl)
					return nil
				})
				if pipeErr != nil {
					return pipeErr
				}
				return ErrEmailOTPInvalid
			}
			_, err = tx.TxPipelined(ctx, func(pipe redis.Pipeliner) error {
				pipe.Del(ctx, stateKey)
				return nil
			})
			return err
		}, stateKey)
		if errors.Is(err, redis.TxFailedErr) {
			continue
		}
		return err
	}
	return ErrEmailOTPInvalid
}

func LoginUserByEmailOTP(email string) (*model.User, error) {
	user, err := model.GetUserByEmailIdentity(NormalizeEmailForAuth(email))
	if err != nil {
		return nil, err
	}
	if user.Status != common.UserStatusEnabled {
		return nil, ErrEmailOTPInvalid
	}
	return user, nil
}

func RegisterUserByEmailOTP(email string, inviterAffCode string) (*model.User, error) {
	normalizedEmail := NormalizeEmailForAuth(email)
	if !CanRegisterEmailIdentity(normalizedEmail) {
		return nil, fmt.Errorf("email is not available")
	}
	inviterId, _ := model.GetUserIdByAffCode(inviterAffCode)
	username, err := generateOpaqueUsername()
	if err != nil {
		return nil, err
	}
	displayName := defaultDisplayNameFromEmail(normalizedEmail)
	user := &model.User{
		Username:        username,
		DisplayName:     displayName,
		Email:           normalizedEmail,
		InviterId:       inviterId,
		Role:            common.RoleCommonUser,
		Status:          common.UserStatusEnabled,
		EmailAuthLocked: true,
	}
	err = model.DB.Transaction(func(tx *gorm.DB) error {
		if err := user.InsertWithTx(tx, inviterId); err != nil {
			return err
		}
		identity := &model.UserEmailIdentity{
			UserId:          user.Id,
			Email:           normalizedEmail,
			NormalizedEmail: normalizedEmail,
			VerifiedAt:      common.GetTimestamp(),
		}
		return model.CreateUserEmailIdentityWithTx(tx, identity)
	})
	if err != nil {
		return nil, err
	}
	user.FinalizeOAuthUserCreation(inviterId)
	if err := createDefaultTokenIfNeeded(user); err != nil {
		return nil, err
	}
	return user, nil
}

func CanRegisterEmailIdentity(normalizedEmail string) bool {
	if normalizedEmail == "" {
		return false
	}
	if model.IsEmailIdentityClaimed(normalizedEmail) {
		return false
	}
	var usernameCount int64
	model.DB.Unscoped().Model(&model.User{}).Where("username = ?", normalizedEmail).Count(&usernameCount)
	if usernameCount > 0 {
		return false
	}
	var emailCount int64
	model.DB.Unscoped().Model(&model.User{}).Where("LOWER(TRIM(email)) = ?", normalizedEmail).Count(&emailCount)
	return emailCount == 0
}

func ValidateEmailPolicyForRegistration(email string) error {
	normalized := NormalizeEmailForAuth(email)
	parts := strings.Split(normalized, "@")
	if len(parts) != 2 || parts[0] == "" || parts[1] == "" {
		return fmt.Errorf("invalid email")
	}
	if common.EmailDomainRestrictionEnabled {
		allowed := false
		for _, domain := range common.EmailDomainWhitelist {
			if strings.TrimSpace(strings.ToLower(domain)) == parts[1] {
				allowed = true
				break
			}
		}
		if !allowed {
			return fmt.Errorf("email domain is not allowed")
		}
	}
	if common.EmailAliasRestrictionEnabled && (strings.Contains(parts[0], "+") || strings.Contains(parts[0], ".")) {
		return fmt.Errorf("email aliases are not allowed")
	}
	return nil
}

func emailOTPPurposeEnabled(purpose string) bool {
	switch purpose {
	case EmailOTPPurposeLogin:
		return common.EmailOTPLoginEnabled
	case EmailOTPPurposeRegister:
		return common.EmailOTPRegisterEnabled && common.RegisterEnabled
	default:
		return false
	}
}

func requireEmailOTPRedis() error {
	if !common.RedisEnabled || common.RDB == nil {
		return fmt.Errorf("Redis is not enabled")
	}
	return common.RDB.Ping(context.Background()).Err()
}

func allowEmailOTPSend(normalizedEmail string, ip string) bool {
	ctx := context.Background()
	cooldownKey := "email_otp:cooldown:" + normalizedEmail
	ok, err := common.RDB.SetNX(ctx, cooldownKey, "1", time.Duration(common.EmailOTPResendCooldownSeconds)*time.Second).Result()
	if err != nil || !ok {
		return false
	}
	limit := common.EmailOTPHourlyLimit
	if limit <= 0 {
		limit = 5
	}
	if !incrementWithinLimit("email_otp:rate:email:"+normalizedEmail, limit, time.Hour) {
		return false
	}
	ipLimit := limit * 5
	if ipLimit < 10 {
		ipLimit = 10
	}
	return incrementWithinLimit("email_otp:rate:ip:"+ip, ipLimit, time.Hour)
}

func incrementWithinLimit(key string, limit int, ttl time.Duration) bool {
	ctx := context.Background()
	count, err := common.RDB.Incr(ctx, key).Result()
	if err != nil {
		return false
	}
	if count == 1 {
		_ = common.RDB.Expire(ctx, key, ttl).Err()
	}
	return count <= int64(limit)
}

func getEmailOTPChallenge(purpose string, normalizedEmail string) (*emailOTPChallenge, error) {
	raw, err := common.RDB.Get(context.Background(), emailOTPStateKey(purpose, normalizedEmail)).Result()
	if errors.Is(err, redis.Nil) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	var state emailOTPChallenge
	if err := common.Unmarshal([]byte(raw), &state); err != nil {
		return nil, err
	}
	return &state, nil
}

func emailOTPStateKey(purpose string, normalizedEmail string) string {
	return "email_otp:state:" + purpose + ":" + normalizedEmail
}

func emailOTPValidity() time.Duration {
	minutes := common.EmailOTPValidityMinutes
	if minutes <= 0 {
		minutes = 10
	}
	return time.Duration(minutes) * time.Minute
}

func hashEmailOTPCode(challengeID string, purpose string, normalizedEmail string, code string) string {
	return common.GenerateHMAC(challengeID + ":" + purpose + ":" + normalizedEmail + ":" + code)
}

func randomNumericCode(length int) (string, error) {
	if length <= 0 {
		length = 8
	}
	var builder strings.Builder
	for i := 0; i < length; i++ {
		n, err := rand.Int(rand.Reader, big.NewInt(10))
		if err != nil {
			return "", err
		}
		builder.WriteByte(byte('0' + n.Int64()))
	}
	return builder.String(), nil
}

func randomToken(length int) (string, error) {
	const alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	var builder strings.Builder
	for i := 0; i < length; i++ {
		n, err := rand.Int(rand.Reader, big.NewInt(int64(len(alphabet))))
		if err != nil {
			return "", err
		}
		builder.WriteByte(alphabet[n.Int64()])
	}
	return builder.String(), nil
}

func generateOpaqueUsername() (string, error) {
	for i := 0; i < 20; i++ {
		token, err := randomToken(12)
		if err != nil {
			return "", err
		}
		username := "u_" + strings.ToLower(token)
		exists, err := model.CheckUserExistOrDeleted(username, "")
		if err != nil {
			return "", err
		}
		if !exists {
			return username, nil
		}
	}
	return "", fmt.Errorf("failed to generate username")
}

func defaultDisplayNameFromEmail(email string) string {
	local := strings.Split(email, "@")[0]
	local = strings.TrimSpace(local)
	if local == "" {
		return "User"
	}
	if len(local) > 20 {
		return local[:20]
	}
	return local
}

func createDefaultTokenIfNeeded(user *model.User) error {
	if !constant.GenerateDefaultToken {
		return nil
	}
	key, err := common.GenerateKey()
	if err != nil {
		return err
	}
	token := model.Token{
		UserId:             user.Id,
		Name:               user.Username + "的初始令牌",
		Key:                key,
		CreatedTime:        common.GetTimestamp(),
		AccessedTime:       common.GetTimestamp(),
		ExpiredTime:        -1,
		RemainQuota:        500000,
		UnlimitedQuota:     true,
		ModelLimitsEnabled: false,
	}
	if setting.DefaultUseAutoGroup {
		token.Group = "auto"
	}
	if err := token.Insert(); err != nil {
		return err
	}
	if common.QuotaForNewUser > 0 {
		logger.LogInfo(context.Background(), fmt.Sprintf("default token created for OTP user %d with initial quota %s", user.Id, logger.LogQuota(common.QuotaForNewUser)))
	}
	if operation_setting.DemoSiteEnabled {
		return nil
	}
	return nil
}
