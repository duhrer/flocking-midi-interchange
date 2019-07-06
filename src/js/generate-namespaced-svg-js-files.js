/*

    Generate a javascript "wrapper" for all SVG images found in `./src/images/`, and save them to the `dist` directory.

 */
"use strict";
var fluid = require("infusion");
var flock = fluid.registerNamespace("flock");

var fs = require("fs");
var path = require("path");
var mkdirp = require("mkdirp");

require("../../");

fluid.registerNamespace("flock.midi.interchange");

flock.midi.interchange.wrapSvgFiles = function (that) {
    var resolvedOutputPath = fluid.module.resolvePath(that.options.outputDir);
    mkdirp.sync(resolvedOutputPath);

    fluid.each(that.options.inputDirs, function (inputDir) {
        var resolvedInputPath = fluid.module.resolvePath(inputDir);
        var inputFiles = fs.readdirSync(resolvedInputPath);

        fluid.log("Processing " + inputFiles.length + " files in " + resolvedInputPath);
        fluid.each(inputFiles, function (inputFile) {
            fluid.log("Processing file " + inputFile);
            var filePatternMatches = inputFile.match(/^(.+)\.svg$/i);
            if (filePatternMatches) {
                var filenameMinusExtension = filePatternMatches[1];
                var name = "flock.midi.interchange.svg." + filenameMinusExtension;
                var fullInputPath = path.resolve(resolvedInputPath, inputFile);
                var payload = fs.readFileSync(fullInputPath, { encoding: "utf8"});
                var fullOutputPath = path.resolve(resolvedOutputPath, "svg-" + filenameMinusExtension + ".js");
                var jsContent = fluid.stringTemplate(that.options.codeTemplate, {
                    name: name,
                    payload: JSON.stringify(payload)
                });
                fs.writeFileSync(fullOutputPath, jsContent);
                fluid.log("Saved to JS file " + fullOutputPath);
            }
            else {
                fluid.log("Skipping non-SVG file.");
            }
        });
    });
};

fluid.defaults("flock.midi.interchange.svgJsFileGenerator", {
    gradeNames: ["fluid.component"],
    inputDirs: ["%flocking-midi-interchange/src/images", "%flocking-midi-interchange/dist"],
    outputDir: "%flocking-midi-interchange/dist",
    codeTemplate: "/* globals fluid */\n(function (fluid) {\n\tvar flock = fluid.registerNamespace(\"flock\");\n\tfluid.registerNamespace(\"flock.midi.interchange.svg\");\n\t%name = %payload;\n})(fluid);\n",
    listeners: {
        "onCreate.wrapSvgFiles": {
            funcName: "flock.midi.interchange.wrapSvgFiles",
            args: ["{that}"]
        }
    }
});

flock.midi.interchange.svgJsFileGenerator();
