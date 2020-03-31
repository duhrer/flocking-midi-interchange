/*

    Standardise the launchpad pro's "programmer" layout to a continuous range of notes starting at C3.

    81 82 83 84 85 86 87 88         =>              80 81 82 83 84 85 86 87
    71 72 73 74 75 76 77 78         =>              72 73 74 75 76 77 78 79
    61 62 63 64 65 66 67 68         =>              64 65 66 67 68 69 70 71
    51 52 53 54 55 56 57 58         =>              56 57 58 59 60 61 62 63
    41 42 43 44 45 46 47 48         =>              48 49 50 51 52 53 54 55
    31 32 33 34 35 36 37 38         =>              40 41 42 43 44 45 46 47
    21 22 23 24 25 26 27 28         =>              32 33 34 35 36 37 38 39
    11 12 13 14 15 16 17 18         =>              24 25 26 27 28 29 30 31

 */
// TODO: Update the common launchpad tuning and make this the common grade instead.
/* globals fluid, flock */
(function (fluid, flock) {
    "use strict";
    fluid.registerNamespace("flock.midi.interchange.tunings.launchpadPro");
    flock.midi.interchange.tunings.launchpadPro.highlights = {
        "": "",
        "note": {
            transform: {
                type: "fluid.transforms.valueMapper",
                defaultInputPath: "note",
                match: [
                    // Row 1
                    { inputValue: 81, outputValue: 80 },
                    { inputValue: 82, outputValue: 81 },
                    { inputValue: 83, outputValue: 82 },
                    { inputValue: 84, outputValue: 83 },
                    { inputValue: 85, outputValue: 84 },
                    { inputValue: 86, outputValue: 85 },
                    { inputValue: 87, outputValue: 86 },
                    { inputValue: 88, outputValue: 87 },
                    // Row 2
                    { inputValue: 71, outputValue: 72 },
                    { inputValue: 72, outputValue: 73 },
                    { inputValue: 73, outputValue: 74 },
                    { inputValue: 74, outputValue: 75 },
                    { inputValue: 75, outputValue: 76 },
                    { inputValue: 76, outputValue: 77 },
                    { inputValue: 77, outputValue: 78 },
                    { inputValue: 78, outputValue: 79 },
                    // Row 3
                    { inputValue: 61, outputValue: 64 },
                    { inputValue: 62, outputValue: 65 },
                    { inputValue: 63, outputValue: 66 },
                    { inputValue: 64, outputValue: 67 },
                    { inputValue: 65, outputValue: 68 },
                    { inputValue: 66, outputValue: 69 },
                    { inputValue: 67, outputValue: 70 },
                    { inputValue: 68, outputValue: 71 },
                    // Row 4
                    { inputValue: 51, outputValue: 56 },
                    { inputValue: 52, outputValue: 57 },
                    { inputValue: 53, outputValue: 58 },
                    { inputValue: 54, outputValue: 59 },
                    { inputValue: 55, outputValue: 60 },
                    { inputValue: 56, outputValue: 61 },
                    { inputValue: 57, outputValue: 62 },
                    { inputValue: 58, outputValue: 63 },
                    // Row 5
                    { inputValue: 41, outputValue: 48 },
                    { inputValue: 42, outputValue: 49 },
                    { inputValue: 43, outputValue: 50 },
                    { inputValue: 44, outputValue: 51 },
                    { inputValue: 45, outputValue: 52 },
                    { inputValue: 46, outputValue: 53 },
                    { inputValue: 47, outputValue: 54 },
                    { inputValue: 48, outputValue: 55 },
                    // Row 6
                    { inputValue: 31, outputValue: 40 },
                    { inputValue: 32, outputValue: 41 },
                    { inputValue: 33, outputValue: 42 },
                    { inputValue: 34, outputValue: 43 },
                    { inputValue: 35, outputValue: 44 },
                    { inputValue: 36, outputValue: 45 },
                    { inputValue: 37, outputValue: 46 },
                    { inputValue: 38, outputValue: 47 },
                    // Row 7
                    { inputValue: 21, outputValue: 32 },
                    { inputValue: 22, outputValue: 33 },
                    { inputValue: 23, outputValue: 34 },
                    { inputValue: 24, outputValue: 35 },
                    { inputValue: 25, outputValue: 36 },
                    { inputValue: 26, outputValue: 37 },
                    { inputValue: 27, outputValue: 38 },
                    { inputValue: 28, outputValue: 39 },
                    // Row 8
                    { inputValue: 11, outputValue: 24 },
                    { inputValue: 12, outputValue: 25 },
                    { inputValue: 13, outputValue: 26 },
                    { inputValue: 14, outputValue: 27 },
                    { inputValue: 15, outputValue: 28 },
                    { inputValue: 16, outputValue: 29 },
                    { inputValue: 17, outputValue: 30 },
                    { inputValue: 18, outputValue: 31 },
                ]
            }
        }
    };
})(fluid, flock);
