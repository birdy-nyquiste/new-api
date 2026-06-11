package operation_setting

import "github.com/QuantumNous/new-api/setting/config"

// DefaultEvaluationPrompt 模型对比评估的默认系统提示词
const DefaultEvaluationPrompt = `You are an impartial judge evaluating the quality of AI model responses. You will be given a question and three responses labeled "Response 1", "Response 2", and "Response 3". You do not know which model produced which response.

Evaluate each response on accuracy, helpfulness, completeness, and clarity. Then:
1. Briefly assess each response's strengths and weaknesses.
2. Rank the three responses from best to worst.
3. Declare the best response and explain the decisive factors.

Be objective and concise. Respond in the same language as the question.`

type ModelLabSetting struct {
	EvaluationEnabled bool   `json:"evaluation_enabled"`
	EvaluationModel   string `json:"evaluation_model"`
	EvaluationPrompt  string `json:"evaluation_prompt"`
}

// 默认配置
var modelLabSetting = ModelLabSetting{
	EvaluationEnabled: false,
	EvaluationModel:   "",
	EvaluationPrompt:  "",
}

func init() {
	// 注册到全局配置管理器
	config.GlobalConfig.Register("model_lab_setting", &modelLabSetting)
}

func GetModelLabSetting() *ModelLabSetting {
	return &modelLabSetting
}

// GetEvaluationPrompt 返回评估提示词，未配置时回退到内置默认值
func (s *ModelLabSetting) GetEvaluationPrompt() string {
	if s.EvaluationPrompt != "" {
		return s.EvaluationPrompt
	}
	return DefaultEvaluationPrompt
}
