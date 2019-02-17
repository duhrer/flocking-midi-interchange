/* eslint-env node */
// The main file that is included when you run `require("flocking-midi-interchange")`.
"use strict";
var fluid = require("infusion");

// Register our content so it can be used with calls like fluid.module.resolvePath("%flocking-midi-interchange/path/to/content.js");
fluid.module.register("flocking-midi-interchange", __dirname, require);
