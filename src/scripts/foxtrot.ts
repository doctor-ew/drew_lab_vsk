// src/scripts/foxtrot.ts

import { programmingLanguages } from "./programmingLanguages";

const getRandomProgrammingLanguage = (): string => {
  const randomIndex = Math.floor(Math.random() * programmingLanguages.length);
  return programmingLanguages[randomIndex];
};

export const fetchFoxtrotCode = async (
  language = ""
): Promise<{ language: string; code: string }> => {
  const programmingLanguage = language || getRandomProgrammingLanguage();
  const response = await fetch("https://skippyts.doctorew.com/foxtrot", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ programmingLanguage }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  console.log("|-o-| Foxtrot Data:", data);
  const code = data.answer || "No response from Skippy.";
  // Remove the backticks and language hint (e.g., ```perl)
  const cleanedCode = code.replace(/```[a-z]*\n|```/g, "");
  console.log("|-oo-| Foxtrot Lang:", {
    language: programmingLanguage,
    code: cleanedCode,
  });

  return { language: programmingLanguage, code: cleanedCode };
};
