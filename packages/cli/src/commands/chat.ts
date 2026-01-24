/**
 * Chat command - Interactive AI App Builder
 * Uses native WebSocket for cross-platform compatibility
 */

import { header, logo, info } from "../lib/ui.js";
import { AGENT_HOST } from "../lib/api.js";
import { Command } from "commander";
import prompts from "prompts";
import WebSocket from "ws";
import chalk from "chalk";
import ora from "ora";

interface AgentMessage {
  type: string;
  content?: string;
  suggestedTemplate?: string;
  error?: string;
}

export const chatCommand = new Command("chat")
  .description("Chat with the Magic AI App Builder")
  .option("-d, --debug", "Enable debug logging")
  .action(async options => {
    const debug = options.debug || process.env.DEBUG === "true";

    logo();
    header("Magic AI Assistant");

    info("Connecting to agent...");
    const spinner = ora("Initializing connection").start();

    // Build WebSocket URL for the agent
    const wsUrl = `wss://${AGENT_HOST}/agents/magic-agent/default`;

    if (debug) {
      console.log(chalk.dim(`\n[DEBUG] Connecting to: ${wsUrl}`));
    }

    const ws = new WebSocket(wsUrl);

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
      const reasonStr = reason.toString() || "Connection closed";
      if (debug) {
        console.log(
          chalk.dim(`\n[DEBUG] WebSocket closed: ${code} - ${reasonStr}`),
        );
      }
      if (code !== 1000) {
        // 1000 = normal closure
        spinner.fail(`Disconnected from agent (${code})`);
      }
      process.exit(0);
    });

    ws.on("error", (err: Error) => {
      clearTimeout(connectionTimeout);
      spinner.fail(`Connection error: ${err.message}`);
      if (debug) {
        console.error(chalk.red(`\n[DEBUG] WebSocket error:`), err);
      }
      process.exit(1);
    });
  });

async function startChatLoop(ws: WebSocket, debug: boolean) {
  console.log(chalk.dim("\nType your message below (type 'exit' to quit)"));

  // Track if we're waiting for a response
  let waitingForResponse = false;
  let currentResponse = "";
  let responseSpinner: ReturnType<typeof ora> | null = null;
  let resolveResponse: (() => void) | null = null;

  // Handle incoming messages
  ws.on("message", (data: WebSocket.Data) => {
    try {
      const message: AgentMessage = JSON.parse(data.toString());

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
  while (ws.readyState === WebSocket.OPEN) {
    const response = await prompts({
      type: "text",
      name: "message",
      message: chalk.cyan("You:"),
    });

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

    ws.send(
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
