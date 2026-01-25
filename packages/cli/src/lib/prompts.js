/**
 * Interactive prompts for user input
 */
import prompts from "prompts";
import chalk from "chalk";
// Handle Ctrl+C in prompts - exit cleanly
const onCancel = () => {
  console.log(chalk.dim("\nCancelled."));
  process.exit(0);
};
/** Prompt for text input */
export async function promptText(message, options = {}) {
  const response = await prompts(
    {
      type: "text",
      name: "value",
      message,
      initial: options.initial,
      validate: options.validate,
    },
    { onCancel },
  );
  return response.value;
}
/** Prompt for selection from a list */
export async function promptSelect(message, choices, options = {}) {
  const response = await prompts(
    {
      type: "select",
      name: "value",
      message,
      choices,
      initial: options.initial || 0,
    },
    { onCancel },
  );
  return response.value;
}
/** Prompt for multi-selection from a list */
export async function promptMultiSelect(message, choices, options = {}) {
  const response = await prompts(
    {
      type: "multiselect",
      name: "value",
      message,
      choices,
      min: options.min,
      max: options.max,
      hint: "- Space to select. Return to submit",
    },
    { onCancel },
  );
  return response.value || [];
}
/** Prompt for confirmation (yes/no) */
export async function promptConfirm(message, options = {}) {
  const response = await prompts(
    {
      type: "confirm",
      name: "value",
      message,
      initial: options.initial ?? true,
    },
    { onCancel },
  );
  return response.value;
}
/** Prompt for project name with validation */
export async function promptProjectName(initial) {
  return promptText("What is your project name?", {
    initial,
    validate: value => {
      if (!value || value.length < 2) {
        return "Project name must be at least 2 characters";
      }
      if (!/^[a-zA-Z][a-zA-Z0-9-_ ]*$/.test(value)) {
        return "Project name must start with a letter and contain only letters, numbers, hyphens, underscores, and spaces";
      }
      return true;
    },
  });
}
/** Prompt for framework selection */
export async function promptFramework() {
  return promptSelect("Which framework would you like to use?", [
    {
      title: chalk.cyan("Expo") + " (Recommended)",
      value: "expo",
      description: "React Native with Expo",
    },
    {
      title: "React Native (bare)",
      value: "react-native",
      description: "React Native without Expo",
    },
  ]);
}
/** Prompt for additional preferences */
export async function promptPreferences() {
  const preferences = await promptMultiSelect(
    "Select additional preferences:",
    [
      {
        title: "ESLint (code linting)",
        value: "eslint",
        description: "Add ESLint for code quality",
      },
      {
        title: "Prettier (code formatting)",
        value: "prettier",
        description: "Add Prettier for code formatting",
      },
      {
        title: "Jest (testing framework)",
        value: "jest",
        description: "Add Jest for testing",
      },
      {
        title: "TypeScript (recommended)",
        value: "typescript",
        description: "Use TypeScript",
      },
      {
        title: "Tailwind CSS (styling)",
        value: "tailwind",
        description: "Add Tailwind CSS for styling",
      },
    ],
  );
  return preferences.reduce((acc, pref) => {
    acc[pref] = true;
    return acc;
  }, {});
}
/** Prompt for styling selection */
export async function promptStyling(framework) {
  const choices =
    framework === "expo" || framework === "react-native"
      ? [
          {
            title: chalk.cyan("NativeWind") + " (Recommended)",
            value: "nativewind",
            description: "Tailwind CSS for React Native",
          },
          {
            title: "StyleSheet",
            value: "stylesheet",
            description: "React Native default styling",
          },
          {
            title: "Styled Components",
            value: "styled-components",
            description: "CSS-in-JS library",
          },
        ]
      : [
          {
            title: chalk.cyan("Tailwind CSS") + " (Recommended)",
            value: "tailwind",
            description: "Utility-first CSS",
          },
          {
            title: "CSS Modules",
            value: "css-modules",
            description: "Scoped CSS",
          },
          {
            title: "Styled Components",
            value: "styled-components",
            description: "CSS-in-JS library",
          },
        ];
  return promptSelect("Which styling approach would you like to use?", choices);
}
/** Prompt for TypeScript */
export async function promptTypeScript() {
  return promptConfirm("Would you like to use TypeScript?", { initial: true });
}
