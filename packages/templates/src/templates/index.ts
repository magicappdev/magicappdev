/**
 * Built-in template definitions
 */

import { buttonComponentTemplate } from "./button-component.js";
import { cfWorkersApiTemplate } from "./cf-workers-api.js";
import { reactSpaTemplate } from "./react-spa.js";
import { ionicAppTemplate } from "./ionic-app.js";
import { blankAppTemplate } from "./blank-app.js";
import { tabsAppTemplate } from "./tabs-app.js";
import { nextAppTemplate } from "./next-app.js";
import { expoAppTemplate } from "./expo-app.js";
import { screenTemplate } from "./screen.js";

/** All built-in templates */
export const builtInTemplates = [
  blankAppTemplate,
  tabsAppTemplate,
  ionicAppTemplate,
  buttonComponentTemplate,
  screenTemplate,
  reactSpaTemplate,
  nextAppTemplate,
  cfWorkersApiTemplate,
  expoAppTemplate,
];

/** Export individual templates */
export {
  blankAppTemplate,
  tabsAppTemplate,
  ionicAppTemplate,
  buttonComponentTemplate,
  screenTemplate,
  reactSpaTemplate,
  nextAppTemplate,
  cfWorkersApiTemplate,
  expoAppTemplate,
};
