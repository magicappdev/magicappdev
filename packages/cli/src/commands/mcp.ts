/**
 * MCP command - Manage and test MCP (Model Context Protocol) server connections
 */

import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import {
  header,
  error,
  success,
  info,
  warn,
  newline,
  divider,
} from "../lib/ui.js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { Command } from "commander";
import chalk from "chalk";
import ora from "ora";

/**
 * Test an MCP server connection by connecting, listing tools, then disconnecting
 */
export const mcpCommand = new Command("mcp")
  .description(
    "Manage and test MCP (Model Context Protocol) server connections",
  )
  .addHelpText(
    "after",
    `
Examples:
  $ magicappdev mcp test https://mcp.example.com/mcp
  $ magicappdev mcp test --name "GitHub" https://mcp.example.com/mcp
  $ magicappdev mcp list
`,
  );

mcpCommand
  .command("test")
  .description("Test connection to an MCP server")
  .argument("<url>", "MCP server URL (HTTP or Streamable HTTP)")
  .option("-n, --name <name>", "Friendly name for the server", "MCP Server")
  .action(async (url: string, options: { name: string }) => {
    header("MCP Server Test");

    info(`Testing MCP server: ${chalk.cyan(url)}`);
    const spinner = ora("Connecting to MCP server...").start();

    const client = new Client({
      name: "MagicAppDev CLI",
      version: "1.0.0",
    });

    let transport: StreamableHTTPClientTransport | null = null;

    try {
      const transportUrl = new URL(url);

      if (
        transportUrl.protocol !== "http:" &&
        transportUrl.protocol !== "https:"
      ) {
        spinner.fail("Only HTTP/HTTPS URLs are supported");
        process.exit(1);
      }

      transport = new StreamableHTTPClientTransport(transportUrl, {
        requestInit: {
          headers: {
            Accept: "application/json, text/event-stream",
          },
        },
      });

      spinner.text = "Initializing MCP protocol handshake...";
      await client.connect(transport);

      spinner.succeed("Connected to MCP server");

      const capabilities = client.getServerCapabilities();

      // List tools
      let toolCount = 0;
      let resourceCount = 0;
      let promptCount = 0;

      try {
        spinner.start("Discovering tools...");
        const toolsResult = await client.listTools();
        toolCount = toolsResult.tools.length;
        spinner.succeed(`Discovered ${toolCount} tool(s)`);

        newline();
        if (toolCount > 0) {
          success("Available tools:");
          const toolsList = toolsResult.tools.slice(0, 15);
          toolsList.forEach(tool => {
            const desc = tool.description
              ? chalk.dim(` — ${tool.description.slice(0, 60)}`)
              : "";
            console.log(
              `  ${chalk.green("✓")} ${chalk.bold(tool.name)}${desc}`,
            );
          });
          if (toolCount > 15) {
            info(`  ... and ${toolCount - 15} more`);
          }
        } else {
          info("No tools exposed by this server.");
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        warn(`Could not list tools: ${msg}`);
      }

      // List resources
      if (capabilities?.resources) {
        try {
          const resourcesResult = await client.listResources();
          resourceCount = resourcesResult.resources.length;
          if (resourceCount > 0) {
            newline();
            success(`Available resources (${resourceCount}):`);
            resourcesResult.resources.slice(0, 10).forEach(resource => {
              console.log(`  ${chalk.blue("◆")} ${resource.uri}`);
            });
            if (resourceCount > 10) {
              info(`  ... and ${resourceCount - 10} more`);
            }
          }
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          warn(`Could not list resources: ${msg}`);
        }
      }

      // List prompts
      if (capabilities?.prompts) {
        try {
          const promptsResult = await client.listPrompts();
          promptCount = promptsResult.prompts.length;
          if (promptCount > 0) {
            newline();
            success(`Available prompts (${promptCount}):`);
            promptsResult.prompts.slice(0, 10).forEach(prompt => {
              console.log(`  ${chalk.magenta("¶")} ${prompt.name}`);
            });
          }
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          warn(`Could not list prompts: ${msg}`);
        }
      }

      const serverInfo = client.getServerVersion();
      newline();
      divider();
      success(`MCP Server: ${chalk.bold(options.name)}`);
      if (serverInfo) {
        info(`  Server: ${serverInfo.name} v${serverInfo.version}`);
      }
      info(`  URL: ${url}`);
      info(`  Tools: ${toolCount}`);
      info(`  Resources: ${resourceCount}`);
      info(`  Prompts: ${promptCount}`);
      info(`  Connection Status: ${chalk.green("healthy")}`);
      divider();
      newline();

      info(
        `This server can be connected to the agent using:\n` +
          `  ${chalk.cyan(`magicappdev chat`)} then use the mcpConnect tool with name="${options.name}" and url="${url}"`,
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      spinner.fail(`Connection failed: ${msg}`);
      error("Troubleshooting:");
      error("  1. Verify the MCP server URL is correct and accessible");
      error("  2. Ensure the server supports Streamable HTTP transport");
      error("  3. Check that the server URL ends with '/mcp' or similar");
      process.exit(1);
    } finally {
      try {
        if (transport) await transport.close();
      } catch {
        // ignore close errors
      }
    }
  });

mcpCommand
  .command("list")
  .description("List known MCP servers from config")
  .action(async () => {
    header("MCP Servers");

    // Read from a local config file for known MCP servers
    const fs = await import("node:fs");
    const path = await import("node:path");
    const configPath = path.join(
      process.cwd(),
      ".well-known",
      "mcp-servers.json",
    );

    if (!fs.existsSync(configPath)) {
      info("No MCP server config found.");
      info(
        `Create ${chalk.cyan(".well-known/mcp-servers.json")} to register servers:`,
      );
      console.log(
        chalk.dim(`{
  "servers": [
    { "name": "GitHub", "url": "https://mcp.example.com/mcp" }
  ]
}`),
      );
      newline();
      return;
    }

    try {
      const configContent = fs.readFileSync(configPath, "utf-8");
      const config = JSON.parse(configContent) as {
        servers?: Array<{ name: string; url: string }>;
      };

      if (!config.servers || config.servers.length === 0) {
        warn("No MCP servers configured.");
        return;
      }

      success(`Found ${config.servers.length} configured MCP server(s):`);
      newline();

      for (const server of config.servers) {
        const spinner = ora(`Checking ${server.name}...`).start();
        const client = new Client({
          name: "MagicAppDev CLI",
          version: "1.0.0",
        });

        try {
          const transport = new StreamableHTTPClientTransport(
            new URL(server.url),
          );
          await client.connect(transport);
          await transport.close();

          const serverInfo = client.getServerVersion();
          spinner.succeed(
            `${chalk.green("✓")} ${chalk.bold(server.name)}` +
              ` — ${serverInfo?.name || "unknown"} — ${chalk.cyan(server.url)}`,
          );
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          spinner.fail(
            `${chalk.red("✗")} ${chalk.bold(server.name)} — ${chalk.dim(msg)}`,
          );
        }
      }
    } catch (err: { code?: string; message?: string } | unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      error(`Failed to parse config: ${msg}`);
      process.exit(1);
    }
  });
