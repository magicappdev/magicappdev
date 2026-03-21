/**
 * Built-in template definitions
 */

import { blankAppTemplate } from "./blank-app.js";
import { buttonComponentTemplate } from "./button-component.js";
import { contextTemplate } from "./context.js";
import { hookTemplate } from "./hook.js";
import { ionicAppTemplate } from "./ionic-app.js";
import { pageTemplate } from "./page.js";
import { screenTemplate } from "./screen.js";
import { serviceTemplate } from "./service.js";
import { tabsAppTemplate } from "./tabs-app.js";

/** All built-in templates */
export const builtInTemplates = [
  blankAppTemplate,
  tabsAppTemplate,
  ionicAppTemplate,
  buttonComponentTemplate,
  screenTemplate,
  hookTemplate,
  pageTemplate,
  serviceTemplate,
  contextTemplate,
];

/** Export individual templates */
export {
  blankAppTemplate, buttonComponentTemplate, contextTemplate, hookTemplate, ionicAppTemplate, pageTemplate, screenTemplate, serviceTemplate, tabsAppTemplate
};

