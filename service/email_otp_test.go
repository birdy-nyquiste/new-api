package service

import (
	"testing"

	"github.com/QuantumNous/new-api/common"
	"github.com/stretchr/testify/require"
)

func TestValidateEmailPolicyForRegistrationUsesNormalizedEmail(t *testing.T) {
	restoreDomainRestriction := common.EmailDomainRestrictionEnabled
	restoreWhitelist := common.EmailDomainWhitelist
	restoreAliasRestriction := common.EmailAliasRestrictionEnabled
	t.Cleanup(func() {
		common.EmailDomainRestrictionEnabled = restoreDomainRestriction
		common.EmailDomainWhitelist = restoreWhitelist
		common.EmailAliasRestrictionEnabled = restoreAliasRestriction
	})

	common.EmailDomainRestrictionEnabled = true
	common.EmailDomainWhitelist = []string{"example.com"}
	common.EmailAliasRestrictionEnabled = false

	require.NoError(t, ValidateEmailPolicyForRegistration(" User@Example.COM "))
	require.Error(t, ValidateEmailPolicyForRegistration("user@blocked.com"))
}

func TestValidateEmailPolicyForRegistrationRejectsAliasesWhenEnabled(t *testing.T) {
	restoreDomainRestriction := common.EmailDomainRestrictionEnabled
	restoreWhitelist := common.EmailDomainWhitelist
	restoreAliasRestriction := common.EmailAliasRestrictionEnabled
	t.Cleanup(func() {
		common.EmailDomainRestrictionEnabled = restoreDomainRestriction
		common.EmailDomainWhitelist = restoreWhitelist
		common.EmailAliasRestrictionEnabled = restoreAliasRestriction
	})

	common.EmailDomainRestrictionEnabled = false
	common.EmailDomainWhitelist = nil
	common.EmailAliasRestrictionEnabled = true

	require.Error(t, ValidateEmailPolicyForRegistration("user+tag@example.com"))
	require.Error(t, ValidateEmailPolicyForRegistration("first.last@example.com"))
	require.NoError(t, ValidateEmailPolicyForRegistration("plain@example.com"))
}
