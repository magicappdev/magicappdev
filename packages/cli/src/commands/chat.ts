/**
 * Chat command - Interactive AI App Builder
 */

import { header, logo, info } from "../lib/ui.js";
import { AgentClient } from "agents/client";
import { AGENT_HOST } from "../lib/api.js";
import { Command } from "commander";
import prompts from "prompts";
import chalk from "chalk";
import ora from "ora";

interface AgentEvent {
  message?: string;
}

interface AgentMessageEvent {
  data: string | ArrayBuffer | Blob;
}

export const chatCommand = new Command("chat")
  .description("Chat with the Magic AI App Builder")
  .action(async () => {
    logo();
    header("Magic AI Assistant");

    info("Connecting to agent...");
    const spinner = ora("Initializing connection").start();

    // Initialize Agent Client
    const client = new AgentClient({
      host: AGENT_HOST,
      agent: "magic-agent",
      name: "default",
    });

    client.addEventListener("open", () => {
      spinner.succeed("Connected to Magic AI Assistant");
      startChatLoop(client);
    });

    client.addEventListener("close", () => {
      spinner.fail("Disconnected from agent");
      process.exit(0);
    });

    client.addEventListener("error", (event: AgentEvent) => {
      spinner.fail(`Connection error: ${event.message || "Unknown error"}`);
      process.exit(1);
    });
  });

async function startChatLoop(client: AgentClient) {
  console.log(chalk.dim("\nType your message below (type 'exit' to quit)"));

  while (true) {
    const response = await prompts({
      type: "text",
      name: "message",
      message: chalk.cyan("You:"),
    });

    if (!response.message || response.message.toLowerCase() === "exit") {
      client.close();
      break;
    }

    const spinner = ora("Magic AI is thinking...").start();
    let currentResponse = "";

    const messageHandler = (event: AgentMessageEvent) => {
      try {
        const data = JSON.parse(event.data as string);

        if (data.type === "chat_chunk") {
          currentResponse += data.content;
          spinner.text = chalk.gray(currentResponse.split("\n").pop() || "...");
        } else if (data.type === "chat_done") {
          spinner.stop();
          console.log(chalk.green("\nMagic AI:"), currentResponse);
          if (data.suggestedTemplate) {
            console.log(
              chalk.yellow("\n💡 Suggested Template:"),
              chalk.bold(data.suggestedTemplate),
            );
            console.log(
              chalk.dim(
                `Run 'magicappdev init --template ${data.suggestedTemplate}' to use it.`,
              ),
            );
          }
          console.log(""); // Spacing
          client.removeEventListener("message", messageHandler);
        }
      } catch {
        // Ignore parse errors for chunks
      }
    };

    client.addEventListener("message", messageHandler);

    client.send(
      JSON.stringify({
        type: "chat",
        content: response.message,
      }),
    );

    // Wait for the response to finish before next prompt
    await new Promise<void>(resolve => {
      const doneHandler = (event: AgentMessageEvent) => {
        try {
          const data = JSON.parse(event.data as string);
          if (data.type === "chat_done" || data.type === "error") {
            client.removeEventListener("message", doneHandler);
            resolve();
          }
        } catch {
          // Ignore
        }
      };
      client.addEventListener("message", doneHandler);
    });
  }
}
