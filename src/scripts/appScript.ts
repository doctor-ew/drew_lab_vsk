import anime from 'animejs';
import * as Animations from './animations';
import * as Chat from './chat';
import { initializeCanvas, addClickListeners, init } from './animations.ts';

document.addEventListener("DOMContentLoaded", () => {
    initializeCanvas();
    addClickListeners();
    init();
});

export function initApp(canvasElement: HTMLCanvasElement) {
    const img_doctor_doctor = "https://www.doctorew.com/shuttlebay/doctor-doctor-doctor-1024.png";


    // Initialize animations
    Animations.animejs_bg(canvasElement);

    // Initialize chat
    window.onload = Chat.load;

    document.querySelector("#chat_submit").addEventListener(
        "click",
        (event) => {
            event.preventDefault();
            console.log(`|-o-| Prevented form submit ${JSON.stringify(event)}`);
            Chat.relay_message();
        },
        false
    );

    const chat_box = document.querySelector("#chat_box") as HTMLInputElement;
    chat_box.addEventListener("keydown", function (e) {
        if (e.keyCode == 13) {
            event.preventDefault();
            console.log(this.form);
            this.form.querySelector("button").click();
            this.value = "";
        }
    });
}
