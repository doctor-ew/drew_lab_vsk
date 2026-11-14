# AI demo verification and request flow

## Page verification

The browser runs one Cloudflare Turnstile check when the page mounts, using action `page`. The compact verification bar stays visible while scrolling. The managed widget requests interaction when necessary; verification errors provide an explicit retry button.

The browser exchanges the challenge at `POST https://skippyts.doctorew.com/session` with JSON `{ "turnstileToken": "..." }`. The response contains `sessionToken` and `expiresAt` (Unix seconds). The session remains in memory and is never written to browser storage or a URL. Concurrent requests share one pending verification and exchange. A new action refreshes the session when fewer than 30 seconds remain before expiry. Reloading the page starts a new check.

After verification, the page automatically requests one code example and one translation. Changing or randomizing either language refreshes that demo after a 250 ms debounce. Chat requires a typed message and an explicit submission; changing a personality sends no message. Requests are not retried automatically after a model or quota failure.

## AI request contract

Existing `chatbot`, `translation`, and `foxtrot` routes receive their existing payload fields plus `sessionToken`. Translation sends the original text in `question`, without a prompt prefix. A `401` response invalidates the cached session; the next explicit action can verify again. The failed request is not repeated automatically.

Server enforcement must be deployed before this frontend. The backend verifies the page challenge, validates the grant on every AI request, binds it to the browser origin and source IP, and applies its atomic usage limits to every inference request. Browser verification is not a spending cap. Browser controls supplement server validation and quotas.

The browser limits text to 4,000 characters, prevents concurrent requests for the same demo, gives Turnstile 90 seconds, bounds the session exchange to 15 seconds, and aborts AI requests after 45 seconds. Aborting in the browser does not guarantee cancellation of backend processing.

## Public configuration

Set `VITE_TURNSTILE_SITE_KEY` to the public site key for the production widget. The value is public and embedded in the browser bundle. Never put a widget secret or model API credential in a `VITE_` variable. Without a site key, the portfolio remains available and AI requests are disabled.

Allow `https://challenges.cloudflare.com` in applicable script and frame content security policies. The page renders model responses and bounded server error messages as text, with no HTML interpretation.

## Validation

Run `npm run check` and `npm test -- --runInBand`. Session tests cover shared verification, expiry refresh, cancellation, malformed grants, and invalid-session rejection without paid retries. Mocked browser checks cover initial demo loading, selection changes, manual chat, mobile overflow, and vertically stacked conversation bubbles. Automated checks use mocked verification and AI services; they do not call deployed model endpoints.
