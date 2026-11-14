import type { Personality } from './personalities';
export const randomizePersonality = (items: Personality[]): Personality => items[Math.floor(Math.random() * items.length)];
export function updateSkippyChatBackground(personality: Pick<Personality, 'name' | 'portrait'>) {
  const heading = document.querySelector<HTMLElement>('.h1-skippy-chat');
  if (heading) {
    const image = personality.portrait === null ? null : personality.portrait?.src || `https://www.doctorew.com/assets/gpt_personalities/${personality.name}.png`;
    heading.style.backgroundImage = image ? `url('${image}')` : 'none';
    heading.style.backgroundSize = 'contain';
    heading.style.backgroundRepeat = 'no-repeat';
    heading.style.backgroundPosition = 'left center';
  }
}
