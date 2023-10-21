<script lang="ts">
    import svelteLogo from '../../public/svelte.svg'
    import viteLogo from '/vite.svg'
    import Counter from '../lib/Counter.svelte'
    import anime from 'animejs';
    import { onMount } from 'svelte';
    import { initApp } from '../scripts/appScript.ts'; // Import the function from the new script file

    let canvasElement; // Declare the canvas variable

    onMount(() => {
        initApp(canvasElement); // Initialize the app after the component is mounted
    });
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
                <span class="block text-3xl mt-2 mb-4">Andrew Schillinger<sup>(He/Him)</sup></span>
                <ul>
                    <li class="inline">Senior Technology Executive</li>
                    <li class="inline"> ● AI Leader</li>
                    <li class="inline"> ● Director of Emerging Technology &amp; Innovation</li>
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
            bg-white pl-40 font-bold text-5xl">
            Chat with Skippy the Magnificent! <br><sub class="text-lg">(From <a
                href="https://www.craigalanson.com/books" target="_blank" rel="noopener noreferrer"
                class="animate-pulse">Craig Alanson's ExForce series</a>) using OpenAI's GPT-3 model \\ <a
                href="https://github.com/doctor-ew/skippy-the-magnificent-python" target="_blank"
                rel="noopener noreferrer" class="animate-pulse hover:animate-bounce">repo</a> </sub>
        </h1>
        <div class="chat_holder grid grid-cols-1 gap-4 flex">
            <div class="form_holder block">
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
</style>
