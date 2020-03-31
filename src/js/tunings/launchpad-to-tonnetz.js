/*

    Standardise the launchpad's x-y layout to match an isometric tonnetz layout.

    See https://en.wikipedia.org/wiki/Tonnetz

    000 001 002 003 004 005 006 007       =>        60 64 68 72 76 80 84 88
    016 017 018 019 020 021 022 023       =>        57 61 65 69 73 77 81 85
    032 033 034 035 036 037 038 039       =>        54 58 62 66 70 74 78 82
    048 049 050 051 052 053 054 055       =>        51 55 59 63 67 71 75 79
    064 065 066 067 068 069 070 071       =>        48 52 56 60 64 68 72 76
    080 081 082 083 084 085 086 087       =>        45 49 53 57 61 65 69 73
    096 097 098 099 100 101 102 103       =>        42 46 50 54 58 62 66 70
    112 113 114 115 116 117 118 119       =>        39 43 47 51 55 59 63 67

 */
/* globals fluid, flock */
(function (fluid, flock) {
    "use strict";
    fluid.registerNamespace("flock.midi.interchange.tunings.launchpadPro");
    flock.midi.interchange.tunings.launchpad.tonnetz = {
        "": "",
        "note": {
            transform: {
                type: "fluid.transforms.valueMapper",
                defaultInputPath: "note",
                match: [
                    // Row 1
                    { inputValue: 0, outputValue: 60 },
                    { inputValue: 1, outputValue: 64 },
                    { inputValue: 2, outputValue: 68 },
                    { inputValue: 3, outputValue: 72 },
                    { inputValue: 4, outputValue: 76 },
                    { inputValue: 5, outputValue: 80 },
                    { inputValue: 6, outputValue: 84 },
                    { inputValue: 7, outputValue: 88 },
                    // Row 2
                    { inputValue: 16, outputValue: 57 },
                    { inputValue: 17, outputValue: 61 },
                    { inputValue: 18, outputValue: 65 },
                    { inputValue: 19, outputValue: 69 },
                    { inputValue: 20, outputValue: 73 },
                    { inputValue: 21, outputValue: 77 },
                    { inputValue: 22, outputValue: 81 },
                    { inputValue: 23, outputValue: 85 },
                    // Row 3
                    { inputValue: 32, outputValue: 54 },
                    { inputValue: 33, outputValue: 58 },
                    { inputValue: 34, outputValue: 62 },
                    { inputValue: 35, outputValue: 66 },
                    { inputValue: 36, outputValue: 70 },
                    { inputValue: 37, outputValue: 74 },
                    { inputValue: 38, outputValue: 78 },
                    { inputValue: 39, outputValue: 82 },
                    // Row 4
                    { inputValue: 48, outputValue: 51 },
                    { inputValue: 49, outputValue: 55 },
                    { inputValue: 50, outputValue: 59 },
                    { inputValue: 51, outputValue: 63 },
                    { inputValue: 52, outputValue: 67 },
                    { inputValue: 53, outputValue: 71 },
                    { inputValue: 54, outputValue: 75 },
                    { inputValue: 55, outputValue: 79 },
                    // Row 5
                    { inputValue: 64, outputValue: 48 },
                    { inputValue: 65, outputValue: 52 },
                    { inputValue: 66, outputValue: 56 },
                    { inputValue: 67, outputValue: 60 },
                    { inputValue: 68, outputValue: 64 },
                    { inputValue: 69, outputValue: 68 },
                    { inputValue: 70, outputValue: 72 },
                    { inputValue: 71, outputValue: 76 },
                    // Row 6
                    { inputValue: 80, outputValue: 45 },
                    { inputValue: 81, outputValue: 49 },
                    { inputValue: 82, outputValue: 53 },
                    { inputValue: 83, outputValue: 57 },
                    { inputValue: 84, outputValue: 61 },
                    { inputValue: 85, outputValue: 65 },
                    { inputValue: 86, outputValue: 69 },
                    { inputValue: 87, outputValue: 73 },
                    // Row 7
                    { inputValue: 96, outputValue: 42 },
                    { inputValue: 97, outputValue: 46 },
                    { inputValue: 98, outputValue: 50 },
                    { inputValue: 99, outputValue: 54 },
                    { inputValue: 100, outputValue: 58 },
                    { inputValue: 101, outputValue: 62 },
                    { inputValue: 102, outputValue: 66 },
                    { inputValue: 103, outputValue: 70 },
                    // Row 8
                    { inputValue: 112, outputValue: 39 },
                    { inputValue: 113, outputValue: 43 },
                    { inputValue: 114, outputValue: 47 },
                    { inputValue: 115, outputValue: 51 },
                    { inputValue: 116, outputValue: 55 },
                    { inputValue: 117, outputValue: 59 },
                    { inputValue: 118, outputValue: 63 },
                    { inputValue: 119, outputValue: 67 }
                ]
            }
        }
    };
})(fluid, flock);
