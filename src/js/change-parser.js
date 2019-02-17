/* eslint-env node */
"use strict";
var fluid = fluid || require("infusion");
var flock = fluid.registerNamespace("flock");

fluid.registerNamespace("flock.midi.interchange");

/*

    Go from a raw changeValue to a change path. Starting with something like:

        {
            0: { // channel
                notes: { // message type
                    98: 127 // in this case, note: velocity
                }
            }
        }

    We would end up with:

        [{
            path:  [0, "notes", 98],
            value: 127
        }]

    The output is an array because there may be more than one change, as in this example:

    {
        0: {
            notes: {
                98: 127
            },
            control: {
                7: 0
            }
        }
    }

    Which should result in output like:

    [ { path: [0, "notes", 98], value: 127 }, { path: [0, "control", 7], value: 0} ]

 */
flock.midi.interchange.parseChangeValue = function (changeValue) {
    var allChanges = [];
    flock.midi.interchange.parseChangeLevel(allChanges, [], changeValue);
    return allChanges;
};

flock.midi.interchange.parseChangeLevel = function (allChanges, pathSegments, levelObject) {
    fluid.each(levelObject, function (value, key) {
        var levelSegments = pathSegments.concat([key]);
        if (typeof value === "object") {
            flock.midi.interchange.parseChangeLevel(allChanges, levelSegments, value);
        }
        else {
            allChanges.push({ path: levelSegments, value: value });
        }
    });
};
