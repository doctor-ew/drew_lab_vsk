<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import { initApp } from '../scripts/appScript';
    import { randomizePersonality, updateSkippyChatBackground } from '../scripts/chat';
    import { programmingLanguages } from '../scripts/programmingLanguages';
    import { translationLanguages } from '../scripts/translationLanguages';
    import { personalities } from '../scripts/personalities';
    import { createAiClient, type AiAction } from '../scripts/aiClient';
    import { createPageSession, type SessionPhase } from '../scripts/aiSession';
    import { verifyTurnstile } from '../scripts/turnstile';

    const siteKey = (import.meta.env.VITE_TURNSTILE_SITE_KEY || '').trim();
    const lifetime = new AbortController();
    let sessionPhase: SessionPhase = 'checking';
    let sessionError = '';
    let demoBootstrapped = false;
    let foxtrotCode = '';
    let programmingLanguage = 'Python';
    let translationLanguage = 'Spanish';
    let translationText = 'Hello World';
    let translatedText = '';
    let chatText = '';
    let selectedPersonality = randomizePersonality(personalities);
    let personalityName = selectedPersonality.name;
    let conversation: { type: 'user' | 'assistant'; name: string; text: string }[] = [];
    let pending: Record<AiAction, boolean> = { chatbot: false, translation: false, foxtrot: false };
    let errors: Record<AiAction, string> = { chatbot: '', translation: '', foxtrot: '' };
    const refreshTimers = new Map<AiAction, ReturnType<typeof setTimeout>>();
    const session = createPageSession(signal => verifyTurnstile(siteKey, 'page', signal), fetch, (phase, message) => {
        sessionPhase = phase; sessionError = message || '';
    });
    const request = createAiClient(signal => session.get(signal), fetch, 45000, undefined, () => session.invalidate());

    onMount(() => { initApp(); updateSkippyChatBackground(selectedPersonality); void prepareDemos(); });
    onDestroy(() => { lifetime.abort(); session.dispose(); for (const timer of refreshTimers.values()) clearTimeout(timer); });

    async function prepareDemos() {
        try {
            await session.get(lifetime.signal);
            if (!demoBootstrapped && !lifetime.signal.aborted) {
                demoBootstrapped = true;
                refreshFoxtrotCode(); handleTranslate();
            }
        } catch { /* The shared verification status supplies the retry action. */ }
    }
    async function run(action: AiAction, payload: Record<string, string>, done: (answer: string) => void) {
        if (pending[action] || lifetime.signal.aborted) return;
        const queued = refreshTimers.get(action); if (queued) clearTimeout(queued); refreshTimers.delete(action);
        pending = { ...pending, [action]: true }; errors = { ...errors, [action]: '' };
        try {
            const answer = await request(action, payload, lifetime.signal);
            if (!lifetime.signal.aborted) done(answer);
        } catch (error) {
            if (!lifetime.signal.aborted) errors = { ...errors, [action]: error instanceof Error ? error.message : 'Request failed. Please try again.' };
        } finally { pending = { ...pending, [action]: false }; }
    }
    function schedule(action: 'foxtrot' | 'translation') {
        const timer = refreshTimers.get(action); if (timer) clearTimeout(timer);
        if (sessionPhase !== 'ready') return;
        refreshTimers.set(action, setTimeout(() => { refreshTimers.delete(action); action === 'foxtrot' ? refreshFoxtrotCode() : handleTranslate(); }, 250));
    }
    function handlePersonalityChange() {
        selectedPersonality = personalities.find(p => p.name === personalityName) || personalities[0];
        updateSkippyChatBackground(selectedPersonality);
    }
    function handleRelayMessage() {
        const question = chatText.trim(); if (!question || pending.chatbot) return;
        const name = selectedPersonality.display_name;
        void run('chatbot', { question, personality: selectedPersonality.name }, answer => {
            conversation = [...conversation, { type: 'user', name: 'You', text: question }, { type: 'assistant', name, text: answer }];
            if (chatText.trim() === question) chatText = '';
        });
    }
    function refreshFoxtrotCode() {
        void run('foxtrot', { programmingLanguage }, answer => { foxtrotCode = answer.replace(/```[a-z]*\n|```/g, '').trim(); });
    }
    function handleRandomButtonClick() { programmingLanguage = programmingLanguages[Math.floor(Math.random() * programmingLanguages.length)]; schedule('foxtrot'); }
    function randomizeTranslation() { translationLanguage = translationLanguages[Math.floor(Math.random() * translationLanguages.length)].code; schedule('translation'); }
    function handleTranslate() {
        if (!translationText.trim()) return;
        void run('translation', { question: translationText, language: translationLanguage }, answer => { translatedText = answer; });
    }
</script>

<canvas id="c" class="fixed top-0 left-0 flex-grow min-h-0 min-w-0 h-screen w-screen" width="1416" height="1091"></canvas>

<main id="main" class="main relative flex-grow container mx-auto justify-center max-w-screen-lg space-y-10 bg-white bg-opacity-50 w-full">
    <section id="top" class="items-center w-full m-0">
        <h1 id="welcome" class="mx-auto flex-grow p-10 m-0 bg-no-repeat bg-white pl-40 font-bold text-5xl">
            Welcome to DoctorEw's Lab
        </h1>
        <div id="doctorew_contact">
            <h2 id="doctorew" class="mx-auto flex-grow p-10 m-0 bg-no-repeat bg-white bg-opacity-80 pl-40 font-bold text-xl">
                <span class="block text-3xl mt-2 mb-4 underline font-black">Andrew Schillinger<sup>(He/Him)</sup></span>
                <ul>
                    <li class="inline">Sr. Technology Executive</li>
                    <li class="inline"> ● AI Leader</li>
                    <li class="inline"> ● CTO / Solutions Architect</li>
                    <li class="inline"> ● Emerging Technology & Innovation</li>
                    <li class="inline"> ● Business Growth Strategy</li>
                    <li class="inline"> ● 15+ years’ experience delivering data-driven digital disruption that transforms the way people connect</li>
                </ul>
            </h2>
            <h3 id="contact-area" class="mx-auto flex-grow p-10 m-0 bg-no-repeat bg-white bg-opacity-80 pl-40 pt-0 font-bold text-xl">
                <a href="https://www.linkedin.com/in/andrew-schillinger/" target="_blank" rel="noopener noreferrer" class="animate-pulse">LinkedIn</a> \\ 
                <a href="https://github.com/doctor-ew/" target="_blank" rel="noopener noreferrer" class="animate-pulse hover:animate-bounce">github</a> \\ 
                <a href="https://www.doctorew.com/Andrew_Schillinger_resume_engineering.pdf" target="_blank" rel="noopener noreferrer" class="animate-pulse hover:animate-bounce">resume</a> \\ 
                <a href="https://www.doctorew.medium.com/" target="_blank" rel="noopener noreferrer" class="animate-pulse hover:animate-bounce">blog</a> \\ 
                <a href="mailto:drew@doctorew.com" rel="noopener noreferrer" class="animate-pulse hover:animate-bounce">drew[at]doctorew[dot]com</a> \\ <a href="https://doctorew.com/tv/" class="animate-pulse hover:animate-bounce">YATA · Retro TV ↗</a>
            </h3>
        </div>
    <div id="page-verification" aria-busy={sessionPhase === 'checking'}>
        <div id="turnstile-page"></div>
        {#if sessionPhase === 'error' || sessionPhase === 'expired'}<p role="alert">{sessionError || 'Verification expired.'} <button type="button" on:click={prepareDemos}>Verify again</button></p>{/if}
    </div>
    </section>

    <section id="chat" class="items-center w-full m-0">
        <h1 id="skippistan" class="h1-skippy-chat mx-auto flex-auto p-10 m-0 bg-no-repeat bg-white pl-40 font-bold text-3xl">
            Chat with {selectedPersonality.display_name}! <br><sub class="text-sm">using TypeScript, Lambda, Serverless, Sveltekit, LangChain, and OpenAI \\ <a href="https://github.com/doctor-ew/drew_lab_vsk" target="_blank" rel="noopener noreferrer" class="animate-pulse hover:animate-bounce">repo</a>{#if selectedPersonality.portrait} \ <a href={selectedPersonality.portrait.credit} target="_blank" rel="noopener noreferrer" title={selectedPersonality.portrait.caption}>portrait credit</a>{/if}</sub>
        </h1>
        <div class="form_holder block mb-6">
            <form class="mx-auto p-6" on:submit|preventDefault={handleRelayMessage}>
                <label for="chat_box" class="active"></label>
                <textarea id="chat_box" bind:value={chatText} maxlength="4000" class="textarea w-full text-gray-200" name="chat_box" placeholder="Chat with {selectedPersonality.display_name}!" required></textarea>
                <select id="personality_selector" bind:value={personalityName} on:change={handlePersonalityChange}>
                    {#each personalities as personality}
                    <option value={personality.name} data-icon={personality.icon}>{personality.display_name}</option>
                    {/each}
                </select>
                <button type="submit" name="submit" class="submit" id="chat_submit" disabled={pending.chatbot || !siteKey || sessionPhase === 'checking'}>{pending.chatbot ? 'Sending…' : 'Submit'}</button>
            </form>
        </div>
        <div id="chat_log" class="chat_log grid grid-cols-2 gap-4 flex">
            {#each conversation as chat}
            <div class="{chat.type}">
                <p><strong><u>{chat.name}</u></strong>: {chat.text}</p>
            </div>
            {/each}
        </div>
    {#if errors.chatbot}<p role="alert">{errors.chatbot}</p>{/if}
    </section>
    <section id="foxtrot-codex" class="items-center w-full m-0">
        <div class="cb_top_holder bg-white block">
            <h1 id="skippistan" class="h1-skippy-codex mx-auto flex-auto p-10 m-0 bg-no-repeat bg-white pl-40 font-bold text-3xl">
                Write `I will not use ChatGPT to code` 500 times in {programmingLanguage}!
            </h1>
            <div class="form_holder block">
                <label for="language_selector">Select Language:</label>
                <select id="language_selector" bind:value={programmingLanguage} on:change={() => schedule('foxtrot')}>
                    {#each programmingLanguages as language}
                    <option value={language}>{language}</option>
                    {/each}
                </select>
                <button on:click={handleRandomButtonClick}>Random</button>
            </div>
        </div>
        <div class="chalkboard grid grid-cols-1 gap-4 flex">
            {#if pending.foxtrot}
                <div class="loader"></div>
            {/if}
            <pre class="code-output" class:is-hidden={pending.foxtrot}>{foxtrotCode}</pre>
        </div>
    {#if errors.foxtrot}<p role="alert">{errors.foxtrot}</p>{/if}
    </section>
    <section id="translation-services" class="items-center w-full m-0">
        <h1 id="skippy-translate" class="h1-skippy-translate mx-auto flex-auto p-10 m-0 bg-no-repeat bg-white pl-40 font-bold text-3xl">
            Skippy's Translation Services
        </h1>
        <div class="translation_holder grid grid-cols-1 gap-4 flex">
            <div class="form_holder block mb-6">
                <form class="mx-auto p-6" on:submit|preventDefault={handleTranslate}>
                    <label for="translation_box" class="active"></label>
                    <textarea id="translation_box" maxlength="4000" class="textarea w-full text-gray-200" bind:value={translationText} name="translation_box" placeholder="Enter text to translate..." required></textarea>
                    <div class="flex items-center mt-4">
                        <select id="translation_language_selector" bind:value={translationLanguage} on:change={() => schedule('translation')}>
                            {#each translationLanguages as language}
                            <option value={language.code}>{language.name}</option>
                            {/each}
                        </select>
                        <button type="submit" name="submit" class="submit ml-4" id="translate_submit" disabled={pending.translation || !siteKey || sessionPhase === 'checking'}>{pending.translation ? 'Translating…' : 'Translate'}</button>
                        <button type="button" name="random" class="submit ml-4" on:click={randomizeTranslation}>Random</button>
                    </div>
                </form>
            </div>
            {#if translatedText}
                <pre id="translated_text" class="translated_text w-full p-6 bg-white bg-opacity-80 whitespace-pre-wrap">
                    {translatedText}
                </pre>
            {/if}
        </div>
    {#if errors.translation}<p role="alert">{errors.translation}</p>{/if}
    </section>
</main>

<style>
    .logo {
        height: 6em;
        padding: 1.5em;
        will-change: filter;
        transition: filter 300ms;
    }

    .logo:hover {
        filter: drop-shadow(0 0 2em #646cffaa);
    }

    .logo.svelte:hover {
        filter: drop-shadow(0 0 2em #ff3e00aa);
    }

    .read-the-docs {
        color: #888;
    }

    #foxtrot-codex {
        background: url('../../public/foxtrot-codex-chalkboard.png') no-repeat bottom;
        background-size: contain;
        position: relative;
        padding-bottom: 0;
        min-height: 550px;
    }

    .code-output {
        position: absolute;
        left: 0;
        width: 60%;
        padding: 2rem;
        background-color: rgba(0, 128, 0, 0.8);
        color: white;
        font-family: 'Source Code Pro', monospace;
        overflow: auto;
        text-align: left;
        height: 275px;
        white-space: break-spaces;
        font-size: 1rem;
        bottom: 50px;
    }

    .loader {
        width: 80px;
        height: 70px;
        border: 5px solid #000;
        padding: 0 8px;
        box-sizing: border-box;
        background:
            linear-gradient(#fff 0 0) 0 0 / 8px 20px,
            linear-gradient(#fff 0 0) 100% 0 / 8px 20px,
            radial-gradient(farthest-side, #fff 90%, #0000) 0 5px / 8px 8px content-box,
            #000;
        background-repeat: no-repeat;
        animation: l3 2s infinite linear;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 10;
    }

    @keyframes l3 {
        25% { background-position: 0 0, 100% 100%, 100% calc(100% - 5px); }
        50% { background-position: 0 100%, 100% 100%, 0 calc(100% - 5px); }
        75% { background-position: 0 100%, 100% 0, 100% 5px; }
    }

    .is-hidden {
        display: none;
    }

    #language_selector, #translation_language_selector, #personality_selector {
        background-color: #FFBE53;
    }

    #translated_text {
        background-color: rgba(255, 255, 255, 0.8);
    }

    .chat_icon {
        width: 50px;
        height: 50px;
    }

    /* Breakpoint 320px */
    @media (max-width: 320px) {
        .code-output {
            width: 60%;
            left: 0;
            font-size: 0.8rem;
        }
        #welcome {
            font-size: 1.5rem;
            padding-left: 10px;
        }
        #doctorew_contact, #skippistan {
            padding-left: 10px;
        }
        .cb_top_holder {
            padding: 0 10px;
        }
    }

    /* Breakpoint 480px */
    @media (min-width: 321px) and (max-width: 480px) {
        .code-output {
            width: 60%;
            left: 0;
            font-size: 0.9rem;
        }
        #welcome {
            font-size: 2rem;
            padding-left: 15px;
        }
        #doctorew_contact, #skippistan {
            padding-left: 15px;
        }
        .cb_top_holder {
            padding: 0 15px;
        }
    }

    /* Breakpoint 768px */
    @media (min-width: 481px) and (max-width: 768px) {
        .code-output {
            width: 60%;
            left: 0;
            font-size: 1rem;
        }
        #welcome {
            font-size: 3rem;
            padding-left: 20px;
        }
        #doctorew_contact, #skippistan {
            padding-left: 20px;
        }
        .cb_top_holder {
            padding: 0 20px;
        }
    }

    /* Breakpoint 1024px */
    @media (min-width: 769px) and (max-width: 1024px) {
        .code-output {
            width: 60%;
            left: 0;
            font-size: 1.1rem;
        }
        #welcome {
            font-size: 3.5rem;
            padding-left: 30px;
        }
        #doctorew_contact, #skippistan {
            padding-left: 30px;
        }
        .cb_top_holder {
            padding: 0 30px;
        }
    }

    /* Breakpoint 1280px */
    @media (min-width: 1025px) and (max-width: 1280px) {
        .code-output {
            width: 60%;
            left: 0;
            font-size: 1.2rem;
        }
        #welcome {
            font-size: 4rem;
            padding-left: 40px;
        }
        #doctorew_contact, #skippistan {
            padding-left: 40px;
        }
        .cb_top_holder {
            padding: 0 40px;
        }
    }
</style>
