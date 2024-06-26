<script lang="ts">
    import svelteLogo from '../../public/svelte.svg';
    import viteLogo from '/vite.svg';
    import Counter from '../lib/Counter.svelte';
    import anime from 'animejs';
    import { onMount } from 'svelte';
    import { initApp } from '../scripts/appScript.ts';
    import { relay_message } from '../scripts/chat.ts';
    import { fetchFoxtrotCode } from '../scripts/foxtrot.ts';
    import { programmingLanguages } from '../scripts/programmingLanguages.ts';
    import { translationLanguages } from '../scripts/translationLanguages.ts';

    let canvasElement;
    let foxtrotCode = "";
    let programmingLanguage = "";
    let isLoading = false;
    let languageSelector: HTMLSelectElement;
    let translationLanguageSelector: HTMLSelectElement;
    let translationText = "Hello World";
    let translatedText = "";

    onMount(() => {
        initApp(canvasElement);
        relay_message();
        refreshFoxtrotCode();
        randomizeTranslation();
    });

    async function refreshFoxtrotCode(language = "") {
        isLoading = true;
        try {
            const result = await fetchFoxtrotCode(language);
            programmingLanguage = result.language;
            foxtrotCode = result.code;
            setLanguageSelector(result.language);
        } catch (error) {
            console.error("Error fetching Foxtrot code:", error);
            foxtrotCode = `${programmingLanguage} fried Skippy's circuits`;
        } finally {
            isLoading = false;
        }
    }

    function handleLanguageChange(event) {
        const selectedLanguage = event.target.value;
        refreshFoxtrotCode(selectedLanguage);
        handleTranslate();
    }

    function handleRandomButtonClick() {
        const randomLanguage = programmingLanguages[Math.floor(Math.random() * programmingLanguages.length)];
        refreshFoxtrotCode(randomLanguage);
    }

    function setLanguageSelector(language) {
        if (languageSelector) {
            languageSelector.value = language;
        }
    }

    function randomizeTranslation() {
        const randomLanguage = translationLanguages[Math.floor(Math.random() * translationLanguages.length)];
        translationLanguageSelector.value = randomLanguage.code;
        handleTranslate();
    }

    async function handleTranslate() {
        isLoading = true;
        try {
            const response = await fetch('https://skippyts.doctorew.com/translation', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    question: `Translate: ${translationText}`,
                    language: translationLanguageSelector.value,
                }),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const result = await response.json();
            translatedText = result.answer;
            console.log("|-o-| Translate! [[",translatedText,"]] Result:",result)
        } catch (error) {
            console.error("Error translating text:", error);
            translatedText = "Translation failed.";
        } finally {
            isLoading = false;
        }
    }
</script>

<canvas bind:this={canvasElement} id="c" class="fixed top-0 left-0 flex-grow min-h-0 min-w-0 h-screen w-screen" width="1416" height="1091"></canvas>

<main id="main" class="main relative flex-grow container mx-auto justify-center max-w-screen-lg space-y-10 bg-white bg-opacity-50 w-full">
    <section id="top" class="items-center w-full m-0">
        <h1 id="welcome" class="mx-auto flex-grow p-10 m-0 bg-no-repeat bg-white pl-40 font-bold text-5xl">
            Welcome to DoctorEw's Lab
        </h1>
        <div id="doctorew_contact">
            <h2 id="doctorew" class="mx-auto flex-grow p-10 m-0 bg-no-repeat bg-white bg-opacity-80 pl-40 font-bold text-xl">
                <span class="block text-3xl mt-2 mb-4 underline font-black">Andrew Schillinger<sup>(He/Him)</sup></span>
                <ul>
                    <li class="inline">Senior Technology Executive</li>
                    <li class="inline"> ● AI Leader</li>
                    <li class="inline"> ● CTO/Director of Emerging Technology & Innovation</li>
                    <li class="inline"> ● Business Growth Strategy</li>
                    <li class="inline"> ● 15+ years’ experience delivering data-driven digital disruption that transforms the way people connect</li>
                </ul>
            </h2>
            <h3 id="contact-area" class="mx-auto flex-grow p-10 m-0 bg-no-repeat bg-white bg-opacity-80 pl-40 pt-0 font-bold text-xl">
                <a href="https://www.linkedin.com/in/andrew-schillinger/" target="_blank" rel="noopener noreferrer" class="animate-pulse">LinkedIn</a> \\ 
                <a href="https://github.com/doctor-ew/" target="_blank" rel="noopener noreferrer" class="animate-pulse hover:animate-bounce">github</a> \\ 
                <a href="https://www.doctorew.com/Andrew_Schillinger_resume_engineering.pdf" target="_blank" rel="noopener noreferrer" class="animate-pulse hover:animate-bounce">resume</a> \\ 
                <a href="https://www.doctorew.medium.com/" target="_blank" rel="noopener noreferrer" class="animate-pulse hover:animate-bounce">blog</a> \\ 
                <a href="javascript:void(0);" rel="noopener noreferrer" class="animate-pulse hover:animate-bounce">drew[at]doctorew[dot]com</a>
            </h3>
        </div>
    </section>
    <section id="chat" class="items-center w-full m-0">
        <h1 id="skippistan" class="mx-auto flex-auto p-10 m-0 bg-no-repeat bg-white pl-40 font-bold text-3xl">
            Chat with Skippy the Magnificent! <br><sub class="text-sm">(From <a href="https://www.craigalanson.com/books" target="_blank" rel="noopener noreferrer" class="animate-pulse">Craig Alanson's ExForce series</a>) using TypeScript, Lambda, Serverless, and Svelte, and OpenAI's GPT-4 model \\ <a href="https://github.com/doctor-ew/go_skippy_lc" target="_blank" rel="noopener noreferrer" class="animate-pulse hover:animate-bounce">repo</a></sub>
        </h1>
        <div class="chat_holder grid grid-cols-1 gap-4 flex">
            <div class="form_holder block mb-6">
                <form class="mx-auto p-6" on:submit|preventDefault={relay_message}>
                    <label for="chat_box" class="active"></label>
                    <textarea id="chat_box" class="textarea w-full text-gray-200" name="chat_box" placeholder="Chat with Skippy the Magnificent!" required=""></textarea>
                    <button type="submit" name="submit" class="submit" id="chat_submit">Submit</button>
                </form>
            </div>
            <div id="chat_log" class="chat_log grid grid-cols-2 gap-4 flex"></div>
        </div>
    </section>
    <section id="foxtrot-codex" class="items-center w-full m-0">
        <div class="cb_top_holder bg-white block">
            <h1 id="skippistan" class="mx-auto flex-auto p-10 m-0 bg-no-repeat bg-white pl-40 font-bold text-3xl">
                Write `I will not use ChatGPT to code` 500 times in {programmingLanguage}!
            </h1>
            <div class="form_holder block">
                <label for="language_selector">Select Language:</label>
                <select id="language_selector" bind:this={languageSelector} on:change={handleLanguageChange}>
                    {#each programmingLanguages as language}
                    <option value={language}>{language}</option>
                    {/each}
                </select>
                <button on:click={handleRandomButtonClick}>Random</button>
            </div>
        </div>
        <div class="chalkboard grid grid-cols-1 gap-4 flex">
            {#if isLoading}
                <div class="loader"></div>
            {/if}
            <pre class="code-output" class:is-hidden={isLoading}>{foxtrotCode}</pre>
        </div>
    </section>
    <section id="translation-services" class="items-center w-full m-0">
        <h1 id="skippy-translate" class="mx-auto flex-auto p-10 m-0 bg-no-repeat bg-white pl-40 font-bold text-3xl">
            Skippy's Translation Services
        </h1>
        <div class="translation_holder grid grid-cols-1 gap-4 flex">
            <div class="form_holder block mb-6">
                <form class="mx-auto p-6" on:submit|preventDefault={handleTranslate}>
                    <label for="translation_box" class="active"></label>
                    <textarea id="translation_box" class="textarea w-full text-gray-200" bind:value={translationText} name="translation_box" placeholder="Enter text to translate..." required=""></textarea>
                    <div class="flex items-center mt-4">
                        <select id="translation_language_selector" bind:this={translationLanguageSelector} on:change={handleTranslate}>
                            {#each translationLanguages as language}
                            <option value={language.code}>{language.name}</option>
                            {/each}
                        </select>
                        <button type="submit" name="submit" class="submit ml-4" id="translate_submit">Translate</button>
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

    #language_selector, #translation_language_selector {
        background-color: #FFBE53;
    }

    #translated_text {
        background-color: rgba(255, 255, 255, 0.8);
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
