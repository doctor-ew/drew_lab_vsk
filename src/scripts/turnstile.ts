import type { AiAction } from './aiClient';
interface TurnstileApi {
  render(container: string, options: Record<string, unknown>): string;
  execute(container: string): void;
  remove(widget: string): void;
}
declare global { interface Window { turnstile?: TurnstileApi } }
let loading: Promise<TurnstileApi> | undefined;
function loadApi(): Promise<TurnstileApi> {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (loading) return loading;
  loading = new Promise<TurnstileApi>((resolve, reject) => {
    const script = document.createElement('script');
    const timer = setTimeout(() => fail(), 15000);
    const fail = () => { clearTimeout(timer); script.remove(); loading = undefined; reject(new Error('Human verification could not load. Please try again.')); };
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    script.onerror = fail;
    script.onload = () => { clearTimeout(timer); if (window.turnstile) resolve(window.turnstile); else fail(); };
    document.head.appendChild(script);
  });
  return loading;
}
export async function verifyTurnstile(sitekey: string, action: AiAction, signal: AbortSignal): Promise<string> {
  if (!sitekey.trim()) throw new Error('AI demos are temporarily unavailable while human verification is configured.');
  if (signal.aborted) throw new Error('Request cancelled.');
  const api = await loadApi();
  if (signal.aborted) throw new Error('Request cancelled.');
  return new Promise<string>((resolve, reject) => {
    let widget: string | undefined;
    let settled = false;
    const cleanup = () => { clearTimeout(timer); signal.removeEventListener('abort', abort); if (widget !== undefined) api.remove(widget); };
    const finish = (token?: string) => {
      if (settled) return;
      settled = true;
      cleanup();
      if (token) resolve(token); else reject(new Error('Human verification was not completed. Please try again.'));
    };
    const abort = () => finish();
    const timer = setTimeout(abort, 90000);
    signal.addEventListener('abort', abort, { once: true });
    try {
      const container = `#turnstile-${action}`;
      widget = api.render(container, {
        sitekey, action, execution: 'execute', appearance: 'interaction-only', 'response-field': false,
        callback: (token: string) => finish(token), 'error-callback': () => finish(),
        'expired-callback': () => finish(), 'timeout-callback': () => finish(),
      });
      if (!settled) api.execute(container);
      else api.remove(widget);
    } catch { finish(); }
  });
}
