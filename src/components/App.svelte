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

<canvas id="c" aria-hidden="true" width="1416" height="1091"></canvas>
<main id="main" class="lab-app">
    <header id="top" class="lab-hero">
        <p class="eyebrow">DOCTOREW'S LAB</p>
        <h1 id="welcome">Welcome to<br>DoctorEw’s Lab.</h1>
        <div id="doctorew_contact" class="intro-copy">
            <h2>Andrew Schillinger <small>(He/Him)</small></h2>
            <p>Technology executive · AI leader · CTO / Solutions architect</p>
            <p>15+ years building technology that transforms the way people connect.</p>
        </div>
        <nav id="contact-area" aria-label="Contact and work">
            <a href="https://www.linkedin.com/in/andrew-schillinger/" target="_blank" rel="noopener noreferrer">LinkedIn ↗</a>
            <a href="https://github.com/doctor-ew/" target="_blank" rel="noopener noreferrer">GitHub ↗</a>
            <a href="https://www.doctorew.com/Andrew_Schillinger_resume_engineering.pdf" target="_blank" rel="noopener noreferrer">Resume ↗</a>
            <a href="https://www.doctorew.medium.com/" target="_blank" rel="noopener noreferrer">Blog ↗</a>
            <a href="https://doctorew.com/tv/">YATA · Retro TV ↗</a>
            <span>drew[at]doctorew[dot]com</span>
        </nav>
    </header>

    <div class="page-verification" aria-busy={sessionPhase === 'checking'}>
        <div class="verification-line">
            <span class:verified={sessionPhase === 'ready'} class="verification-dot" aria-hidden="true"></span>
            <p role="status" aria-live="polite">{!siteKey ? 'AI demos are temporarily unavailable.' : sessionPhase === 'ready' ? 'AI demos ready' : sessionPhase === 'checking' ? 'Checking your browser…' : sessionPhase === 'expired' ? 'Verification expired. Verify again to continue.' : sessionError || 'Browser verification could not finish.'}</p>
            {#if siteKey && (sessionPhase === 'error' || sessionPhase === 'expired')}<button type="button" class="text-button" on:click={prepareDemos}>Verify again</button>{/if}
        </div>
        <div id="turnstile-page" class="verification-widget"></div>
    </div>

    <section id="chat" class="demo-card">
        <div class="section-header h1-skippy-chat">
            <p class="eyebrow">THE PERSONALITY EXPERIMENT</p>
            <h2>Chat with {selectedPersonality.display_name}</h2>
            <p>A familiar character. An unexpected conversation.</p>
        </div>
        <form on:submit|preventDefault={handleRelayMessage}>
            <label for="personality_selector">Your conversation partner</label>
            <select id="personality_selector" bind:value={personalityName} disabled={pending.chatbot} on:change={handlePersonalityChange}>
                {#each personalities as personality}<option value={personality.name}>{personality.display_name}</option>{/each}
            </select>
            {#if conversation.length}
            <div id="chat_log" class="chat-log" aria-label="Conversation">
                {#each conversation as chat}<article class="chat-message" class:from-user={chat.type === 'user'}><strong>{chat.name}</strong><p>{chat.text}</p></article>{/each}
            </div>
            {/if}
            <label for="chat_box">Your message</label>
            <textarea id="chat_box" bind:value={chatText} maxlength="4000" disabled={pending.chatbot || !siteKey} placeholder="What's on your mind?" rows="3" required></textarea>
            <div class="action-row"><span class="request-status" role="status">{pending.chatbot ? 'Thinking…' : ''}</span><button type="submit" id="chat_submit" disabled={pending.chatbot || !siteKey || sessionPhase === 'checking'}>{pending.chatbot ? 'Sending…' : 'Send message'}</button></div>
            {#if errors.chatbot}<p role="alert" class="ai-error">{errors.chatbot}</p>{/if}
        </form>
    </section>

    <section id="foxtrot-codex" class="demo-card">
        <div class="section-header h1-skippy-codex"><p class="eyebrow">FOXTROT CODEX</p><h2>Write it 500 times.</h2><p>“I will not use ChatGPT to code.” Pick your language.</p></div>
        <div class="demo-body">
            <div class="control-row"><div class="select-control"><label for="language_selector">Programming language</label><select id="language_selector" bind:value={programmingLanguage} disabled={pending.foxtrot} on:change={() => schedule('foxtrot')}>
                {#each programmingLanguages as language}<option value={language}>{language}</option>{/each}
            </select></div><button type="button" class="secondary" disabled={pending.foxtrot} on:click={handleRandomButtonClick}>Surprise me</button><button type="button" disabled={pending.foxtrot || !siteKey || sessionPhase === 'checking'} on:click={refreshFoxtrotCode}>{pending.foxtrot ? 'Writing…' : 'Generate code'}</button></div>
            <p class="request-status" role="status">{pending.foxtrot ? 'Writing a little code…' : ''}</p>
            {#if errors.foxtrot}<p role="alert" class="ai-error">{errors.foxtrot}</p>{/if}
            <pre class="code-output"><code>{foxtrotCode || 'Your code will appear here.'}</code></pre>
        </div>
    </section>

    <section id="translation-services" class="demo-card">
        <div class="section-header h1-skippy-translate"><p class="eyebrow">A LITTLE SKIPPY ATTITUDE</p><h2>Skippy’s Translation Services</h2></div>
        <form on:submit|preventDefault={handleTranslate}>
            <label for="translation_box">Text to translate</label><textarea id="translation_box" bind:value={translationText} maxlength="4000" disabled={pending.translation || !siteKey} rows="3" required></textarea>
            <div class="control-row"><div class="select-control"><label for="translation_language_selector">Translate into</label><select id="translation_language_selector" bind:value={translationLanguage} disabled={pending.translation} on:change={() => schedule('translation')}>
                {#each translationLanguages as language}<option value={language.code}>{language.name}</option>{/each}
            </select></div><button type="button" class="secondary" disabled={pending.translation} on:click={randomizeTranslation}>Surprise me</button><button type="submit" id="translate_submit" disabled={pending.translation || !siteKey || sessionPhase === 'checking'}>{pending.translation ? 'Translating…' : 'Translate'}</button></div>
            <p class="request-status" role="status">{pending.translation ? 'Finding the right words…' : ''}</p>
            {#if errors.translation}<p role="alert" class="ai-error">{errors.translation}</p>{/if}
            {#if translatedText}<div id="translated_text" class="translation-output"><p>{translatedText}</p></div>{/if}
        </form>
    </section>
    <footer>Built with curiosity, TypeScript, Svelte, LangChain & OpenAI. <a href="https://github.com/doctor-ew/drew_lab_vsk" target="_blank" rel="noopener noreferrer">Explore the code ↗</a></footer>
</main>
