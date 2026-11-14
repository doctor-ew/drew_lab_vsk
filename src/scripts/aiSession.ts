export type SessionPhase = 'checking' | 'ready' | 'error' | 'expired';
type VerifyPage = (signal: AbortSignal) => Promise<string>;
const endpoint = 'https://skippyts.doctorew.com/session';

// Grants live only in this closure, never in browser storage or URLs.
export function createPageSession(verify: VerifyPage, fetcher: typeof fetch = fetch,
  onPhase: (phase: SessionPhase, message?: string) => void = () => {}, now = () => Date.now()) {
  let grant: {sessionToken: string; expiresAt: number} | undefined;
  let pending: Promise<string> | undefined;
  let disposed = false;
  const lifetime = new AbortController();
  const cancelled = () => new Error('Request cancelled.');
  function invalidate() { grant = undefined; if (!disposed) onPhase('expired'); }
  async function bootstrap(): Promise<string> {
    onPhase('checking');
    try {
      const turnstileToken = await verify(lifetime.signal);
      if (lifetime.signal.aborted) throw cancelled();
      if (!turnstileToken) throw new Error('Browser verification was not completed.');
      const controller = new AbortController();
      const abort = () => controller.abort();
      lifetime.signal.addEventListener('abort', abort, {once:true});
      const timer = setTimeout(abort, 15000);
      try {
        const response = await fetcher(endpoint, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({turnstileToken}), signal:controller.signal});
        if (!response.ok) throw new Error('Browser verification could not finish. Please try again.');
        const result = await response.json();
        if (typeof result?.sessionToken !== 'string' || !result.sessionToken || result.sessionToken.length > 4096 ||
          !Number.isFinite(result.expiresAt) || result.expiresAt * 1000 <= now() + 30000) {
          throw new Error('Browser verification returned an invalid session. Please try again.');
        }
        if (lifetime.signal.aborted) throw cancelled();
        grant = {sessionToken:result.sessionToken, expiresAt:result.expiresAt};
        onPhase('ready'); return grant.sessionToken;
      } catch (error) {
        if (controller.signal.aborted && !lifetime.signal.aborted) throw new Error('Browser verification timed out. Please try again.');
        throw error;
      } finally { clearTimeout(timer); lifetime.signal.removeEventListener('abort', abort); }
    } catch (error) {
      grant = undefined;
      if (!disposed) onPhase('error', error instanceof Error ? error.message : 'Browser verification failed. Please try again.');
      throw error;
    }
  }
  return {
    get(signal: AbortSignal): Promise<string> {
      if (disposed || signal.aborted) return Promise.reject(cancelled());
      // Refresh shortly before expiry, only when an action needs the grant.
      if (grant && grant.expiresAt * 1000 > now() + 30000) return Promise.resolve(grant.sessionToken);
      grant = undefined;
      if (!pending) pending = bootstrap().finally(() => { pending = undefined; });
      const shared = pending;
      return new Promise((resolve, reject) => {
        const abort = () => { signal.removeEventListener('abort', abort); reject(cancelled()); };
        signal.addEventListener('abort', abort, {once:true});
        shared.then(resolve, reject).finally(() => signal.removeEventListener('abort', abort));
      });
    }, invalidate,
    dispose() { disposed = true; grant = undefined; lifetime.abort(); },
  };
}
