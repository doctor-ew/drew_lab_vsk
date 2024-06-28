import { personalities } from "./personalities";

export let logger: any = {};
let message: string = "What's up, Doc?";
let conversation: { type: string; text: string }[] = [];
export const uri: string = "https://skippyts.doctorew.com/chatbot";

// Flag to prevent duplicate calls on initial load
let isInitialLoad = true;

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
    }

    // Display the initial human message
    display_message("lowly_human", message, "human");

    // Fetch Skippy's response to the initial message
    fetch_message(message, personality).then((response) => {
      console.log("|-ct-| |-o-| Initial response from Skippy:", response);
      conversation.push({ type: "skippy_the_magnificent", text: response });
      display_message(
        "skippy_the_magnificent",
        response,
        personality.display_name
      );
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
  let new_h3 = document.createElement("h3");
  let new_p = document.createElement("p");

  new_div.classList.add(messageType);
  new_div.classList.add(
    "chat_log_item",
    "flex-auto",
    "m-0",
    "bg-no-repeat",
    "bg-white"
  );
  messageType === "lowly_human"
    ? new_p.classList.add("pl-10")
    : new_p.classList.add("pl-6");
  new_p.classList.add(
    "chat_log_item_line",
    "bg-white",
    "bg-opacity-60",
    "p-10",
    "w-full",
    "h-full"
  );

  new_p.textContent = messageText;
  //if (display_name !== "human") {
  new_h3.textContent = display_name || messageType;
  new_h3.classList.add(
    "chat_log_item_name",
    "text-lg",
    "font-bold",
    "underline"
  );
  new_div.appendChild(new_h3);
  //}
  new_div.appendChild(new_p);
  div_chat_log.appendChild(new_div);
};

export const randomizePersonality = (
  personalities: { name: string; icon: string; display_name: string }[]
): string => {
  const randomIndex = Math.floor(Math.random() * personalities.length);
  return personalities[randomIndex];
};

// Ensure initial_load is called once the DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
  console.log("|-ct-| |-o-| DOMContentLoaded event fired. Initial load call");
  initial_load(randomizePersonality(personalities));
});
