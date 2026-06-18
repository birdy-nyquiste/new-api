package openai

import (
	"testing"

	"github.com/QuantumNous/new-api/constant"
	"github.com/QuantumNous/new-api/dto"
	relaycommon "github.com/QuantumNous/new-api/relay/common"
	"github.com/stretchr/testify/require"
)

func TestConvertOpenAIRequest_SanitizesFutureClaudeOpus4Params(t *testing.T) {
	temp := 0.7
	topP := 1.0
	topK := 5
	frequencyPenalty := 0.2
	presencePenalty := 0.3
	seed := 42.0
	request := &dto.GeneralOpenAIRequest{
		Model:            "anthropic/claude-opus-4-8",
		Temperature:      &temp,
		TopP:             &topP,
		TopK:             &topK,
		FrequencyPenalty: &frequencyPenalty,
		PresencePenalty:  &presencePenalty,
		Seed:             &seed,
		Messages: []dto.Message{
			{Role: "user", Content: "hello"},
		},
	}
	info := &relaycommon.RelayInfo{
		OriginModelName: "anthropic/claude-opus-4-8",
		ChannelMeta: &relaycommon.ChannelMeta{
			ChannelType:       constant.ChannelTypeOpenRouter,
			UpstreamModelName: "anthropic/claude-opus-4-8",
		},
	}

	converted, err := (&Adaptor{}).ConvertOpenAIRequest(nil, info, request)
	require.NoError(t, err)

	got, ok := converted.(*dto.GeneralOpenAIRequest)
	require.True(t, ok)
	require.Nil(t, got.Temperature)
	require.Nil(t, got.TopP)
	require.Nil(t, got.TopK)
	require.Nil(t, got.FrequencyPenalty)
	require.Nil(t, got.PresencePenalty)
	require.Nil(t, got.Seed)
	require.JSONEq(t, `{"include":true}`, string(got.Usage))
}

func TestConvertOpenAIRequest_KeepsClaudeOpus46TemperatureAdaptation(t *testing.T) {
	temp := 0.7
	topP := 1.0
	request := &dto.GeneralOpenAIRequest{
		Model:       "anthropic/claude-opus-4-6",
		Temperature: &temp,
		TopP:        &topP,
	}
	info := &relaycommon.RelayInfo{
		OriginModelName: "anthropic/claude-opus-4-6",
		ChannelMeta: &relaycommon.ChannelMeta{
			ChannelType:       constant.ChannelTypeOpenRouter,
			UpstreamModelName: "anthropic/claude-opus-4-6",
		},
	}

	converted, err := (&Adaptor{}).ConvertOpenAIRequest(nil, info, request)
	require.NoError(t, err)

	got := converted.(*dto.GeneralOpenAIRequest)
	require.NotNil(t, got.Temperature)
	require.Equal(t, temp, *got.Temperature)
	require.Nil(t, got.TopP)
	require.JSONEq(t, `{"include":true}`, string(got.Usage))
}
