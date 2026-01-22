/**
 * Auth commands - Login and logout
 */

import { header, logo, success, error, info, command } from "../lib/ui.js";
import { saveConfig, loadConfig } from "../lib/config.js";
import type { AddressInfo } from "net";
import { api } from "../lib/api.js";
import { Command } from "commander";
import open from "open";
import http from "http";

export const authCommand = new Command("auth").description(
  "Authentication commands",
);

authCommand
  .command("login")
  .description("Login to MagicAppDev using GitHub")
  .action(async () => {
    logo();
    header("Authentication");

    info("Opening GitHub login in your browser...");

    // Setup local callback server
    const server = http.createServer(async (req, res) => {
      const url = new URL(req.url!, `http://${req.headers.host}`);
      const accessToken = url.searchParams.get("accessToken");
      const refreshToken = url.searchParams.get("refreshToken");

      if (accessToken && refreshToken) {
        // Store tokens
        await saveConfig({ accessToken, refreshToken });
        api.setToken(accessToken);

        info(`Access Token received and saved`);

        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(
          "<h1>Login Successful!</h1><p>You can close this window now.</p>",
        );

        success("Successfully logged in!");
        process.exit(0);
      } else {
        res.writeHead(400);
        res.end("Login failed: Missing tokens");
      }
    });

    server.listen(0, async () => {
      const address = server.address() as AddressInfo;
      const port = address.port;
      const redirectUri = `http://localhost:${port}`;

      const loginUrl =
        api.getGitHubLoginUrl("mobile") +
        `&redirect_uri=${encodeURIComponent(redirectUri)}`;

      await open(loginUrl);
      info(`If the browser didn't open, visit: ${loginUrl}`);
    });
  });

authCommand
  .command("whoami")
  .description("Show current user")
  .action(async () => {
    try {
      const config = await loadConfig();
      if (!config.accessToken) {
        throw new Error("No token found");
      }
      api.setToken(config.accessToken);
      const user = await api.getCurrentUser();
      success(`Logged in as: ${user.name} (${user.email})`);
    } catch {
      error("Not logged in or session expired.");
      command("magicappdev auth login");
    }
  });
