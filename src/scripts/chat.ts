export let logger: any = {};
let message: string = "What's up, Doc?";

let conversation: { type: string, text: string }[] = [];
export const uri: string = "https://gsl.doctorew.com/ask-skippy";

export const load = () => {
    const fetch_message = async () => {
        const settings = {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: message
            })
        };

        const uri_to_fetch = uri;

        const message_response = await fetch(uri_to_fetch, settings);
        if (!message_response.ok) {
            let errMsg = `HTTP error! status: ${message_response.status}`;
            try {
                const errorData = await message_response.json();
                if (errorData && errorData.error) {
                    errMsg += ` Message: ${errorData.error}`;
                }
            } catch (e) {
                // Failed to parse error message from server, use default error message
            }
            throw new Error(errMsg);
        }

        return await message_response.json();
    };

    fetch_message()
        .then((data) => {
            let skippyResponse;
            if (data && data.message) {
                skippyResponse = data.message;
            }

            // Add Skippy's response to the conversation array
            conversation.push({type: "skippy_the_magnificent", text: skippyResponse});

            // Display Skippy's response
            display_message("skippy_the_magnificent", skippyResponse);
        })
        .catch((error) => {
            console.log(`ERROR! ${error}`);
            message = "returned_message";
        });
};

export const display_message = (messageType: string, messageText: string) => {
    const div_chat_log = document.getElementById("chat_log");

    let new_div = document.createElement("div");
    let new_p = document.createElement("p");

    new_div.classList.add(messageType);
    new_div.classList.add(
        "chat_log_item",
        "flex-auto",
        "m-0",
        "bg-no-repeat",
        "bg-white"
    );
    messageType == "lowly_human" ? new_p.classList.add("pl-40") : new_p.classList.add("pl-36");
    new_p.classList.add(
        "chat_log_item_line",
        "bg-white",
        "bg-opacity-60",
        "p-10",
        "w-full",
        "h-full"
    );
    new_p.textContent = messageText;
    new_div.appendChild(new_p);
    div_chat_log.appendChild(new_div);
};

export const relay_message = () => {
    const chat_box = document.querySelector("#chat_box") as HTMLInputElement;
    const userMessage = chat_box.value || message;

    if (userMessage) {
        message = userMessage;
        // Add the user's message to the conversation array
        conversation.push({type: "lowly_human", text: userMessage});

        // Display the user's message
        display_message("lowly_human", userMessage);

        // Fetch Skippy's response and display it
        load();
    }
};

