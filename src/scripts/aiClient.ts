export type AiAction = 'chatbot' | 'translation' | 'foxtrot';
type Verify = (action: AiAction, signal: AbortSignal) => Promise<string>;
const routes: Record<AiAction, string> = {
  chatbot: 'https://skippyts.doctorew.com/chatbot',
  translation: 'https://skippyts.doctorew.com/translation',
  foxtrot: 'https://skippyts.doctorew.com/foxtrot',
};
export function createAiClient(verify: Verify, fetcher: typeof fetch = fetch, timeoutMs = 45000) {
  const pending = new Set<AiAction>();
  return async (action: AiAction, payload: Record<string, string>, signal: AbortSignal): Promise<string> => {
    if (pending.has(action)) throw new Error('This request is already in progress.');
    if (!routes[action] || Object.values(payload).some(value => typeof value !== 'string' || !value.trim() || value.length > 4000)) {
      throw new Error('Enter between 1 and 4,000 characters.');
    }
    pending.add(action);
    const controller = new AbortController();
    const abort = () => controller.abort();
    signal.addEventListener('abort', abort, { once: true });
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      if (signal.aborted) throw new Error('Request cancelled.');
      const turnstileToken = await verify(action, controller.signal);
      if (!turnstileToken || controller.signal.aborted) throw new Error('Human verification was not completed.');
      timer = setTimeout(abort, timeoutMs);
      const response = await fetcher(routes[action], {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, turnstileToken }), signal: controller.signal,
      });
      if (!response.ok) throw new Error(response.status === 429 ? 'Demo limit reached. Please try again later.' : 'Request could not be completed. Please try again.');
      const data = await response.json();
      if (typeof data.answer !== 'string') throw new Error('The service returned an invalid response.');
      return data.answer;
    } catch (error) {
      if (controller.signal.aborted) throw new Error(signal.aborted ? 'Request cancelled.' : 'Request timed out. Please try again.');
      throw error;
    } finally {
      clearTimeout(timer);
      signal.removeEventListener('abort', abort);
      pending.delete(action);
    }
  };
}
