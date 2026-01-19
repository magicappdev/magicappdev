#!/usr/bin/env node

import { run } from "../dist/cli.js";

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
