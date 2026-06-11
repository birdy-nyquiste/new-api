package dto

type PlayGroundRequest struct {
	Model string `json:"model,omitempty"`
	Group string `json:"group,omitempty"`
}

type PlaygroundEvaluateRequest struct {
	Group     string   `json:"group,omitempty"`
	Question  string   `json:"question"`
	Responses []string `json:"responses"`
}
