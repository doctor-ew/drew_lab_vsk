export let logger: any = {};
export let message: string = "What's up, Doc?";
export const uri: string = "https://skippy.doctorew.com/chat";

export const load = () => {
    const fetch_message = async () => {
        const settings = {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                msg: message
            })
        };

        const uri_to_fetch = uri;
        const message_response = await fetch(uri_to_fetch, settings);
        if (!message_response.ok) {
            throw new Error(`HTTP error! status: ${message_response.status}`);
        }
        return await message_response.json();
    };

    fetch_message()
        .then((data) => {
            window.chat_data = data;
            console.log(
                "|-o-| load func",
                data,
                `typeof ${data} load event detected: ${JSON.stringify(data)} || ${data.statusCode} ||| ${data.message}`
            );

            let returned_message;
            if (data) {
                returned_message = data;
                console.log(`awesome message: ${returned_message}`);
                display_message(returned_message);
            }
        })
        .catch((error) => {
            console.log(`ERROR! ${error}`);
            message = "returned_message";
        });
};

export const display_message = (chat_data: any) => {
    const div_chat_log = document.getElementById("chat_log");
    const arr_classnames = ["skippy_the_magnificent", "lowly_human"];

    window.cd = chat_data;

    arr_classnames.forEach((className) => {
        let new_div = document.createElement("div");
        let new_p = document.createElement("p");
        console.log(
            "|-o-| line: ",
            chat_data,
            className,
            chat_data[className],
            `:: ${className}`
        );
        new_div.classList.add(className);
        new_div.classList.add(
            "chat_log_item",
            "flex-auto",
            "m-0",
            "bg-no-repeat",
            "bg-white"
        );
        className == "lowly_human" ? new_p.classList.add("pl-40") : new_p.classList.add("pl-36");
        new_p.classList.add(
            "chat_log_item_line",
            "bg-white",
            "bg-opacity-60",
            "p-10",
            "w-full",
            "h-full"
        );
        new_p.textContent = chat_data[className];
        new_div.prepend(new_p);
        div_chat_log.prepend(new_div);
    });
};

export const relay_message = () => {
    const chat_box = document.querySelector("#chat_box") as HTMLInputElement;
    message = chat_box.value || null;

    if (message) {
        console.log(`|-oo-| relay_message ${message}`);
        load();
    } else {
        console.log(`|-oo-| relay_message ${message}`);
    }
};
