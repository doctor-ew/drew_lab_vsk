import {createPageSession} from '../../src/scripts/aiSession';
import {createAiClient} from '../../src/scripts/aiClient';
const signal = () => new AbortController().signal;
const valid = (token = 'memory-session', expiresAt = 2000001800) => ({ok:true, json:async()=>({sessionToken:token,expiresAt})}) as Response;
const now = () => 2000000000000;

test('one page challenge and exchange authorize concurrent demo requests and later chat', async () => {
  const verify = jest.fn().mockResolvedValue('page-challenge');
  const exchange = jest.fn().mockResolvedValue(valid());
  const session = createPageSession(verify, exchange, undefined, now);
  const fetcher = jest.fn().mockResolvedValue({ok:true,json:async()=>({answer:'result'})});
  const request = createAiClient(signal => session.get(signal), fetcher);
  await Promise.all([request('foxtrot',{programmingLanguage:'Python'},signal()),request('translation',{question:'Hello World',language:'French'},signal())]);
  await request('chatbot',{question:'Hello',personality:'skippy'},signal());
  expect(verify).toHaveBeenCalledTimes(1); expect(exchange).toHaveBeenCalledTimes(1);
  expect(exchange.mock.calls[0][0]).toBe('https://skippyts.doctorew.com/session');
  expect(JSON.parse(exchange.mock.calls[0][1].body)).toEqual({turnstileToken:'page-challenge'});
  expect(fetcher).toHaveBeenCalledTimes(3);
  for (const call of fetcher.mock.calls) {
    expect(JSON.parse(call[1].body).sessionToken).toBe('memory-session');
    expect(JSON.parse(call[1].body).turnstileToken).toBeUndefined();
  }
  session.dispose();
});

test('refreshes a soon-expiring grant once on demand and never schedules paid retries', async () => {
  let time = now();
  const verify = jest.fn().mockResolvedValue('challenge');
  const fetcher = jest.fn().mockResolvedValueOnce(valid('first')).mockResolvedValueOnce(valid('fresh',2000003600));
  const session = createPageSession(verify,fetcher,undefined,()=>time);
  expect(await session.get(signal())).toBe('first'); time += 1771000;
  expect(await Promise.all([session.get(signal()),session.get(signal())])).toEqual(['fresh','fresh']);
  expect(fetcher).toHaveBeenCalledTimes(2); session.dispose();
});

test('failed verification never calls session exchange or paid endpoints, and waits for explicit retry', async () => {
  const verify = jest.fn().mockRejectedValue(Error('Challenge failed'));
  const fetcher = jest.fn(), phases: string[] = [];
  const session = createPageSession(verify,fetcher,phase=>phases.push(phase),now);
  await expect(session.get(signal())).rejects.toThrow('Challenge failed');
  await Promise.resolve(); expect(verify).toHaveBeenCalledTimes(1); expect(fetcher).not.toHaveBeenCalled();
  expect(phases).toEqual(['checking','error']); session.dispose();
});

test('rejects empty challenges, invalid grants and already expired sessions', async () => {
  for (const value of [{sessionToken:'',expiresAt:2000001800},{sessionToken:'token',expiresAt:2000000000},{sessionToken:'token',expiresAt:'2000001800'},null]) {
    const session = createPageSession(async()=>'challenge',jest.fn().mockResolvedValue({ok:true,json:async()=>value}),undefined,now);
    await expect(session.get(signal())).rejects.toThrow('invalid session'); session.dispose();
  }
  const exchange = jest.fn(), empty = createPageSession(async()=>'',exchange,undefined,now);
  await expect(empty.get(signal())).rejects.toThrow('not completed'); expect(exchange).not.toHaveBeenCalled(); empty.dispose();
});

test('401 invalidates the grant without repeating a model request; next action rechecks', async () => {
  const exchange = jest.fn().mockResolvedValue(valid());
  const session = createPageSession(async()=>'challenge',exchange,undefined,now);
  const fetcher = jest.fn().mockResolvedValue({ok:false,status:401,json:async()=>({error:'Verify again.'})});
  const request = createAiClient(signal=>session.get(signal),fetcher,45000,undefined,()=>session.invalidate());
  await expect(request('chatbot',{question:'Hello'},signal())).rejects.toThrow('Verify again.');
  expect(fetcher).toHaveBeenCalledTimes(1); expect(exchange).toHaveBeenCalledTimes(1);
  await expect(request('chatbot',{question:'Hello'},signal())).rejects.toThrow('Verify again.');
  expect(exchange).toHaveBeenCalledTimes(2); expect(fetcher).toHaveBeenCalledTimes(2); session.dispose();
});

test('caller cancellation leaves a shared challenge available to other callers; dispose cancels it', async () => {
  let finish!: (token:string)=>void;
  const verify = jest.fn((_signal:AbortSignal)=>new Promise<string>(resolve=>{finish=resolve;}));
  const exchange = jest.fn().mockResolvedValue(valid());
  const session = createPageSession(verify,exchange,undefined,now);
  const caller = new AbortController();
  const cancelled = session.get(caller.signal), second = session.get(signal());
  caller.abort(); await expect(cancelled).rejects.toThrow('cancelled');
  finish('challenge'); expect(await second).toBe('memory-session'); expect(verify).toHaveBeenCalledTimes(1);
  session.dispose(); expect(verify.mock.calls[0][0].aborted).toBe(true);
  await expect(session.get(signal())).rejects.toThrow('cancelled');
});

test('session exchange has a bounded timeout and no automatic retry', async () => {
  jest.useFakeTimers();
  const exchange = jest.fn((_url,options)=>new Promise<Response>((_resolve,reject)=>options.signal.addEventListener('abort',()=>reject(Error('aborted')))));
  const session = createPageSession(async()=>'challenge',exchange as typeof fetch,undefined,now);
  try {
    const result = session.get(signal());
    const rejected = expect(result).rejects.toThrow('verification timed out');
    await Promise.resolve(); jest.advanceTimersByTime(15000); await rejected;
    expect(exchange).toHaveBeenCalledTimes(1);
  } finally { session.dispose(); jest.useRealTimers(); }
});
