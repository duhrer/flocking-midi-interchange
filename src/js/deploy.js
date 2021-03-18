// TODO: Discuss reconciling this with the docpad and fluid-sandbox approaches and generalising for reuse.
/* eslint-env node */
"use strict";
var fluid = require("infusion");
fluid.setLogging(true);

var flock = fluid.registerNamespace("flock");

var path = require("path");

var copy = require("recursive-copy");
var fs = require("fs");
var mkdirp = require("mkdirp");
var rimraf = require("rimraf");

fluid.registerNamespace("flock.midi.interchange.generator");

flock.midi.interchange.generator.makeBundle = function (that) {
    var resolvedBasePath = fluid.module.resolvePath(that.options.baseDir);
    var promises = [];

    if (fs.existsSync(that.options.targetDir)) {
        promises.push(function () {
            var existingDirCleanPromise = fluid.promise();
            rimraf(that.options.targetDir, function (error) {
                if (error) {
                    existingDirCleanPromise.reject(error);
                }
                else {
                    existingDirCleanPromise.resolve();
                }
            });

            return existingDirCleanPromise;
        });
    }

    promises.push(function () {
        var dirCreationPromise = fluid.promise();
        mkdirp(that.options.targetDir, function (error) {
            if (error) {
                dirCreationPromise.reject(error);
            }
            else {
                dirCreationPromise.resolve();
            }
        });
        return dirCreationPromise;
    });

    fluid.each(fluid.makeArray(that.options.bundle), function (singleItemPath) {
        var itemSrcPath = path.resolve(resolvedBasePath, singleItemPath);
        var itemDestPath = path.resolve(that.options.targetDir, singleItemPath);

        // Return a promise-returning function so that only one call will be in flight at a time.
        promises.push(function () {
            return copy(itemSrcPath, itemDestPath);
        });
    });

    var sequence = fluid.promise.sequence(promises);

    sequence.then(
        function () { fluid.log("Finished, output saved to '", that.options.targetDir, "'..."); },
        fluid.fail
    );

    return sequence;
};

fluid.defaults("flock.midi.interchange.generator", {
    gradeNames: ["fluid.component"],
    baseDir: "%flocking-midi-interchange",
    targetDir: "/Users/duhrer/Source/projects/duhrer.github.io/demos/flocking-midi-interchange",
    bundle: [
        "./index.html",
        "./src",
        "./demos",
        "./dist",
        "./node_modules/bergson/dist/bergson-only.js",
        "./node_modules/flocking-midi/src/connection.js",
        "./node_modules/flocking-midi/src/controller.js",
        "./node_modules/flocking-midi/src/core.js",
        "./node_modules/flocking-midi/src/receiver.js",
        "./node_modules/flocking-midi/src/system.js",
        "./node_modules/flocking-midi/src/ui/connector-view/js/connector-view.js",
        "./node_modules/flocking-midi/src/ui/message-monitor-view/js/message-monitor-view.js",
        "./node_modules/flocking-midi/src/ui/port-selector/js/port-select-box.js",
        "./node_modules/flocking-midi/src/ui/port-selector/js/port-selector.js",
        "./node_modules/infusion/dist/infusion-all.js"
    ],
    listeners: {
        "onCreate.createBundle": {
            funcName: "flock.midi.interchange.generator.makeBundle",
            args:     ["{that}"]
        }
    }
});

flock.midi.interchange.generator();
