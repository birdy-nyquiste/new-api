package middleware

import (
	"bytes"
	"fmt"
	"io"
	"net/http"
	"strings"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/dto"
	"github.com/QuantumNous/new-api/setting/operation_setting"

	"github.com/gin-gonic/gin"
)

// PlaygroundEvaluateAdapter 将评估请求改写为标准的 playground 聊天请求：
// 服务端注入管理员配置的评估模型与提示词（提示词不暴露给用户），
// 改写请求体与路径后交由 Distribute 及 relay 流程按常规计费处理。
func PlaygroundEvaluateAdapter() gin.HandlerFunc {
	return func(c *gin.Context) {
		setting := operation_setting.GetModelLabSetting()
		if !setting.EvaluationEnabled || setting.EvaluationModel == "" {
			abortWithOpenAiMessage(c, http.StatusForbidden, "evaluation is not enabled on this site")
			return
		}

		evaluateRequest := &dto.PlaygroundEvaluateRequest{}
		if err := common.UnmarshalBodyReusable(c, evaluateRequest); err != nil {
			abortWithOpenAiMessage(c, http.StatusBadRequest, "invalid evaluate request: "+err.Error())
			return
		}
		if strings.TrimSpace(evaluateRequest.Question) == "" {
			abortWithOpenAiMessage(c, http.StatusBadRequest, "question is required")
			return
		}
		if len(evaluateRequest.Responses) != 3 {
			abortWithOpenAiMessage(c, http.StatusBadRequest, "exactly 3 responses are required")
			return
		}
		for _, response := range evaluateRequest.Responses {
			if strings.TrimSpace(response) == "" {
				abortWithOpenAiMessage(c, http.StatusBadRequest, "responses must not be empty")
				return
			}
		}

		var sb strings.Builder
		sb.WriteString("<question>\n")
		sb.WriteString(evaluateRequest.Question)
		sb.WriteString("\n</question>")
		for i, response := range evaluateRequest.Responses {
			sb.WriteString(fmt.Sprintf("\n\n<response_%d>\n", i+1))
			sb.WriteString(response)
			sb.WriteString(fmt.Sprintf("\n</response_%d>", i+1))
		}

		chatRequest := map[string]any{
			"model":          setting.EvaluationModel,
			"stream":         true,
			"stream_options": map[string]any{"include_usage": true},
			"messages": []map[string]any{
				{"role": "system", "content": setting.GetEvaluationPrompt()},
				{"role": "user", "content": sb.String()},
			},
		}
		if evaluateRequest.Group != "" {
			chatRequest["group"] = evaluateRequest.Group
		}
		data, err := common.Marshal(chatRequest)
		if err != nil {
			abortWithOpenAiMessage(c, http.StatusInternalServerError, "failed to build evaluation request: "+err.Error())
			return
		}

		// 必须先清理已缓存的 BodyStorage，否则后续读取仍命中旧请求体
		common.CleanupBodyStorage(c)
		c.Set(common.KeyRequestBody, data)
		c.Request.Body = io.NopCloser(bytes.NewBuffer(data))
		c.Request.ContentLength = int64(len(data))
		c.Request.Header.Set("Content-Type", "application/json")
		// 改写路径，使 Distribute 与 relay 按 playground 聊天请求处理
		c.Request.URL.Path = "/pg/chat/completions"

		c.Next()
	}
}
