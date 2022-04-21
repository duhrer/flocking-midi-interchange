/*

    Script to generate the core data used by the "keymaster", which consists of:

    1. All unique combinations of 7 keys that form a scale.
    2. All unique variations of sub-combinations, from two keys to 6.

    This will serve as a (hopefully not massive) lookup table for keys.  Here are the base patterns for C (0):

    Major (Ionian):
         0,  2,  4,  5,  7,  9, 11

    Harmonic Major:
         0,  2,  4,  5,  7,  8, 11

    Natural Minor:
        0,  2,  3,  5,  7,  8, 10

    Harmonic Minor:
         0,  2,  3,  5,  7,  8, 11

    The lookup table must allow us to determine which remaining offsets are allowed, including those that would be
    achieved in another scale.

    Let's assume that we had two allowed patterns based on  arrays of similar letters, ["f", "a", "c", "e"] and
    ["f", "a", "d", "e"].   We need to ensure that if "f" is the only letter used so far, "a", "c", "d", and "e" are
    allowed, but that if "f", "a", and "d", are used, only "e" is still allowed.

    The lookup table for that example might look something like:

    ```
    var structure = {
        f: {
            a: {
                c: {
                    e: true
                },
                d: {
                    e: true
                },
                e: {
                    c: true,
                    d: true
                }
            },
            c: {
                a: {
                    e: true
                }
                e: {
                    a: true
                }
            },
            d: {
                a: {
                    e: true
                },
                e: {
                    a: true
                }
            },
            e: {
                a: {
                    c: true,
                    d: true
                },
                c: {
                    a: true
                },
                d: {
                    a: true
                }
            }
        },
        a: {
            // ...
        },
        c: {
            // ...
        },
        d: {
            // ...
        },
        e: {
            // ...
        }
    }
    ```

    Querying for remaining available items in the pattern becomes as simple as examining the level represented by the
    current items.  For example, `structure[f]` is an object with three sub-elements (meaning that we are checking a
    partial pattern).  If we use `Object.keys` on `structure[f]`, the keys let us know that "a", "c", "d", and "e" could
    complete a valid pattern.  (We are assuming that only a letter at a time can be added.)

    If we test ["f", "a", "c", "e"] (or any variation, such as ["c", "a", "f", "e"]), the return value is simply `true`,
    i.e. we have encountered the end of a complete pattern.

 */
"use strict";
var fluid = require("infusion");
var flock = fluid.registerNamespace("flock");

var fs = require("fs");
require("../../index");

fluid.defaults("flock.midi.interchange.keymaster.generator", {
    gradeNames: ["fluid.component"],
    outputPath: "%flocking-midi-interchange/demos/js/keymaster-lookup-c.js",
    javascriptTemplate: "(function (fluid){\n  \"use strict\";\n  var flock = fluid.registerNamespace(\"flock\");\n  fluid.registerNamespace(\"flock.midi.interchange.keymaster\");\n  flock.midi.interchange.keymaster.lookupTable = %json;\n})(fluid);\n",
    scales: {
        major:         [0,  2,  4,  5,  7,  9, 11],
        harmonicMajor: [0,  2,  4,  5,  7,  8, 11],
        naturalMinor:  [0,  2,  3,  5,  7,  8, 10],
        harmonicMinor: [0,  2,  3,  5,  7,  8, 11]
    },
    listeners: {
        "onCreate.generateLookupTable": {
            funcName: "flock.midi.interchange.keymaster.generateLookupTable",
            args: ["{that}"]
        }
    }
});

flock.midi.interchange.keymaster.generateLookupTable = function (that) {
    // The first entry is true so that a deep merge will take place. See: https://api.jquery.com/jquery.extend/
    var toMerge = [true, {}];
    fluid.each(that.options.scales, function (singleScale) {
        var cVariations = flock.midi.interchange.keymaster.generateTree(singleScale);
        toMerge.push(cVariations);

        if (that.options.shiftScales) {
            // Iterate through the remaining scales one half step at a time.
            for (var stepsToShift = 1; stepsToShift < 12; stepsToShift++) {
                var shiftedScale = flock.midi.interchange.keymaster.shiftScale(singleScale, stepsToShift);
                var shiftedVariations = flock.midi.interchange.keymaster.generateTree(shiftedScale);
                toMerge.push(shiftedVariations);
            }
        }
    });
    var combined = fluid.extend.apply(that, toMerge);
    var combinedAsString = JSON.stringify(combined, null, 2);
    var combinedAsIndentedString = combinedAsString.replace(/\n/gs, "\n  ");
    var javascriptSource = fluid.stringTemplate(that.options.javascriptTemplate, { json: combinedAsIndentedString });

    var outputPath = fluid.module.resolvePath(that.options.outputPath);
    fs.writeFileSync(outputPath, javascriptSource, { encoding: "utf8" });

    fluid.log("Saved generated data...");
};

flock.midi.interchange.keymaster.shiftScale = function (scale, stepsToShift) {
    var shiftedScale = fluid.transform(scale, function (singleStep) {
        return (singleStep + stepsToShift) % 12;
    });
    return shiftedScale;
}

// TODO: May need tests for this.
flock.midi.interchange.keymaster.generateTree = function (remainingAlternatives) {
    if (remainingAlternatives.length === 0) {
        return true;
    }
    else {
        var subObject = {};
        fluid.each(remainingAlternatives, function (singleAlternative, index) {
            var entriesBeforeThis = index ? remainingAlternatives.slice(0, index): [];
            var entriesAfterThis = remainingAlternatives.slice(index + 1);
            var remainingEntries = entriesBeforeThis.concat(entriesAfterThis);

            subObject[singleAlternative] = flock.midi.interchange.keymaster.generateTree(remainingEntries);
        })
        return subObject;
    }
};

flock.midi.interchange.keymaster.generator();

flock.midi.interchange.keymaster.generator({
    shiftScales: true,
    outputPath: "%flocking-midi-interchange/demos/js/keymaster-lookup-all.js",
});
