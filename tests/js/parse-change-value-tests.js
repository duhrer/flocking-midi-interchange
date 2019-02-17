/* eslint-env node */
"use strict";
var fluid = require("infusion");
var flock = fluid.registerNamespace("flock");
var jqUnit = require("node-jqunit");

require("../../src/js/change-parser");

jqUnit.module("Unit tests for change value parser.");

fluid.registerNamespace("flock.tests.midi.interchange.changeParser");

flock.tests.midi.interchange.changeParser.runTests = function (that) {
    fluid.each(that.options.testDefs, flock.tests.midi.interchange.changeParser.runSingleTest)
};

flock.tests.midi.interchange.changeParser.runSingleTest = function (testDef) {
    jqUnit.test(testDef.message, function () {
        var output = flock.midi.interchange.parseChangeValue(testDef.input);
        jqUnit.assertDeepEq("The parsed value should be as expected.", testDef.expected, output);
    });
};

fluid.defaults("flock.tests.midi.interchange.changeParser", {
    gradeNames: ["fluid.component"],
    testDefs: {
        singleValue: {
            message: "We should be able to handle a simple change.",
            input: {
                0: { // channel
                    notes: { // message type
                        98: 127 // in this case, note: velocity
                    }
                }
            },
            expected: [{
                path:  ["0", "notes", "98"],
                value: 127
            }]
        },
        multipleValues: {
            message: "We should be able to handle multiple changes.",
            input: {
                0: {
                    notes: {
                        98: 127
                    },
                    control: {
                        7: 0
                    }
                }
            },
            expected: [ { path: ["0", "notes", "98"], value: 127 }, { path: ["0", "control", "7"], value: 0} ]
        }
    },
    listeners: {
        "onCreate.runTests": {
            funcName: "flock.tests.midi.interchange.changeParser.runTests",
            args:     ["{that}"]
        }
    }
});

flock.tests.midi.interchange.changeParser();


