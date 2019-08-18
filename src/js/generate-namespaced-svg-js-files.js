/*

    Generate a javascript "wrapper" for all SVG images found in `./src/images/`, and save them to the `dist` directory.

 */
"use strict";
var fluid = require("infusion");
var flock = fluid.registerNamespace("flock");

// From your own project, you should use fluid.require("%flocking-midi-interchange/src/js/svg-generator.js")
require("./svg-generator");

flock.midi.interchange.svgJsFileGenerator();
