import { createAiClient } from '../../src/scripts/aiClient';
import { verifyTurnstile } from '../../src/scripts/turnstile';
const signal = () => new AbortController().signal;
const success = () => ({ ok: true, json: async () => ({ answer: '<script>plain text</script>' }) }) as Response;
describe('protected AI requests', () => {
  test('uses the page session and exact route; translation stays raw', async () => {
    const verify = jest.fn().mockResolvedValueOnce('first').mockResolvedValueOnce('second');
    const fetcher = jest.fn().mockResolvedValue(success());
    const request = createAiClient(verify, fetcher);
    await expect(request('translation', { question: 'Hello', language: 'French' }, signal())).resolves.toBe('<script>plain text</script>');
    await request('translation', { question: 'Again', language: 'French' }, signal());
    expect(verify).toHaveBeenCalledTimes(2);
    expect(verify.mock.calls[0][0]).toBeInstanceOf(AbortSignal);
    expect(fetcher.mock.calls[0][0]).toBe('https://skippyts.doctorew.com/translation');
    expect(JSON.parse(fetcher.mock.calls[0][1].body)).toEqual({ question: 'Hello', language: 'French', sessionToken: 'first' });
    expect(JSON.parse(fetcher.mock.calls[1][1].body).sessionToken).toBe('second');
  });
  test('missing configuration fails closed without a network call', async () => {
    const fetcher = jest.fn();
    const request = createAiClient(tokenSignal => verifyTurnstile('', 'page', tokenSignal), fetcher);
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
  await expect(verifyTurnstile('configured-public-key', 'page', signal())).resolves.toBe('verified-token');
  expect(api.render).toHaveBeenCalledWith('#turnstile-page', expect.objectContaining({ action: 'page', execution: 'execute', sitekey: 'configured-public-key', 'response-field': false }));
  expect(api.execute).toHaveBeenCalledWith('#turnstile-page');
  expect(api.remove).toHaveBeenCalledWith('widget');
  delete (globalThis as unknown as { window?: unknown }).window;
});

test('request phases distinguish pending human verification from the AI response', async () => {
  let verify!: (token: string) => void;
  let respond!: (value: Response) => void;
  const phases: string[] = [];
  const request = createAiClient(() => new Promise(resolve => { verify = resolve; }), () => new Promise(resolve => { respond = resolve; }), 45000, (action, phase) => phases.push(`${action}:${phase}`));
  const result = request('chatbot', { question: 'Hi' }, signal());
  expect(phases).toEqual(['chatbot:verifying']);
  verify('token');
  await Promise.resolve();
  expect(phases).toEqual(['chatbot:verifying', 'chatbot:requesting']);
  respond(success());
  await result;
});

test('verification rejection never reports an AI request phase', async () => {
  const phases: string[] = [], fetcher = jest.fn();
  const request = createAiClient(async () => { throw Error('Verification was not completed.'); }, fetcher, 45000, (_action, phase) => phases.push(phase));
  await expect(request('chatbot', { question: 'Hi' }, signal())).rejects.toThrow('Verification');
  expect(phases).toEqual(['verifying']);
  expect(fetcher).not.toHaveBeenCalled();
});

test('safe bounded backend messages remain visible; malformed messages use a fallback', async () => {
  for (const [error, expected] of [
    ['Please complete the verification and try again.', 'Please complete the verification and try again.'],
    ['x'.repeat(241), 'Request could not be completed.'],
    ['<script>unsafe()</script>', 'Request could not be completed.'],
    [42, 'Request could not be completed.'],
  ]) {
    const fetcher = jest.fn().mockResolvedValue({ok: false, status: 403, json: async () => ({error})});
    await expect(createAiClient(async () => 'token', fetcher)('chatbot', {question:'Hi'}, signal())).rejects.toThrow(expected as string);
  }
  const unavailable = jest.fn().mockResolvedValue({ok:false,status:429,json:async()=>{throw Error('HTML gateway response');}});
  await expect(createAiClient(async () => 'token', unavailable)('chatbot', {question:'Hi'}, signal())).rejects.toThrow('Demo limit reached.');
});
