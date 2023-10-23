import {load, display_message, relay_message} from '../../src/scripts/chat'; // Adjust the import path

// Mocking the fetch function
global.fetch = (jest.fn(() => {
    return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({message: "Hello Skippy"})
    });
}) as unknown) as typeof fetch;

describe('Chat functions', () => {
    beforeEach(() => {
        // Clear all instances and calls to constructor and all methods:
        (fetch as jest.Mock).mockClear();
    });

    it('should fetch Skippy\'s response', async () => {
        await load();
        expect(fetch).toHaveBeenCalledTimes(1);
        expect(fetch).toHaveBeenCalledWith("https://gsl.doctorew.com/ask-skippy", expect.any(Object));
    });

    it('should display a message', () => {
        document.body.innerHTML = '<div id="chat_log"></div>';
        display_message("lowly_human", "Hello Skippy");
        const chatLog = document.getElementById("chat_log");
        if (chatLog && chatLog.firstChild) {
            expect(chatLog.children.length).toBe(1);
            expect(chatLog.firstChild.textContent).toBe("Hello Skippy");
        }
    });
});
