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
    let canvasElement;
    let foxtrotCode = "";
    let programmingLanguage = "";

  onMount(() => {
    initApp(canvasElement);
    relay_message();
    refreshFoxtrotCode();
  });

  async function refreshFoxtrotCode(language = "") {
    try {
      const result = await fetchFoxtrotCode(language);
      programmingLanguage = result.language;
      foxtrotCode = result.code;
    } catch (error) {
      console.error("Error fetching Foxtrot code:", error);
    }
  }

  function handleLanguageChange(event) {
    const selectedLanguage = event.target.value;
    refreshFoxtrotCode(selectedLanguage);
  }

  function handleRandomButtonClick() {
    refreshFoxtrotCode();
  }
</script>
<canvas bind:this={canvasElement} id="c" class="fixed top-0 left-0 flex-grow min-h-0 min-w-0 h-screen w-screen" width="1416" height="1091"></canvas>

<main id="main"
      class="main relative flex-grow container mx-auto justify-center max-w-screen-lg space-y-10 bg-white bg-opacity-50 w-full">
    <section id="top" class="items-center w-full m-0">
        <!-- <picture>
    <source srcset='https://www.doctorew.com/shuttlebay/doctor-doctor-doctor.webp' type='image/webp' />
    </picture> -->
        <h1 id="welcome" class="mx-auto flex-grow p-10 m-0 bg-no-repeat bg-white pl-40 font-bold text-5xl">
            Welcome to DoctorEw's Lab
        </h1>
        <div id="doctorew_contact">

            <h2 id="doctorew"
                class="mx-auto flex-grow p-10 m-0 bg-no-repeat bg-white bg-opacity-80 pl-40 font-bold text-xl">
                <span class="block text-3xl mt-2 mb-4 underline font-black">Andrew Schillinger<sup>(He/Him)</sup></span>
                <ul>
                    <li class="inline">Senior Technology Executive</li>
                    <li class="inline"> ● AI Leader</li>
                    <li class="inline"> ● CTO/Director of Emerging Technology &amp; Innovation</li>
                    <li class="inline"> ● Business Growth Strategy</li>
                    <li class="inline"> ● 15+ years’ experience delivering data-driven digital disruption that
                        transforms the way people connect
                    </li>
                </ul>
            </h2>
            <h3 id="contact-area"
                class="mx-auto flex-grow p-10 m-0 bg-no-repeat bg-white bg-opacity-80 pl-40 pt-0 font-bold text-xl">
                <a href="https://www.linkedin.com/in/andrew-schillinger/" target="_blank" rel="noopener noreferrer"
                   class="animate-pulse">LinkedIn</a> \\ <a href="https://github.com/doctor-ew/" target="_blank"
                                                            rel="noopener noreferrer"
                                                            class="animate-pulse hover:animate-bounce">github</a> \\ <a
                    href="https://www.doctorew.com/Andrew_Schillinger_resume_engineering.pdf" target="_blank"
                    rel="noopener noreferrer" class="animate-pulse hover:animate-bounce">resume</a> \\ <a
                    href="https://www.doctorew.medium.com/" target="_blank" rel="noopener noreferrer"
                    class="animate-pulse hover:animate-bounce">blog</a> \\ <a href="javascript:void(0);"
                                                                              rel="noopener noreferrer"
                                                                              class="animate-pulse hover:animate-bounce">drew[at]doctorew[dot]com</a>
            </h3>
        </div>
    </section>
    <section id="chat" class="items-center w-full m-0">
        <h1 id="skippistan" class="mx-auto flex-auto p-10 m-0 bg-no-repeat
            bg-white pl-40 font-bold text-3xl">
            Chat with Skippy the Magnificent! <br><sub class="text-sm">(From <a
                href="https://www.craigalanson.com/books" target="_blank" rel="noopener noreferrer"
                class="animate-pulse">Craig Alanson's ExForce series</a>) using golang, gin, and OpenAI's GPT-4 model \\ <a
                href="https://github.com/doctor-ew/go_skippy_lc" target="_blank"
                rel="noopener noreferrer" class="animate-pulse hover:animate-bounce">repo</a> </sub>
        </h1>
        <div class="chat_holder grid grid-cols-1 gap-4 flex">
            <div class="form_holder block mb-6">
                <form class="mx-auto p-6">
                    <!-- <div class='input text '> -->
                    <label for="chat_box" class="active"></label>
                    <textarea id="chat_box" class="textarea w-full text-gray-200" name="chat_box"
                              placeholder="Chat with Skippy the Magnificent!" required=""></textarea>
                    <!-- </div> -->
                    <button type="submit" name="submit" class="submit hidden" id="chat_submit">Submit</button>
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
      <select id="language_selector" on:change={handleLanguageChange}>
        {#each programmingLanguages as language}
        <option value={language}>{language}</option>
        {/each}
      </select>
      <button on:click={handleRandomButtonClick}>Random</button>
    </div>
     </div>
        <div class="chalkboard grid grid-cols-1 gap-4 flex">
            <pre class="code-output">{foxtrotCode}</pre>
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
    background-size: contain; /* Ensure the image fits within the container */
    position: relative; /* Ensure positioned elements are relative to this container */
    padding-bottom: 0; /* Remove any additional padding */
    min-height: 550px; /* Ensure there is enough space for the chalkboard */
}

.code-output {
    width: 100%; /* Make the code output take the full width of the parent */
    max-width: 610px; /* Maximum width to ensure it fits within the green section */
    margin: 0; /* Center the code output */
    padding: 2rem;
    background-color: rgba(0, 128, 0, 0.8); /* Green chalkboard color */
    color: white;
    font-family: 'Source Code Pro', monospace;
    overflow: auto;
    position: absolute; /* Position the code output within the parent */
    text-align: left;
    
    bottom: 50px; /* Align the code output to the bottom of the chalkboard */
    /* left: 50%; */ /* Center the code output horizontally */
    /* transform: translateX(-50%); */ /* Center the code output horizontally */
    max-height: calc(100% - 4rem); /* Ensure the code output fits within the container */
    min-height: 275px; /* Minimum height to ensure enough space for the code */
    white-space: break-spaces; /* Allow the code to break at spaces */
}

</style>
