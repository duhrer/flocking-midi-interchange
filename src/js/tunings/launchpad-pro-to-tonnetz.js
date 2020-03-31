/*

    Standardise the launchpad pro's "programmer" layout to match an isometric tonnetz layout.

    See https://en.wikipedia.org/wiki/Tonnetz

    81 82 83 84 85 86 87 88         =>              60 64 68 72 76 80 84 88
    71 72 73 74 75 76 77 78         =>              57 61 65 69 73 77 81 85
    61 62 63 64 65 66 67 68         =>              54 58 62 66 70 74 78 82
    51 52 53 54 55 56 57 58         =>              51 55 59 63 67 71 75 79
    41 42 43 44 45 46 47 48         =>              48 52 56 60 64 68 72 76
    31 32 33 34 35 36 37 38         =>              45 49 53 57 61 65 69 73
    21 22 23 24 25 26 27 28         =>              42 46 50 54 58 62 66 70
    11 12 13 14 15 16 17 18         =>              39 43 47 51 55 59 63 67

 */
/* globals fluid, flock */
(function (fluid, flock) {
    "use strict";
    fluid.registerNamespace("flock.midi.interchange.tunings.launchpadPro");
    flock.midi.interchange.tunings.launchpadPro.tonnetz = {
        "": "",
        "note": {
            transform: {
                type: "fluid.transforms.valueMapper",
                defaultInputPath: "note",
                match: [
                    // Row 1
                    { inputValue: 81, outputValue: 60 },
                    { inputValue: 82, outputValue: 64 },
                    { inputValue: 83, outputValue: 68 },
                    { inputValue: 84, outputValue: 72 },
                    { inputValue: 85, outputValue: 76 },
                    { inputValue: 86, outputValue: 80 },
                    { inputValue: 87, outputValue: 84 },
                    { inputValue: 88, outputValue: 88 },
                    // Row 2
                    { inputValue: 71, outputValue: 57 },
                    { inputValue: 72, outputValue: 61 },
                    { inputValue: 73, outputValue: 65 },
                    { inputValue: 74, outputValue: 69 },
                    { inputValue: 75, outputValue: 73 },
                    { inputValue: 76, outputValue: 77 },
                    { inputValue: 77, outputValue: 81 },
                    { inputValue: 78, outputValue: 85 },
                    // Row 3
                    { inputValue: 61, outputValue: 54 },
                    { inputValue: 62, outputValue: 58 },
                    { inputValue: 63, outputValue: 62 },
                    { inputValue: 64, outputValue: 66 },
                    { inputValue: 65, outputValue: 70 },
                    { inputValue: 66, outputValue: 74 },
                    { inputValue: 67, outputValue: 78 },
                    { inputValue: 68, outputValue: 82 },
                    // Row 4
                    { inputValue: 51, outputValue: 51 },
                    { inputValue: 52, outputValue: 55 },
                    { inputValue: 53, outputValue: 59 },
                    { inputValue: 54, outputValue: 63 },
                    { inputValue: 55, outputValue: 67 },
                    { inputValue: 56, outputValue: 71 },
                    { inputValue: 57, outputValue: 75 },
                    { inputValue: 58, outputValue: 79 },
                    // Row 5
                    { inputValue: 41, outputValue: 48 },
                    { inputValue: 42, outputValue: 52 },
                    { inputValue: 43, outputValue: 56 },
                    { inputValue: 44, outputValue: 60 },
                    { inputValue: 45, outputValue: 64 },
                    { inputValue: 46, outputValue: 68 },
                    { inputValue: 47, outputValue: 72 },
                    { inputValue: 48, outputValue: 76 },
                    // Row 6
                    { inputValue: 31, outputValue: 45 },
                    { inputValue: 32, outputValue: 49 },
                    { inputValue: 33, outputValue: 53 },
                    { inputValue: 34, outputValue: 57 },
                    { inputValue: 35, outputValue: 61 },
                    { inputValue: 36, outputValue: 65 },
                    { inputValue: 37, outputValue: 69 },
                    { inputValue: 38, outputValue: 73 },
                    // Row 7
                    { inputValue: 21, outputValue: 42 },
                    { inputValue: 22, outputValue: 46 },
                    { inputValue: 23, outputValue: 50 },
                    { inputValue: 24, outputValue: 54 },
                    { inputValue: 25, outputValue: 58 },
                    { inputValue: 26, outputValue: 62 },
                    { inputValue: 27, outputValue: 66 },
                    { inputValue: 28, outputValue: 70 },
                    // Row 8
                    { inputValue: 11, outputValue: 39 },
                    { inputValue: 12, outputValue: 43 },
                    { inputValue: 13, outputValue: 47 },
                    { inputValue: 14, outputValue: 51 },
                    { inputValue: 15, outputValue: 55 },
                    { inputValue: 16, outputValue: 59 },
                    { inputValue: 17, outputValue: 63 },
                    { inputValue: 18, outputValue: 67 }
                ]
            }
        }
    };
})(fluid, flock);
