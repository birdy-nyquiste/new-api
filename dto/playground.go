package dto

type PlayGroundRequest struct {
	Model string `json:"model,omitempty"`
	Group string `json:"group,omitempty"`
}

type PlaygroundEvaluateRequest struct {
	Group     string   `json:"group,omitempty"`
	Question  string   `json:"question"`
	Responses []string `json:"responses"`
	// Models holds the model name that produced each response, in the same
	// order as Responses. The judge sees these names so its verdict can refer
	// to models directly instead of "Response 1/2/3".
	Models []string `json:"models,omitempty"`
}
