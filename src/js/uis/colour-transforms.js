/*

    Colour schemes represented as transforms from note velocity / control value to HTML colour.

 */
// TODO: Transition all traditional "map" approaches to use transforms instead.
(function (fluid, flock) {
    "use strict";
    fluid.registerNamespace("flock.midi.interchange.colourTransforms");

    flock.midi.interchange.colourTransforms.sixteenBlues = {
        "": {
            "transform": {
                "type": "fluid.transforms.quantize",
                "inputPath": "",
                "ranges": [
                    {
                        "upperBound": 8,
                        "output": "#000099"
                    },
                    {
                        "upperBound": 16,
                        "output": "#0000aa"
                    },
                    {
                        "upperBound": 24,
                        "output": "#0000bb"
                    },
                    {
                        "upperBound": 32,
                        "output": "#0000cc"
                    },
                    {
                        "upperBound": 40,
                        "output": "#0000dd"
                    },
                    {
                        "upperBound": 48,
                        "output": "#0000ee"
                    },
                    {
                        "upperBound": 56,
                        "output": "#0000ff"
                    },
                    {
                        "upperBound": 64,
                        "output": "#0033ff"
                    },
                    {
                        "upperBound": 72,
                        "output": "#0066ff"
                    },
                    {
                        "upperBound": 80,
                        "output": "#0099ff"
                    },
                    {
                        "upperBound": 88,
                        "output": "#00ccff"
                    },
                    {
                        "upperBound": 96,
                        "output": "#00ffff"
                    },
                    {
                        "upperBound": 104,
                        "output": "#33ffff"
                    },
                    {
                        "upperBound": 112,
                        "output": "#66ffff"
                    },
                    {
                        "upperBound": 120,
                        "output": "#99ffff"
                    },
                    {
                        "upperBound": 128,
                        "output": "#ccffff"
                    }
                ]
            }
        }
    };
})(fluid, flock);
