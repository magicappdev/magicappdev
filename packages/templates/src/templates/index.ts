/**
 * Built-in template definitions
 */

import { buttonComponentTemplate } from "./button-component.js";
import { blankAppTemplate } from "./blank-app.js";
import { tabsAppTemplate } from "./tabs-app.js";
import { screenTemplate } from "./screen.js";
import { ionicAppTemplate } from "./ionic-app.js";

/** All built-in templates */
export const builtInTemplates = [
  blankAppTemplate,
  tabsAppTemplate,
  ionicAppTemplate,
  buttonComponentTemplate,
  screenTemplate,
];

/** Export individual templates */
export {
  blankAppTemplate,
  tabsAppTemplate,
  ionicAppTemplate,
  buttonComponentTemplate,
  screenTemplate,
};
