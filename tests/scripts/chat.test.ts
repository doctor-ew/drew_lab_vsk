import { createAiClient } from '../../src/scripts/aiClient';
import { verifyTurnstile } from '../../src/scripts/turnstile';
const signal = () => new AbortController().signal;
const success = () => ({ ok: true, json: async () => ({ answer: '<script>plain text</script>' }) }) as Response;
describe('protected AI requests', () => {
  test('uses a fresh verification token and exact route; translation stays raw', async () => {
    const verify = jest.fn().mockResolvedValueOnce('first').mockResolvedValueOnce('second');
    const fetcher = jest.fn().mockResolvedValue(success());
    const request = createAiClient(verify, fetcher);
    await expect(request('translation', { question: 'Hello', language: 'French' }, signal())).resolves.toBe('<script>plain text</script>');
    await request('translation', { question: 'Again', language: 'French' }, signal());
    expect(verify.mock.calls.map(call => call[0])).toEqual(['translation', 'translation']);
    expect(fetcher.mock.calls[0][0]).toBe('https://skippyts.doctorew.com/translation');
    expect(JSON.parse(fetcher.mock.calls[0][1].body)).toEqual({ question: 'Hello', language: 'French', turnstileToken: 'first' });
    expect(JSON.parse(fetcher.mock.calls[1][1].body).turnstileToken).toBe('second');
  });
  test('missing configuration fails closed without a network call', async () => {
    const fetcher = jest.fn();
    const request = createAiClient((action, tokenSignal) => verifyTurnstile('', action, tokenSignal), fetcher);
    await expect(request('chatbot', { question: 'Hi' }, signal())).rejects.toThrow('temporarily unavailable');
    expect(fetcher).not.toHaveBeenCalled();
  });
  test('oversized text is rejected before verification', async () => {
    const verify = jest.fn();
    await expect(createAiClient(verify)('chatbot', { question: 'x'.repeat(4001) }, signal())).rejects.toThrow('4,000');
    expect(verify).not.toHaveBeenCalled();
  });
  test('locks repeated submissions while verification is pending', async () => {
    let release!: (token: string) => void;
    const verify = () => new Promise<string>(resolve => { release = resolve; });
    const fetcher = jest.fn().mockResolvedValue(success());
    const request = createAiClient(verify, fetcher);
    const first = request('foxtrot', { programmingLanguage: 'TypeScript' }, signal());
    await expect(request('foxtrot', { programmingLanguage: 'TypeScript' }, signal())).rejects.toThrow('already');
    release('token'); await first;
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
  test('verification failure never calls the API', async () => {
    const fetcher = jest.fn();
    await expect(createAiClient(async () => { throw new Error('challenge failed'); }, fetcher)('chatbot', { question: 'Hi' }, signal())).rejects.toThrow('challenge failed');
    expect(fetcher).not.toHaveBeenCalled();
  });
  test('aborts slow requests and releases the pending lock', async () => {
    const fetcher = jest.fn((_url, options) => new Promise<Response>((_resolve, reject) => options.signal.addEventListener('abort', () => reject(new Error('aborted')))));
    const request = createAiClient(async () => 'token', fetcher as typeof fetch, 5);
    await expect(request('chatbot', { question: 'Hi' }, signal())).rejects.toThrow('timed out');
    await expect(request('chatbot', { question: 'Hi' }, signal())).rejects.toThrow('timed out');
    expect(fetcher).toHaveBeenCalledTimes(2);
  });
});

test('Turnstile uses explicit execution, route action and cleans up its widget', async () => {
  let callback!: (token: string) => void;
  const api = {
    render: jest.fn((_container, options) => { callback = options.callback; return 'widget'; }),
    execute: jest.fn(() => callback('verified-token')),
    remove: jest.fn(),
  };
  (globalThis as unknown as { window: unknown }).window = { turnstile: api };
  await expect(verifyTurnstile('configured-public-key', 'foxtrot', signal())).resolves.toBe('verified-token');
  expect(api.render).toHaveBeenCalledWith('#turnstile-foxtrot', expect.objectContaining({ action: 'foxtrot', execution: 'execute', sitekey: 'configured-public-key', 'response-field': false }));
  expect(api.execute).toHaveBeenCalledWith('#turnstile-foxtrot');
  expect(api.remove).toHaveBeenCalledWith('widget');
  delete (globalThis as unknown as { window?: unknown }).window;
});
