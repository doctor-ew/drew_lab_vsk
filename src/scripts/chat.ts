import type { Personality } from './personalities';
export const randomizePersonality = (items: Personality[]): Personality => items[Math.floor(Math.random() * items.length)];
export function updateSkippyChatBackground(personality: { name: string }) {
  const heading = document.querySelector<HTMLElement>('.h1-skippy-chat');
  if (heading) {
    heading.style.backgroundImage = `url('https://www.doctorew.com/assets/gpt_personalities/${personality.name}.png')`;
    heading.style.backgroundSize = 'contain';
    heading.style.backgroundRepeat = 'no-repeat';
    heading.style.backgroundPosition = 'left center';
  }
}
