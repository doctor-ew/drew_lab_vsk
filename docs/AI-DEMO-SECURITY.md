# AI demo security configuration

The portfolio loads without making AI requests. Sending chat, generating code and translating require explicit user actions. Changing or randomizing a selection does not request a model response.

## Frontend build

Copy `.env.example` to `.env.local`. Set `VITE_TURNSTILE_SITE_KEY` to the public site key of a Cloudflare Turnstile widget configured for the intended production hostname, then run `npm run build`. This value is public and embedded in the bundle. Never place a Turnstile secret or model API credential in a `VITE_` variable. An empty key disables AI actions while leaving the portfolio available. No test key is supplied.

The browser loads the Turnstile script directly from Cloudflare after an explicit AI action. Permit `https://challenges.cloudflare.com` in any applicable script and frame content security policy. Each action executes a fresh challenge and sends the returned token in the JSON `turnstileToken` field. Actions match the endpoint route: `chatbot`, `translation`, and `foxtrot`. Translation sends the original text in `question`, without a prompt prefix.

## Required server contract

Deploy server enforcement before publishing this frontend. Verify each token with Cloudflare Siteverify using a server-only secret; require success, the expected action and an approved hostname before invoking any paid model. Treat browser input limits, disabled controls and the public site key as usability controls, not authorization. Enforce body and text limits, allowlisted selection values, origin policy, per-client rate limits, concurrency controls and a global paid-use budget on the server. Turnstile alone is not a billing cap.

The browser limits text to 4,000 characters, prevents duplicate requests per action, gives verification 90 seconds and aborts model requests after 45 seconds. It never retries paid requests automatically. A browser abort does not guarantee cancellation of backend processing; server timeouts and cost controls remain necessary.

## Validation

Run `npm run check`, `npm run build`, and `npm test -- --runInBand`. Mocked tests never call the deployed AI endpoints. Verify the real widget with an approved hostname after configuring server-side verification; production keys and live model requests are not part of automated tests.
