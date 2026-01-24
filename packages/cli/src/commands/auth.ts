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

      // Ignore favicon and other non-callback requests
      if (url.pathname !== "/" || req.method !== "GET") {
        res.writeHead(204);
        res.end();
        return;
      }

      const accessToken = url.searchParams.get("accessToken");
      const refreshToken = url.searchParams.get("refreshToken");

      // If no tokens yet, this is just the initial browser request - wait for callback
      if (!accessToken && !refreshToken) {
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(
          "<h1>Authenticating...</h1><p>Please complete the GitHub login in the popup.</p>",
        );
        return;
      }

      // Validate accessToken is JWT format (basic check)
      const isValidJwt = (token: string) =>
        typeof token === "string" &&
        token.split(".").length === 3 &&
        token.length > 20 &&
        token.length < 2000;

      // Validate refreshToken is UUID format
      const isValidUuid = (token: string) =>
        typeof token === "string" &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          token,
        );

      if (isValidJwt(accessToken!) && isValidUuid(refreshToken!)) {
        // Store tokens
        await saveConfig({
          accessToken: accessToken!,
          refreshToken: refreshToken!,
        });
        api.setToken(accessToken!);

        info(`Access Token received and saved`);

        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(
          "<h1>Login Successful!</h1><p>You can close this window now.</p>",
        );

        success("Successfully logged in!");
        process.exit(0);
      } else {
        error("Login failed: Invalid token format received");
        res.writeHead(400, { "Content-Type": "text/html" });
        res.end("<h1>Login Failed</h1><p>Invalid token format received.</p>");
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
