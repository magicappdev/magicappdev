/**
 * Doctor command - Diagnose project issues
 */

import {
  header,
  success,
  error,
  warn,
  info,
  newline,
  divider,
} from "../lib/ui";
import { createSpinner } from "../lib/spinner";
import { Command } from "commander";
import * as path from "node:path";
import * as fs from "node:fs";
import { execa } from "execa";

interface DoctorCheck {
  name: string;
  status: "pass" | "warn" | "fail";
  message: string;
  fix?: string;
}

export const doctorCommand = new Command("doctor")
  .description("Diagnose project issues and check environment")
  .option("--fix", "Attempt to fix issues automatically")
  .action(async (options: { fix?: boolean }) => {
    header("Project Diagnostics");

    const checks: DoctorCheck[] = [];

    // Check Node.js version
    const spinner = createSpinner("Checking environment...").start();

    try {
      const nodeVersion = process.version;
      const majorVersion = parseInt(nodeVersion.slice(1).split(".")[0]);

      if (majorVersion >= 18) {
        checks.push({
          name: "Node.js",
          status: "pass",
          message: `Version ${nodeVersion}`,
        });
      } else {
        checks.push({
          name: "Node.js",
          status: "warn",
          message: `Version ${nodeVersion} (recommend 18+)`,
          fix: "nvm install 20",
        });
      }
    } catch {
      checks.push({
        name: "Node.js",
        status: "fail",
        message: "Could not determine version",
      });
    }

    // Check npm/pnpm
    try {
      const { stdout: npmVersion } = await execa("npm", ["--version"]);
      checks.push({
        name: "npm",
        status: "pass",
        message: `Version ${npmVersion.trim()}`,
      });
    } catch {
      checks.push({
        name: "npm",
        status: "fail",
        message: "Not found",
      });
    }

    // Check pnpm
    try {
      const { stdout: pnpmVersion } = await execa("pnpm", ["--version"]);
      checks.push({
        name: "pnpm",
        status: "pass",
        message: `Version ${pnpmVersion.trim()}`,
      });
    } catch {
      checks.push({
        name: "pnpm",
        status: "warn",
        message: "Not found (optional)",
        fix: "npm install -g pnpm",
      });
    }

    // Check git
    try {
      const { stdout: gitVersion } = await execa("git", ["--version"]);
      checks.push({
        name: "Git",
        status: "pass",
        message: gitVersion.trim(),
      });
    } catch {
      checks.push({
        name: "Git",
        status: "fail",
        message: "Not found",
      });
    }

    // Check for package.json in current directory
    const packageJsonPath = path.join(process.cwd(), "package.json");
    if (fs.existsSync(packageJsonPath)) {
      try {
        const packageJson = JSON.parse(
          fs.readFileSync(packageJsonPath, "utf-8"),
        );
        checks.push({
          name: "package.json",
          status: "pass",
          message: `Found (${packageJson.name || "unnamed"})`,
        });
      } catch {
        checks.push({
          name: "package.json",
          status: "warn",
          message: "Found but could not parse",
        });
      }
    } else {
      checks.push({
        name: "package.json",
        status: "warn",
        message: "Not found in current directory",
      });
    }

    // Check for node_modules
    const nodeModulesPath = path.join(process.cwd(), "node_modules");
    if (fs.existsSync(nodeModulesPath)) {
      checks.push({
        name: "node_modules",
        status: "pass",
        message: "Dependencies installed",
      });
    } else {
      checks.push({
        name: "node_modules",
        status: "warn",
        message: "Not found - run npm install",
        fix: "npm install",
      });
    }

    spinner.stop();

    // Display results
    newline();
    divider();

    let hasWarnings = false;
    let hasErrors = false;

    for (const check of checks) {
      if (check.status === "pass") {
        success(`${check.name}: ${check.message}`);
      } else if (check.status === "warn") {
        warn(`${check.name}: ${check.message}`);
        hasWarnings = true;
        if (check.fix) {
          info(`  Fix: ${check.fix}`);
        }
      } else {
        error(`${check.name}: ${check.message}`);
        hasErrors = true;
        if (check.fix) {
          info(`  Fix: ${check.fix}`);
        }
      }
    }

    divider();
    newline();

    if (hasErrors) {
      error("Some checks failed. Please fix the issues above.");
      process.exit(1);
    } else if (hasWarnings) {
      warn("Some checks have warnings. Consider addressing them.");
    } else {
      success("All checks passed! Your environment is ready.");
    }

    newline();
  });
