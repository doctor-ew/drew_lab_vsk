import { personalities } from "./personalities";

// Group personalities by category and sort within each category
const groupedPersonalities: { [key: string]: Personality[] } =
  personalities.reduce((acc, personality) => {
    const category = personality.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(personality);
    return acc;
  }, {} as { [key: string]: Personality[] });

Object.keys(groupedPersonalities).forEach((category) => {
  groupedPersonalities[category].sort((a, b) =>
    a.display_name.localeCompare(b.display_name)
  );
});

export let logger: any = {};
let message: string = "What's up, Doc?";
let conversation: { type: string; text: string }[] = [];
export const uri: string = "https://skippyts.doctorew.com/chatbot";

// Flag to prevent duplicate calls on initial load
let isInitialLoad = true;

/* ---------------- Utility Functions ---------------- */

// Utility function to find personality object by name
export const findPersonalityByName = (
  name: string,
  personalities: { name: string; icon: string; display_name: string }[]
): { name: string; icon: string; display_name: string } => {
  return (
    personalities.find((p) => p.name === name) || {
      name: "default",
      display_name: "Default",
      icon: "default-icon.png",
    }
  );
};

// Function to fetch message from the server with personality
export const fetch_message = async (
  message: string,
  personality: { name: string; display_name: string; icon: string }
): Promise<string> => {
  console.log(
    "|-ct-| |-o-| fetch_message function called. Message:",
    message,
    "Personality:",
    personality
  );

  const sendPersonality = personality.name;
  const settings = {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      question: message,
      personality: sendPersonality,
    }),
  };
  console.log(
    "|-ct-| |-00-| settings:",
    settings,
    " :: sendPersonality:",
    sendPersonality
  );
  try {
    const message_response = await fetch(uri, settings);
    if (!message_response.ok) {
      let errMsg = `HTTP error! status: ${message_response.status}`;
      try {
        const errorData = await message_response.json();
        if (errorData && errorData.error) {
          errMsg += ` Message: ${errorData.error}`;
        }
      } catch (e) {
        console.log(
          `[-E-] Failed to parse error message from server: ${e} :: errMsg: ${errMsg}`
        );
      }
      throw new Error(errMsg);
    }

    const data = await message_response.json();
    return data.answer || "No response from Skippy.";
  } catch (error) {
    console.log(`ERROR! ${error}`);
    return "Error fetching message.";
  }
};

// Function to update the h1-skippy-chat background image
export const updateSkippyChatBackground = (personality: { name: string }) => {
  console.log(
    "|-ct-| |-o-| updateSkippyChatBackground function called with personality: ",
    personality
  );
  const skippyChatH1 = document.querySelector(
    ".h1-skippy-chat"
  ) as HTMLHeadingElement;
  if (skippyChatH1) {
    skippyChatH1.style.backgroundImage = `url('https://www.doctorew.com/assets/gpt_personalities/${personality.name}.png')`;
    skippyChatH1.style.backgroundSize = "contain";
    skippyChatH1.style.backgroundRepeat = "no-repeat";
    skippyChatH1.style.backgroundPosition = "left center";
  }
};

// Function to display messages
export const display_message = (
  messageType: string,
  messageText: string,
  display_name: string
) => {
  console.log(
    "|-ct-| |-o-| display_message function called. messageType:",
    messageType,
    " :: messageText:",
    messageText,
    " :: display_name: ",
    display_name
  );
  const div_chat_log = document.getElementById("chat_log");

  if (!div_chat_log) {
    console.error("chat_log element not found in the DOM.");
    return;
  }

  let new_div = document.createElement("div");
  let wrapper_div = document.createElement("div");
  let new_h3 = document.createElement("h3");
  let new_p = document.createElement("p");

  new_div.classList.add(messageType);
  new_div.classList.add(
    "chat_log_item",
    "flex-auto",
    "m-0",
    "bg-no-repeat",
    "bg-cover",
    "relative",
    "h-full"
  );

  // Set dynamic background image
  const bgImageUrl =
    messageType === "lowly_human"
      ? "https://www.doctorew.com/shuttlebay/axis_of_awesome.svg"
      : `https://www.doctorew.com/assets/gpt_personalities/${messageType}.png`;
  new_div.style.backgroundImage = `url('${bgImageUrl}')`;

  wrapper_div.classList.add(
    "bg-white",
    "bg-opacity-60",
    "p-4",
    "rounded-lg",
    "shadow-md",
    "w-full",
    "h-full",
    "flex",
    "flex-col"
  );

  new_h3.textContent = display_name || messageType;
  new_h3.classList.add(
    "chat_log_item_name",
    "text-lg",
    "font-bold",
    "underline",
    "mb-2",
    "flex",
    "items-center"
  );

  // Add small version of the personality image
  if (messageType !== "lowly_human") {
    let img = document.createElement("img");
    img.src = `https://www.doctorew.com/assets/gpt_personalities/${messageType}.png`;
    img.alt = display_name || messageType;
    img.classList.add("w-6", "h-6", "mr-2");
    new_h3.prepend(img);
  }

  new_p.textContent = messageText;
  messageType === "lowly_human"
    ? new_p.classList.add("pl-10")
    : new_p.classList.add("pl-6");
  new_p.classList.add("chat_log_item_line", "w-full", "h-full");

  wrapper_div.appendChild(new_h3);
  wrapper_div.appendChild(new_p);
  new_div.appendChild(wrapper_div);
  div_chat_log.appendChild(new_div);
};

// Function to randomize personality
export const randomizePersonality = (
  personalities: { name: string; icon: string; display_name: string }[]
): { name: string; icon: string; display_name: string } => {
  const randomIndex = Math.floor(Math.random() * personalities.length);
  return personalities[randomIndex];
};

/* ---------------- Core Functions ---------------- */

// Function to handle the initial load of the application
export const initial_load = (personality: {
  name: string;
  icon: string;
  display_name: string;
}) => {
  console.log(
    "|-ct-| |-o-| initial_load function called. isInitialLoad:",
    isInitialLoad,
    " :: personality:",
    personality
  );

  if (isInitialLoad) {
    isInitialLoad = false;

    // Select the correct option in the personality dropdown
    const personalitySelector = document.getElementById(
      "personality_selector"
    ) as HTMLSelectElement;
    if (personalitySelector) {
      personalitySelector.value = personality.name;

      // Clear existing options
      personalitySelector.innerHTML = "";

      // Create option groups for each category
      Object.keys(groupedPersonalities).forEach((category) => {
        const optgroup = document.createElement("optgroup");
        optgroup.label = category;

        groupedPersonalities[category].forEach((personality) => {
          const option = document.createElement("option");
          option.value = personality.name;
          option.text = personality.display_name;
          optgroup.appendChild(option);
        });

        personalitySelector.appendChild(optgroup);
      });

      // Select the correct option
      personalitySelector.value = personality.name;
      console.log(
        "|-ct-| |-o-| personalitySelector:",
        personalitySelector.value,
        " :: personality:",
        personality.name
      );
    }

    // Update the h1-skippy-chat background image
    updateSkippyChatBackground(personality);

    // Display the initial human message
    display_message("lowly_human", message, "human");

    // Fetch Skippy's response to the initial message
    fetch_message(message, personality).then((response) => {
      console.log("|-ct-| |-o-| Initial response from Skippy:", response);
      conversation.push({ type: "skippy_the_magnificent", text: response });
      display_message(personality.name, response, personality.display_name);
    });
  }
};

// Function to handle user-submitted messages
export const relay_message = async (
  event: Event,
  personality: string | { name: string; icon: string; display_name: string }
) => {
  console.log("|-ct-| |-o-| Form submitted :: personality: ", personality);

  if (typeof personality === "string") {
    personality = findPersonalityByName(personality, personalities);
  }

  const chat_box = document.querySelector("#chat_box") as HTMLTextAreaElement;
  const userMessage = chat_box.value.trim();

  if (!personality) {
    const personalitySelector = document.getElementById(
      "personality_selector"
    ) as HTMLSelectElement;

    // Get the selected option
    const selectedPersonality =
      personalitySelector.options[personalitySelector.selectedIndex].value;

    personality = findPersonalityByName(selectedPersonality, personalities);

    console.log(
      "|-ct-| |-o-| relay_message :: selectedPersonality:",
      selectedPersonality,
      ":: personality: ",
      personality
    );
  }

  if (userMessage) {
    message = userMessage;
    // Add the user's message to the conversation array
    conversation.push({ type: "lowly_human", text: userMessage });

    // Display the user's message
    display_message("lowly_human", userMessage, "human");

    // Fetch Skippy's response and display it
    console.log(
      "|-ct-| |-OOO-| Fetching message from server. User message:",
      userMessage,
      "Personality:",
      personality
    );
    const response = await fetch_message(userMessage, personality);
    conversation.push({ type: personality.name, text: response });
    display_message(personality.name, response, personality.display_name);

    // Update the h1-skippy-chat background image
    updateSkippyChatBackground(personality);
  }
};

// Ensure initial_load is called once the DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
  console.log("|-ct-| |-o-| DOMContentLoaded event fired. Initial load call");
  initial_load(randomizePersonality(personalities));
});
