/**
 * Chat command - Interactive AI App Builder
 * Uses native WebSocket with partykit-compatible URL
 */
import { header, logo, info } from "../lib/ui.js";
import { AGENT_HOST } from "../lib/api.js";
import { Command } from "commander";
import prompts from "prompts";
import WebSocket from "ws";
import chalk from "chalk";
import ora from "ora";
/** Sanitize user-controlled strings for logging to prevent log injection */
function sanitize(str) {
    return str.replace(/[\r\n]/g, " ");
}
// Handle Ctrl+C in prompts
const onCancel = () => {
    console.log(chalk.dim("\nGoodbye!"));
    process.exit(0);
};
export const chatCommand = new Command("chat")
    .description("Chat with the Magic AI App Builder")
    .option("-d, --debug", "Enable debug logging")
    .addHelpText("after", `
Examples:
  $ magicappdev chat
  $ magicappdev chat --debug
`)
    .action(async (options) => {
    const debug = options.debug || process.env.DEBUG === "true";
    logo();
    header("Magic AI Assistant");
    info("Connecting to agent...");
    const spinner = ora("Initializing connection").start();
    // Build WebSocket URL with party headers embedded
    // The agents SDK expects: /parties/{namespace}/{room} or /agents/{namespace}/{room}
    const wsUrl = `wss://${AGENT_HOST}/agents/magic-agent/default`;
    if (debug) {
        console.log(chalk.dim(`\n[DEBUG] Connecting to: ${wsUrl}`));
    }
    const ws = new WebSocket(wsUrl, {
        headers: {
            "x-partykit-namespace": "magic-agent",
            "x-partykit-room": "default",
        },
    });
    // Connection timeout
    const connectionTimeout = setTimeout(() => {
        if (ws.readyState !== WebSocket.OPEN) {
            spinner.fail("Connection timeout - agent not responding");
            ws.terminate();
            process.exit(1);
        }
    }, 10000);
    ws.on("open", () => {
        clearTimeout(connectionTimeout);
        spinner.succeed("Connected to Magic AI Assistant");
        if (debug) {
            console.log(chalk.dim("[DEBUG] WebSocket connection established"));
        }
        startChatLoop(ws, debug);
    });
    ws.on("close", (code, reason) => {
        clearTimeout(connectionTimeout);
        const reasonStr = sanitize(reason?.toString() || "Connection closed");
        if (debug) {
            console.log(chalk.dim(`\n[DEBUG] WebSocket closed: ${code} - ${reasonStr}`));
        }
        if (code !== 1000) {
            // 1000 = normal closure
            spinner.fail(`Disconnected from agent (${code})`);
        }
        process.exit(0);
    });
    ws.on("error", (err) => {
        clearTimeout(connectionTimeout);
        spinner.fail(`Connection error: ${sanitize(err.message)}`);
        if (debug) {
            console.error(chalk.red(`\n[DEBUG] WebSocket error:`), sanitize(err.toString()));
        }
        process.exit(1);
    });
});
async function startChatLoop(ws, debug) {
    console.log(chalk.dim("\nType your message below (type 'exit' to quit)"));
    // Track if we're waiting for a response
    let waitingForResponse = false;
    let currentResponse = "";
    let responseSpinner = null;
    let resolveResponse = null;
    // Handle incoming messages
    ws.on("message", (data) => {
        try {
            const raw = data.toString();
            const message = JSON.parse(raw);
            if (debug) {
                console.log(chalk.dim(`\n[DEBUG] Received: ${sanitize(message.type || "unknown")}`));
                console.log(chalk.dim(`[DEBUG] Raw: ${sanitize(raw.substring(0, 200))}...`));
            }
            // Handle different message types
            switch (message.type) {
                case "chat_start":
                    if (debug) {
                        console.log(chalk.dim(`[DEBUG] Using model: ${sanitize(message.model || "unknown")}`));
                    }
                    break;
                case "chat_chunk":
                    if (message.content) {
                        currentResponse += message.content;
                        if (responseSpinner) {
                            // Show last line of response in spinner
                            const lastLine = currentResponse.split("\n").pop() || "...";
                            const sanitizedLine = sanitize(lastLine);
                            responseSpinner.text = chalk.gray(sanitizedLine.length > 60
                                ? sanitizedLine.slice(-60) + "..."
                                : sanitizedLine);
                        }
                    }
                    break;
                case "chat_done":
                    if (responseSpinner) {
                        responseSpinner.stop();
                    }
                    if (currentResponse) {
                        console.log(chalk.green("\nMagic AI:"), sanitize(currentResponse));
                    }
                    else {
                        console.log(chalk.yellow("\nMagic AI: (No response received)"));
                    }
                    if (message.suggestedTemplate) {
                        console.log(chalk.yellow("\nSuggested Template:"), chalk.bold(sanitize(message.suggestedTemplate)));
                        console.log(chalk.dim(`Run 'magicappdev init --template ${sanitize(message.suggestedTemplate)}' to use it.`));
                    }
                    console.log(""); // Spacing
                    // Reset state and resolve promise
                    currentResponse = "";
                    waitingForResponse = false;
                    if (resolveResponse) {
                        resolveResponse();
                        resolveResponse = null;
                    }
                    break;
                case "error":
                    if (responseSpinner) {
                        const errorMsg = sanitize(message.error || message.message || "Unknown error");
                        responseSpinner.fail(`Error: ${errorMsg}`);
                    }
                    currentResponse = "";
                    waitingForResponse = false;
                    if (resolveResponse) {
                        resolveResponse();
                        resolveResponse = null;
                    }
                    break;
                case "state:update":
                case "cf_agent_state":
                    // Ignore state updates from agents SDK
                    break;
                default:
                    if (debug) {
                        console.log(chalk.dim(`[DEBUG] Ignored message type: ${sanitize(message.type)}`));
                    }
            }
        }
        catch (err) {
            if (debug) {
                console.error(chalk.red("[DEBUG] Parse error:"), sanitize(err?.toString() || "Unknown"));
            }
        }
    });
    // Main chat loop
    while (ws.readyState === WebSocket.OPEN) {
        const response = await prompts({
            type: "text",
            name: "message",
            message: chalk.cyan("You:"),
        }, { onCancel });
        // Handle Ctrl+C or empty input
        if (!response.message) {
            console.log(chalk.dim("\nGoodbye!"));
            ws.close(1000, "User exit");
            break;
        }
        if (response.message.toLowerCase() === "exit") {
            console.log(chalk.dim("\nGoodbye!"));
            ws.close(1000, "User exit");
            break;
        }
        // Send message
        waitingForResponse = true;
        currentResponse = "";
        responseSpinner = ora("Magic AI is thinking...").start();
        ws.send(JSON.stringify({
            type: "chat",
            content: response.message,
        }));
        // Wait for response to complete
        await new Promise(resolve => {
            resolveResponse = resolve;
            // Timeout for response
            const responseTimeout = setTimeout(() => {
                if (waitingForResponse) {
                    if (responseSpinner) {
                        responseSpinner.fail("Response timeout");
                    }
                    waitingForResponse = false;
                    resolve();
                }
            }, 60000); // 60 second timeout for AI response
            // Clean up timeout when resolved
            const originalResolve = resolveResponse;
            resolveResponse = () => {
                clearTimeout(responseTimeout);
                originalResolve();
            };
        });
    }
}
