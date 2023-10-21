import anime from 'animejs';
let c: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;
let cH: number;
let cW: number;
let bgColor = "#FF6138";


export const animejs_bg = () => {
    initializeCanvas();
    addClickListeners();
    animate; // This initializes the anime.js animation
};

export const initializeCanvas = () => {
    c = document.getElementById("c") as HTMLCanvasElement;
    ctx = c?.getContext("2d") || null;
    cH = window.innerHeight;
    cW = window.innerWidth;
};

const animations: any[] = [];

const colorPicker = (() => {
    const colors = ["#FF6138", "#FFBE53", "#2980B9", "#282741"];
    let index = 0;
    const next = () => {
        index = index++ < colors.length - 1 ? index : 0;
        return colors[index];
    };
    const current = () => colors[index];
    return {
        next: next,
        current: current
    };
})();

const removeAnimation = (animation: any) => {
    const index = animations.indexOf(animation);
    if (index > -1) animations.splice(index, 1);
};

const calcPageFillRadius = (x: number, y: number) => {
    const l = Math.max(x - 0, cW - x);
    const h = Math.max(y - 0, cH - y);
    return Math.sqrt(Math.pow(l, 2) + Math.pow(h, 2));
};

export const addClickListeners = () => {
    document.addEventListener("touchstart", handleEvent);
    document.addEventListener("mousedown", handleEvent);
};

function handleEvent(e: any) {
    if (e.touches) {
        e.preventDefault();
        e = e.touches[0];
    }
    const currentColor = colorPicker.current();
    const nextColor = colorPicker.next();
    const targetR = calcPageFillRadius(e.pageX, e.pageY);
    const rippleSize = Math.min(200, cW * 0.4);
    const minCoverDuration = 750;

    const pageFill = new Circle({
        x: e.pageX,
        y: e.pageY,
        r: 0,
        fill: nextColor
    });

    const fillAnimation = anime({
        targets: pageFill,
        r: targetR,
        duration: Math.max(targetR / 2, minCoverDuration),
        easing: "easeOutQuart",
        complete: function () {
            bgColor = pageFill.fill;
            removeAnimation(fillAnimation);
        }
    });

    const ripple = new Circle({
        x: e.pageX,
        y: e.pageY,
        r: 0,
        fill: currentColor,
        stroke: {
            width: 3,
            color: currentColor
        },
        opacity: 1
    });

    const rippleAnimation = anime({
        targets: ripple,
        r: rippleSize,
        opacity: 0,
        easing: "easeOutExpo",
        duration: 900,
        complete: removeAnimation
    });

    const particles: any[] = [];
    for (let i = 0; i < 32; i++) {
        const particle = new Circle({
            x: e.pageX,
            y: e.pageY,
            fill: currentColor,
            r: anime.random(24, 48)
        });
        particles.push(particle);
    }

    const particlesAnimation = anime({
        targets: particles,
        x: function (particle: any) {
            return particle.x + anime.random(rippleSize, -rippleSize);
        },
        y: function (particle: any) {
            return particle.y + anime.random(rippleSize * 1.15, -rippleSize * 1.15);
        },
        r: 0,
        easing: "easeOutExpo",
        duration: anime.random(1000, 1300),
        complete: removeAnimation
    });

    animations.push(fillAnimation, rippleAnimation, particlesAnimation);
}

function extend(a: any, b: any) {
    for (let key in b) {
        if (b.hasOwnProperty(key)) {
            a[key] = b[key];
        }
    }
    return a;
}

class Circle {
    x: number;
    y: number;
    r: number;
    fill?: string;
    stroke?: { width: number, color: string };
    opacity?: number;

    constructor(opts: any) {
        extend(this, opts);
    }

    draw() {
        ctx.globalAlpha = this.opacity || 1;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI, false);
        if (this.stroke) {
            ctx.strokeStyle = this.stroke.color;
            ctx.lineWidth = this.stroke.width;
            ctx.stroke();
        }
        if (this.fill) {
            ctx.fillStyle = this.fill;
            ctx.fill();
        }
        ctx.closePath();
        ctx.globalAlpha = 1;
    }
}

const animate = anime({
    duration: Infinity,
    update: function () {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, cW, cH);
        animations.forEach(function (anim) {
            anim.animatables.forEach(function (animatable: any) {
                animatable.target.draw();
            });
        });
    }
});

export const resizeCanvas = () => {
    cW = window.innerWidth;
    cH = window.innerHeight;
    c.width = cW * devicePixelRatio;
    c.height = cH * devicePixelRatio;
    ctx.scale(devicePixelRatio, devicePixelRatio);
};

export const init = () => {
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    addClickListeners();
};

export const adjustCanvasSize = () => {
    if (c) {
        c.width = window.innerWidth;
        c.height = window.innerHeight;
    }
};

// Initially set the canvas size
adjustCanvasSize();

// Adjust the canvas size whenever the window is resized
window.addEventListener('resize', adjustCanvasSize);
