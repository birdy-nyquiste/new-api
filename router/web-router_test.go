package router

import (
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/QuantumNous/new-api/common"
)

func TestRenderIndexPageUsesConfiguredPreviewMetadata(t *testing.T) {
	originalSystemName := common.SystemName
	originalLogo := common.Logo
	t.Cleanup(func() {
		common.SystemName = originalSystemName
		common.Logo = originalLogo
	})

	common.SystemName = `Acme <AI>`
	common.Logo = "/brand/logo.png"

	request := httptest.NewRequest("GET", "http://internal.local/dashboard?from=chat", nil)
	request.Header.Set("X-Forwarded-Proto", "https")
	request.Header.Set("X-Forwarded-Host", "api.example.com")

	html := string(renderIndexPage([]byte(testIndexPage), request))

	assertContains(t, html, `<title>Acme &lt;AI&gt;</title>`)
	assertContains(t, html, `<meta name="title" content="Acme &lt;AI&gt;" />`)
	assertContains(t, html, `<link rel="icon" type="image/svg+xml" href="/brand/logo.png" />`)
	assertContains(t, html, `<link rel="icon" href="/brand/logo.png" type="image/svg+xml">`)
	assertContains(t, html, `<link rel="icon" href="/brand/logo.png" />`)
	assertContains(t, html, `<link rel="apple-touch-icon" href="/brand/logo.png" />`)
	assertContains(t, html, `<link rel="icon" href="/brand/logo.png">`)
	assertContains(t, html, `<meta property="og:title" content="Acme &lt;AI&gt;" />`)
	assertContains(t, html, `<meta property="og:image" content="https://api.example.com/brand/logo.png" />`)
	assertContains(t, html, `<meta property="og:url" content="https://api.example.com/dashboard?from=chat" />`)
	assertContains(t, html, `<meta name="twitter:title" content="Acme &lt;AI&gt;" />`)
	assertContains(t, html, `<meta name="twitter:image" content="https://api.example.com/brand/logo.png" />`)
}

func TestRenderIndexPageKeepsDefaultPreviewMetadataFallback(t *testing.T) {
	originalSystemName := common.SystemName
	originalLogo := common.Logo
	t.Cleanup(func() {
		common.SystemName = originalSystemName
		common.Logo = originalLogo
	})

	common.SystemName = ""
	common.Logo = ""

	request := httptest.NewRequest("GET", "https://example.com/", nil)
	html := string(renderIndexPage([]byte(testIndexPage), request))

	assertContains(t, html, `<title>Nyquiste Router</title>`)
	assertContains(t, html, `<meta name="title" content="Nyquiste Router" />`)
	assertContains(t, html, `<link rel="icon" type="image/svg+xml" href="/logo.svg" />`)
	assertContains(t, html, `<link rel="icon" href="/logo.png" />`)
	assertContains(t, html, `<link rel="apple-touch-icon" href="/logo.png" />`)
	assertContains(t, html, `<link rel="icon" href="/favicon.ico">`)
	assertContains(t, html, `<meta property="og:title" content="Nyquiste Router" />`)
	assertContains(t, html, `<meta property="og:image" content="https://example.com/logo.png" />`)
}

func assertContains(t *testing.T, haystack string, needle string) {
	t.Helper()
	if !strings.Contains(haystack, needle) {
		t.Fatalf("expected rendered HTML to contain %q\nHTML:\n%s", needle, haystack)
	}
}

const testIndexPage = `<!doctype html>
<html lang="en">
  <head>
    <link rel="icon" type="image/svg+xml" href="/logo.svg" />
    <link rel="icon" href="/logo.svg" type="image/svg+xml">
    <link rel="icon" href="/logo.png" />
    <link rel="apple-touch-icon" href="/logo.png" />
    <title>New API</title>
    <meta name="title" content="New API" />
  <link rel="icon" href="/favicon.ico"></head>
  <body><div id="root"></div></body>
</html>`
