/**
 * Completions command - Generate shell completion scripts
 */

import { success, error, info, newline } from "../lib/ui.js";
import * as fs from "node:fs/promises";
import { Command } from "commander";
import * as path from "node:path";

interface CompletionOptions {
  print?: boolean;
  install?: boolean;
}

export const completionsCommand = new Command("completions")
  .description("Generate shell completion script")
  .argument("<shell>", "Shell type (bash, zsh, fish, pwsh)")
  .option("-p, --print", "Print completion script to stdout", false)
  .option("-i, --install", "Attempt to install completion script", false)
  .action(async (shell: string, options: CompletionOptions) => {
    try {
      const program = completionsCommand.parent;
      if (!program) {
        throw new Error("Unable to get program configuration");
      }

      const script = generateCompletionScript(shell, program);
      const shouldPrint = options.print || (!options.install && !options.print);

      if (shouldPrint) {
        console.log(script);
        if (!options.print) {
          newline();
          info("To install completions, add the above to your shell config:");
          printInstallInstructions(shell);
          newline();
        }
      } else if (options.install) {
        await installCompletionScript(shell, script);
      }

      if (!shouldPrint || options.print) {
        success(`Completion script generated for ${shell}`);
      }
    } catch (err) {
      error(`Failed to generate completions: ${(err as Error).message}`);
      process.exit(1);
    }
  });

function generateCompletionScript(shell: string, program: Command): string {
  switch (shell.toLowerCase()) {
    case "bash":
      return generateBashCompletion(program);
    case "zsh":
      return generateZshCompletion(program);
    case "fish":
      return generateFishCompletion(program);
    case "pwsh":
      return generatePwshCompletion(program);
    default:
      throw new Error(
        `Unsupported shell: ${shell}. Supported: bash, zsh, fish, pwsh`,
      );
  }
}

function generateBashCompletion(program: Command): string {
  const commands = program.commands.map(cmd => cmd.name()).join(" ");

  return `# Bash completion for magicappdev
_magicappdev_completion() {
    local cur prev words cword
    _init_completion || return

    COMPREPLY=($(compgen -W "${commands} --help --version" -- "\${cur}"))
}

complete -F _magicappdev_completion magicappdev mad createmagicapp
`;
}

function generateZshCompletion(program: Command): string {
  const commandDescriptions = program.commands
    .map(cmd => `"${cmd.name()}":"${cmd.description()}"`)
    .join("\n  ");

  return `#compdef magicappdev mad createmagicapp

_magicappdev() {
  local -a commands
  commands=(
    ${commandDescriptions}
  )

  if (( CURRENT == 2 )); then
    _describe 'command' commands
  fi
}

_magicappdev "$@"
`;
}

function generateFishCompletion(program: Command): string {
  const commands = program.commands.map(cmd => cmd.name()).join(" ");

  return `# Fish completion for magicappdev

complete -c magicappdev -f
complete -c mad -f
complete -c createmagicapp -f

complete -c magicappdev -a '${commands}' -d 'MagicAppDev command'
complete -c mad -a '${commands}' -d 'MagicAppDev command'
complete -c createmagicapp -a '${commands}' -d 'MagicAppDev command'
`;
}

function generatePwshCompletion(program: Command): string {
  const commands = program.commands.map(cmd => cmd.name());

  return `# PowerShell completion for magicappdev

using namespace System.Management.Automation
using namespace System.Management.Automation.Language

Register-ArgumentCompleter -Native -CommandName 'magicappdev', 'mad', 'createmagicapp' -ScriptBlock {
    param($wordToComplete, $commandAst, $cursorPosition)

    $commands = @(${commands.map(c => `'${c}'`).join(", ")})

    $commandElements = $commandAst.CommandElements
    $command = if ($commandElements.Count -gt 1) { $commandElements[1].Extent.Text } else { '' }

    if ($wordToComplete -like '-*') {
        @('--help', '--version') | Where-Object { $_ -like "$wordToComplete*" }
    } else {
        $commands | Where-Object { $_ -like "$wordToComplete*" }
    }
}
`;
}

async function installCompletionScript(
  shell: string,
  script: string,
): Promise<void> {
  const home = process.env.HOME || process.env.USERPROFILE;
  if (!home) {
    throw new Error("Unable to determine home directory");
  }

  let configPath: string;
  switch (shell.toLowerCase()) {
    case "bash":
      configPath = path.join(home, ".bashrc");
      break;
    case "zsh":
      configPath = path.join(home, ".zshrc");
      break;
    case "fish":
      configPath = path.join(
        home,
        ".config",
        "fish",
        "completions",
        "magicappdev.fish",
      );
      break;
    case "pwsh":
      configPath = path.join(
        home,
        ".config",
        "powershell",
        "MagicAppDev_completions.ps1",
      );
      break;
    default:
      throw new Error(`Unable to determine config file for shell: ${shell}`);
  }

  // For fish, create the completion file directly
  if (shell.toLowerCase() === "fish") {
    await fs.mkdir(path.dirname(configPath), { recursive: true });
    await fs.writeFile(configPath, script);
    success(`Completion script installed to ${configPath}`);
    info("Restart your shell for completions to take effect");
    return;
  }

  // For other shells, append to config
  try {
    await fs.appendFile(
      configPath,
      `\n\n# MagicAppDev CLI completions\n${script}\n`,
    );
    success(`Completion script added to ${configPath}`);
    info("Restart your shell for completions to take effect");
  } catch (err) {
    error(`Failed to install: ${(err as Error).message}`);
    info("You can manually add the script to your shell config");
  }
}

function printInstallInstructions(shell: string): void {
  switch (shell.toLowerCase()) {
    case "bash":
      info('  echo "$(magicappdev completions bash)" >> ~/.bashrc');
      info("  source ~/.bashrc");
      break;
    case "zsh":
      info('  echo "$(magicappdev completions zsh)" >> ~/.zshrc');
      info("  source ~/.zshrc");
      break;
    case "fish":
      info(
        "  magicappdev completions fish > ~/.config/fish/completions/magicappdev.fish",
      );
      break;
    case "pwsh":
      info("  magicappdev completions pwsh > $PROFILE");
      break;
  }
}
