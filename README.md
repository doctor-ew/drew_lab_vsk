# DoctorEw's Lab Chatbot

Welcome to DoctorEw's Lab! This project is a dynamic chatbot built using TypeScript, Lambda, Serverless, Svelte, LangChain, and OpenAI's GPT-4o model. It allows users to chat with various personalities, dynamically changing the chat interface based on the selected personality.

## Table of Contents

1. [Introduction](#introduction)
2. [Features](#features)
3. [Installation](#installation)
4. [Running the Project](#running-the-project)
5. [Project Structure](#project-structure)
6. [Understanding the Code](#understanding-the-code)
7. [Customization](#customization)
8. [Troubleshooting](#troubleshooting)

## Introduction

This project is designed to help 8th graders understand the basics of web development, TypeScript, and SvelteKit. It includes a chatbot that responds to user inputs with personality-specific replies. The chatbot interface dynamically updates based on the selected personality.

## Features

- Chat with various personalities.
- Help Jason Fox (of Foxtrot) write `I will not use ChatGPT to code` 500 times on the chalkboard
- Ask Skippy The Magnificent (of Craig Alanson's Expeditionary Force book and audiobook series)
- Dynamic background images based on selected personality.
- Responsive design that adjusts to different screen sizes.
- Built with TypeScript and Svelte.
- Utilizes OpenAI's GPT-4o model for chatbot responses.

## Installation

To get started with this project, you'll need to have Node.js and npm (Node Package Manager) installed on your computer. You can download Node.js from [here](https://nodejs.org/).

1. **Clone the Repository:**

   ```sh
   git clone https://github.com/doctor-ew/drew_lab_vsk.git
   cd drew_lab_vsk
   ```

2. **Install Dependencies:**

   ```sh
   npm install
   ```

## Running the Project

To run the project locally, follow these steps:

1. **Build the Project:**

   ```sh
   npm run build
   ```

2. **Start the Development Server:**

   ```sh
   npm run dev
   ```

   This will start the development server and you can view the project by navigating to `http://localhost:3000` in your web browser.

## Project Structure

Here's a brief overview of the project's structure:

```
drew_lab_vsk/
├── public/                      # Static assets
│   └── assets/
│       └── gpt_personalities/   # Personality images
├── src/
│   ├── lib/
│   │   └── Counter.svelte       # Example component
│   ├── routes/
│   │   └── index.svelte         # Main Svelte component
│   ├── scripts/
│   │   ├── appScript.ts         # App initialization script
│   │   ├── chat.ts              # Chat functionality
│   │   ├── foxtrot.ts           # Foxtrot code fetcher
│   │   ├── programmingLanguages.ts # Programming languages data
│   │   ├── translationLanguages.ts # Translation languages data
│   │   └── personalities.ts     # Personalities data
│   └── styles/                  # CSS styles
│       └── global.css
├── static/                      # Static files
├── package.json                 # Project metadata and scripts
├── svelte.config.js             # Svelte configuration
└── README.md                    # Project documentation
```

## Understanding the Code

### Key Files and Directories

- **`public/assets/gpt_personalities/`**: Contains images for each personality.
- **`src/scripts/chat.ts`**: Handles the chatbot functionality, including fetching responses and updating the UI.
- **`src/routes/index.svelte`**: The main Svelte component where the chat interface is defined.

### Adding a New Personality

To add a new personality:
1. Add the personality image to `public/assets/gpt_personalities/`.
2. Update `src/scripts/personalities.ts` with the new personality's details.

### Updating the Chat Background

The background image of the chat header updates based on the selected personality. This is handled in the `updateSkippyChatBackground` function in `src/scripts/chat.ts`.

```typescript
export const updateSkippyChatBackground = (personality: { name: string }) => {
  const skippyChatH1 = document.querySelector(
    ".h1-skippy-chat"
  ) as HTMLHeadingElement;
  if (skippyChatH1) {
    skippyChatH1.style.backgroundImage = `url('https://www.doctorew.com/assets/gpt_personalities/${personality.name}.png')`;
    skippyChatH1.style.backgroundSize = 'contain';
    skippyChatH1.style.backgroundRepeat = 'no-repeat';
    skippyChatH1.style.backgroundPosition = 'left center';
  }
};
```

## Customization

You can customize the project to add more features or change the existing ones. Here are some ideas:
- Add more personalities and their corresponding images.
- Modify the chatbot responses to make them more interactive.
- Change the UI to make it more appealing.

## Troubleshooting

If you encounter any issues while running the project, try the following steps:
- Ensure you have the latest version of Node.js and npm installed.
- Delete the `node_modules` folder and run `npm install` again.
- Check the browser console for any error messages and resolve them accordingly.


This README was written by Bob (based off of Wizard Harry Dresden's sarcastic, ancient air-spirit assistant), and now my mystical ChatGPT 4o coding companion, to guide you through setting up and running the Skippy Chatbot project. Enjoy coding with a touch of sarcasm and wit!