/*

    Standardise the launchpad pro's "programmer" layout to match a common 8 x 8 grid layout used in our demos.

    81 82 83 84 85 86 87 88         =>              76 77 78 79 80 81 82 83
    71 72 73 74 75 76 77 78         =>              68 69 70 71 72 73 74 75
    61 62 63 64 65 66 67 68         =>              60 61 62 63 64 65 66 67
    51 52 53 54 55 56 57 58         =>              52 53 54 55 56 57 58 59
    41 42 43 44 45 46 47 48         =>              44 45 46 47 48 49 50 51
    31 32 33 34 35 36 37 38         =>              36 37 38 39 40 41 42 43
    21 22 23 24 25 26 27 28         =>              28 29 30 31 32 33 34 35
    11 12 13 14 15 16 17 18         =>              20 21 22 23 24 25 26 27

 */
(function (fluid, flock) {
    "use strict";
    fluid.registerNamespace("flock.midi.interchange.tunings.launchpadPro");
    flock.midi.interchange.tunings.launchpadPro.common = {
        "": "",
        "note": {
            transform: {
                type: "fluid.transforms.valueMapper",
                defaultInputPath: "note",
                match: [
                    // Row 1
                    { inputValue: 81, outputValue: 76 },
                    { inputValue: 82, outputValue: 77 },
                    { inputValue: 83, outputValue: 78 },
                    { inputValue: 84, outputValue: 79 },
                    { inputValue: 85, outputValue: 80 },
                    { inputValue: 86, outputValue: 81 },
                    { inputValue: 87, outputValue: 82 },
                    { inputValue: 88, outputValue: 83 },
                    // Row 2
                    { inputValue: 71, outputValue: 68 },
                    { inputValue: 72, outputValue: 69 },
                    { inputValue: 73, outputValue: 70 },
                    { inputValue: 74, outputValue: 71 },
                    { inputValue: 75, outputValue: 72 },
                    { inputValue: 76, outputValue: 73 },
                    { inputValue: 77, outputValue: 74 },
                    { inputValue: 78, outputValue: 75 },
                    // Row 3
                    { inputValue: 61, outputValue: 60 },
                    { inputValue: 62, outputValue: 61 },
                    { inputValue: 63, outputValue: 62 },
                    { inputValue: 64, outputValue: 63 },
                    { inputValue: 65, outputValue: 64 },
                    { inputValue: 66, outputValue: 65 },
                    { inputValue: 67, outputValue: 66 },
                    { inputValue: 68, outputValue: 67 },
                    // Row 4
                    { inputValue: 51, outputValue: 52 },
                    { inputValue: 52, outputValue: 53 },
                    { inputValue: 53, outputValue: 54 },
                    { inputValue: 54, outputValue: 55 },
                    { inputValue: 55, outputValue: 56 },
                    { inputValue: 56, outputValue: 57 },
                    { inputValue: 57, outputValue: 58 },
                    { inputValue: 58, outputValue: 59 },
                    // Row 5
                    { inputValue: 41, outputValue: 44 },
                    { inputValue: 42, outputValue: 45 },
                    { inputValue: 43, outputValue: 46 },
                    { inputValue: 44, outputValue: 47 },
                    { inputValue: 45, outputValue: 48 },
                    { inputValue: 46, outputValue: 49 },
                    { inputValue: 47, outputValue: 50 },
                    { inputValue: 48, outputValue: 51 },
                    // Row 6
                    { inputValue: 31, outputValue: 36 },
                    { inputValue: 32, outputValue: 37 },
                    { inputValue: 33, outputValue: 38 },
                    { inputValue: 34, outputValue: 39 },
                    { inputValue: 35, outputValue: 40 },
                    { inputValue: 36, outputValue: 41 },
                    { inputValue: 37, outputValue: 42 },
                    { inputValue: 38, outputValue: 43 },
                    // Row 7
                    { inputValue: 21, outputValue: 28 },
                    { inputValue: 22, outputValue: 29 },
                    { inputValue: 23, outputValue: 30 },
                    { inputValue: 24, outputValue: 31 },
                    { inputValue: 25, outputValue: 32 },
                    { inputValue: 26, outputValue: 33 },
                    { inputValue: 27, outputValue: 34 },
                    { inputValue: 28, outputValue: 35 },
                    // Row 8
                    { inputValue: 11, outputValue: 20 },
                    { inputValue: 12, outputValue: 21 },
                    { inputValue: 13, outputValue: 22 },
                    { inputValue: 14, outputValue: 23 },
                    { inputValue: 15, outputValue: 24 },
                    { inputValue: 16, outputValue: 25 },
                    { inputValue: 17, outputValue: 26 },
                    { inputValue: 18, outputValue: 27 }
                ]
            }
        }
    };
})(fluid, flock);
