/**
 * Chat command - Interactive AI App Builder
 * Uses AgentClient from agents SDK for proper connection
 */

import { header, logo, info } from "../lib/ui.js";
import { AGENT_HOST } from "../lib/api.js";
import { Command } from "commander";
import prompts from "prompts";
import { AgentClient } from "agents/client";
import chalk from "chalk";
import ora from "ora";

interface AgentMessage {
  type: string;
  content?: string;
  suggestedTemplate?: string;
  error?: string;
}

// Handle Ctrl+C in prompts
const onCancel = () => {
  console.log(chalk.dim("\nGoodbye!"));
  process.exit(0);
};

export const chatCommand = new Command("chat")
  .description("Chat with the Magic AI App Builder")
  .option("-d, --debug", "Enable debug logging")
  .action(async options => {
    const debug = options.debug || process.env.DEBUG === "true";

    logo();
    header("Magic AI Assistant");

    info("Connecting to agent...");
    const spinner = ora("Initializing connection").start();

    // Parse host without protocol
    const host = AGENT_HOST.replace(/^wss?:\/\//, "").replace(/^https?:\/\//, "");

    if (debug) {
      console.log(chalk.dim(`\n[DEBUG] Connecting to host: ${host}`));
      console.log(chalk.dim(`[DEBUG] Agent: MagicAgent, Room: default`));
    }

    // Use AgentClient for proper connection with headers
    const client = new AgentClient({
      host,
      agent: "MagicAgent",
      name: "default",
    });

    // Connection timeout
    const connectionTimeout = setTimeout(() => {
      if (client.readyState !== WebSocket.OPEN) {
        spinner.fail("Connection timeout - agent not responding");
        client.close();
        process.exit(1);
      }
    }, 10000);

    client.addEventListener("open", () => {
      clearTimeout(connectionTimeout);
      spinner.succeed("Connected to Magic AI Assistant");
      if (debug) {
        console.log(chalk.dim("[DEBUG] WebSocket connection established"));
      }
      startChatLoop(client, debug);
    });

    client.addEventListener("close", event => {
      clearTimeout(connectionTimeout);
      if (debug) {
        console.log(
          chalk.dim(`\n[DEBUG] WebSocket closed: ${event.code} - ${event.reason}`),
        );
      }
      if (event.code !== 1000) {
        // 1000 = normal closure
        spinner.fail(`Disconnected from agent (${event.code})`);
      }
      process.exit(0);
    });

    client.addEventListener("error", (err: Event) => {
      clearTimeout(connectionTimeout);
      spinner.fail(`Connection error`);
      if (debug) {
        console.error(chalk.red(`\n[DEBUG] WebSocket error:`), err);
      }
      process.exit(1);
    });
  });

async function startChatLoop(client: AgentClient, debug: boolean) {
  console.log(chalk.dim("\nType your message below (type 'exit' to quit)"));

  // Track if we're waiting for a response
  let waitingForResponse = false;
  let currentResponse = "";
  let responseSpinner: ReturnType<typeof ora> | null = null;
  let resolveResponse: (() => void) | null = null;

  // Handle incoming messages
  client.addEventListener("message", (event: MessageEvent) => {
    try {
      const message: AgentMessage = JSON.parse(
        typeof event.data === "string" ? event.data : event.data.toString(),
      );

      if (debug) {
        console.log(chalk.dim(`\n[DEBUG] Received: ${message.type}`));
      }

      if (message.type === "chat_chunk" && message.content) {
        currentResponse += message.content;
        if (responseSpinner) {
          responseSpinner.text = chalk.gray(
            currentResponse.split("\n").pop() || "...",
          );
        }
      } else if (message.type === "chat_done") {
        if (responseSpinner) {
          responseSpinner.stop();
        }
        console.log(chalk.green("\nMagic AI:"), currentResponse);

        if (message.suggestedTemplate) {
          console.log(
            chalk.yellow("\nSuggested Template:"),
            chalk.bold(message.suggestedTemplate),
          );
          console.log(
            chalk.dim(
              `Run 'magicappdev init --template ${message.suggestedTemplate}' to use it.`,
            ),
          );
        }
        console.log(""); // Spacing

        // Reset state and resolve promise
        currentResponse = "";
        waitingForResponse = false;
        if (resolveResponse) {
          resolveResponse();
          resolveResponse = null;
        }
      } else if (message.type === "error") {
        if (responseSpinner) {
          responseSpinner.fail(`Error: ${message.error || "Unknown error"}`);
        }
        currentResponse = "";
        waitingForResponse = false;
        if (resolveResponse) {
          resolveResponse();
          resolveResponse = null;
        }
      }
    } catch (err) {
      if (debug) {
        console.error(chalk.red("[DEBUG] Parse error:"), err);
      }
    }
  });

  // Main chat loop
  while (client.readyState === WebSocket.OPEN) {
    const response = await prompts(
      {
        type: "text",
        name: "message",
        message: chalk.cyan("You:"),
      },
      { onCancel },
    );

    // Handle Ctrl+C or empty input
    if (!response.message) {
      console.log(chalk.dim("\nGoodbye!"));
      client.close();
      break;
    }

    if (response.message.toLowerCase() === "exit") {
      console.log(chalk.dim("\nGoodbye!"));
      client.close();
      break;
    }

    // Send message
    waitingForResponse = true;
    currentResponse = "";
    responseSpinner = ora("Magic AI is thinking...").start();

    client.send(
      JSON.stringify({
        type: "chat",
        content: response.message,
      }),
    );

    // Wait for response to complete
    await new Promise<void>(resolve => {
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
