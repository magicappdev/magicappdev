/**
 * Built-in template definitions
 */

import { buttonComponentTemplate } from "./button-component.js";
import { blankAppTemplate } from "./blank-app.js";
import { tabsAppTemplate } from "./tabs-app.js";
import { screenTemplate } from "./screen.js";

/** All built-in templates */
export const builtInTemplates = [
  blankAppTemplate,
  tabsAppTemplate,
  buttonComponentTemplate,
  screenTemplate,
];

/** Export individual templates */
export {
  blankAppTemplate,
  buttonComponentTemplate,
  tabsAppTemplate,
  screenTemplate,
};
