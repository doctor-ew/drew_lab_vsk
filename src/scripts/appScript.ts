import anime from 'animejs';

export function initApp(canvasElement: HTMLCanvasElement) {

    const img_doctor_doctor = "https://www.doctorew.com/shuttlebay/doctor-doctor-doctor-1024.png";

    const animejs_bg = () => {
        const c = canvasElement; // Use the passed canvasElement instead of querying the DOM
        c.classList.add("flex-grow", "min-h-0", "min-w-0", "h-screen");
        const ctx = c.getContext("2d");
        // ... rest of the animejs_bg function code ...
    };

    const draw_image = async (src) => {
        // ... rest of the draw_image function code ...
    };

    // draw_image(img_doctor_doctor).then(animejs_bg);
    animejs_bg();

    /* CHAT */
    let logger = {};
    let message = "What's up, Doc?";
    let uri = "https://skippy.doctorew.com/chat";

    const load = () => {
        // ... rest of the load function code ...
    };
    window.onload = load;

    const display_message = (chat_data) => {
        // ... rest of the display_message function code ...
    };

    const relay_message = () => {
        // ... rest of the relay_message function code ...
    };

    document.querySelector("#chat_submit").addEventListener(
        "click",
        (event) => {
            // ... event listener code ...
        },
        false
    );

    chat_box.addEventListener("keydown", function (e) {
        // ... event listener code ...
    });
}
