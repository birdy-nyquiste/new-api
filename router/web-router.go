package router

import (
	"bytes"
	"embed"
	"html"
	"net/http"
	"net/url"
	"strings"

	"github.com/QuantumNous/new-api/common"
	"github.com/QuantumNous/new-api/controller"
	"github.com/QuantumNous/new-api/middleware"
	"github.com/gin-contrib/gzip"
	"github.com/gin-contrib/static"
	"github.com/gin-gonic/gin"
)

// ThemeAssets holds the embedded frontend assets for both themes.
type ThemeAssets struct {
	DefaultBuildFS   embed.FS
	DefaultIndexPage []byte
	ClassicBuildFS   embed.FS
	ClassicIndexPage []byte
}

func SetWebRouter(router *gin.Engine, assets ThemeAssets) {
	defaultFS := common.EmbedFolder(assets.DefaultBuildFS, "web/default/dist")
	classicFS := common.EmbedFolder(assets.ClassicBuildFS, "web/classic/dist")
	themeFS := common.NewThemeAwareFS(defaultFS, classicFS)

	router.Use(gzip.Gzip(gzip.DefaultCompression))
	router.Use(middleware.GlobalWebRateLimit())
	router.Use(middleware.Cache())
	router.Use(static.Serve("/", themeFS))
	router.NoRoute(func(c *gin.Context) {
		c.Set(middleware.RouteTagKey, "web")
		if strings.HasPrefix(c.Request.RequestURI, "/v1") || strings.HasPrefix(c.Request.RequestURI, "/api") || strings.HasPrefix(c.Request.RequestURI, "/assets") {
			controller.RelayNotFound(c)
			return
		}
		c.Header("Cache-Control", "no-cache")
		if common.GetTheme() == "classic" {
			c.Data(http.StatusOK, "text/html; charset=utf-8", renderIndexPage(assets.ClassicIndexPage, c.Request))
		} else {
			c.Data(http.StatusOK, "text/html; charset=utf-8", renderIndexPage(assets.DefaultIndexPage, c.Request))
		}
	})
}

func renderIndexPage(indexPage []byte, request *http.Request) []byte {
	systemName := strings.TrimSpace(common.SystemName)
	if systemName == "" {
		systemName = "Nyquiste Router"
	}

	configuredLogo := strings.TrimSpace(common.Logo)
	logo := configuredLogo
	if configuredLogo == "" {
		logo = "/logo.png"
	}

	escapedSystemName := html.EscapeString(systemName)
	escapedLogo := html.EscapeString(logo)
	absoluteLogo := html.EscapeString(absoluteURL(request, logo))
	absolutePageURL := html.EscapeString(currentURL(request))

	page := bytes.ReplaceAll(
		indexPage,
		[]byte("<title>New API</title>"),
		[]byte("<title>"+escapedSystemName+"</title>"),
	)
	page = bytes.ReplaceAll(
		page,
		[]byte("<title>Nyquiste Router</title>"),
		[]byte("<title>"+escapedSystemName+"</title>"),
	)
	page = bytes.ReplaceAll(
		page,
		[]byte(`<meta name="title" content="New API" />`),
		[]byte(`<meta name="title" content="`+escapedSystemName+`" />`),
	)
	page = bytes.ReplaceAll(
		page,
		[]byte(`<meta name="title" content="Nyquiste Router" />`),
		[]byte(`<meta name="title" content="`+escapedSystemName+`" />`),
	)
	if configuredLogo != "" {
		page = bytes.ReplaceAll(
			page,
			[]byte(`<link rel="icon" type="image/svg+xml" href="/logo.svg" />`),
			[]byte(`<link rel="icon" type="image/svg+xml" href="`+escapedLogo+`" />`),
		)
		page = bytes.ReplaceAll(
			page,
			[]byte(`<link rel="icon" href="/logo.svg" type="image/svg+xml">`),
			[]byte(`<link rel="icon" href="`+escapedLogo+`" type="image/svg+xml">`),
		)
		page = bytes.ReplaceAll(
			page,
			[]byte(`<link rel="icon" href="/logo.png" />`),
			[]byte(`<link rel="icon" href="`+escapedLogo+`" />`),
		)
		page = bytes.ReplaceAll(
			page,
			[]byte(`<link rel="apple-touch-icon" href="/logo.png" />`),
			[]byte(`<link rel="apple-touch-icon" href="`+escapedLogo+`" />`),
		)
		page = bytes.ReplaceAll(
			page,
			[]byte(`<link rel="icon" href="/favicon.ico">`),
			[]byte(`<link rel="icon" href="`+escapedLogo+`">`),
		)
	}

	meta := []byte(`
    <meta property="og:type" content="website" />
    <meta property="og:title" content="` + escapedSystemName + `" />
    <meta property="og:site_name" content="` + escapedSystemName + `" />
    <meta property="og:image" content="` + absoluteLogo + `" />
    <meta property="og:url" content="` + absolutePageURL + `" />
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:title" content="` + escapedSystemName + `" />
    <meta name="twitter:image" content="` + absoluteLogo + `" />
`)

	headEnd := []byte("</head>")
	if bytes.Contains(page, headEnd) {
		return bytes.Replace(page, headEnd, append(meta, headEnd...), 1)
	}
	return page
}

func absoluteURL(request *http.Request, rawURL string) string {
	if parsed, err := url.Parse(rawURL); err == nil && parsed.IsAbs() {
		return rawURL
	}
	if strings.HasPrefix(rawURL, "//") {
		return requestScheme(request) + ":" + rawURL
	}
	base := strings.TrimRight(requestBaseURL(request), "/")
	if strings.HasPrefix(rawURL, "/") {
		return base + rawURL
	}
	return base + "/" + rawURL
}

func currentURL(request *http.Request) string {
	if request == nil || request.URL == nil {
		return ""
	}
	return strings.TrimRight(requestBaseURL(request), "/") + request.URL.RequestURI()
}

func requestBaseURL(request *http.Request) string {
	if request == nil {
		return ""
	}
	host := firstHeaderValue(request.Header.Get("X-Forwarded-Host"))
	if host == "" {
		host = request.Host
	}
	if host == "" && request.URL != nil {
		host = request.URL.Host
	}
	return requestScheme(request) + "://" + host
}

func requestScheme(request *http.Request) string {
	if request == nil {
		return "https"
	}
	if proto := firstHeaderValue(request.Header.Get("X-Forwarded-Proto")); proto == "http" || proto == "https" {
		return proto
	}
	if request.TLS != nil {
		return "https"
	}
	if request.URL != nil && request.URL.Scheme != "" {
		return request.URL.Scheme
	}
	return "http"
}

func firstHeaderValue(value string) string {
	if value == "" {
		return ""
	}
	return strings.TrimSpace(strings.Split(value, ",")[0])
}
