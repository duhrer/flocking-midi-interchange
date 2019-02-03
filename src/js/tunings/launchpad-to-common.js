/*

    Standardise the launchpad's x-y layout to match a common 8 x 8 grid layout used in our demos.


    000 001 002 003 004 005 006 007       =>            76 77 78 79 80 81 82 83
    016 017 018 019 020 021 022 023       =>            68 69 70 71 72 73 74 75
    032 033 034 035 036 037 038 039       =>            60 61 62 63 64 65 66 67
    048 049 050 051 052 053 054 055       =>            52 53 54 55 56 57 58 59
    064 065 066 067 068 069 070 071       =>            44 45 46 47 48 49 50 51
    080 081 082 083 084 085 086 087       =>            36 37 38 39 40 41 42 43
    096 097 098 099 100 101 102 103       =>            28 29 30 31 32 33 34 35
    112 113 114 115 116 117 118 119       =>            20 21 22 23 24 25 26 27

 */
(function (fluid, flock) {
    "use strict";
    fluid.registerNamespace("flock.midi.interchange.tunings.launchpad");
    flock.midi.interchange.tunings.launchpad.common = {
        "": "",
        "note": {
            transform: {
                type: "fluid.transforms.valueMapper",
                defaultInputPath: "note",
                match: [
                    // Row 1
                    { inputValue: 0, outputValue: 76 },
                    { inputValue: 1, outputValue: 77 },
                    { inputValue: 2, outputValue: 78 },
                    { inputValue: 3, outputValue: 79 },
                    { inputValue: 4, outputValue: 80 },
                    { inputValue: 5, outputValue: 81 },
                    { inputValue: 6, outputValue: 82 },
                    { inputValue: 7, outputValue: 83 },
                    // Row 2
                    { inputValue: 16, outputValue: 68 },
                    { inputValue: 17, outputValue: 69 },
                    { inputValue: 18, outputValue: 70 },
                    { inputValue: 19, outputValue: 71 },
                    { inputValue: 20, outputValue: 72 },
                    { inputValue: 21, outputValue: 73 },
                    { inputValue: 22, outputValue: 74 },
                    { inputValue: 23, outputValue: 75 },
                    // Row 3
                    { inputValue: 32, outputValue: 60 },
                    { inputValue: 33, outputValue: 61 },
                    { inputValue: 34, outputValue: 62 },
                    { inputValue: 35, outputValue: 63 },
                    { inputValue: 36, outputValue: 64 },
                    { inputValue: 37, outputValue: 65 },
                    { inputValue: 38, outputValue: 66 },
                    { inputValue: 39, outputValue: 67 },
                    // Row 4
                    { inputValue: 48, outputValue: 52 },
                    { inputValue: 49, outputValue: 53 },
                    { inputValue: 50, outputValue: 54 },
                    { inputValue: 51, outputValue: 55 },
                    { inputValue: 52, outputValue: 56 },
                    { inputValue: 53, outputValue: 57 },
                    { inputValue: 54, outputValue: 58 },
                    { inputValue: 55, outputValue: 59 },
                    // Row 5
                    { inputValue: 64, outputValue: 44 },
                    { inputValue: 65, outputValue: 45 },
                    { inputValue: 66, outputValue: 46 },
                    { inputValue: 67, outputValue: 47 },
                    { inputValue: 68, outputValue: 48 },
                    { inputValue: 69, outputValue: 49 },
                    { inputValue: 70, outputValue: 50 },
                    { inputValue: 71, outputValue: 51 },
                    // Row 6
                    { inputValue: 80, outputValue: 36 },
                    { inputValue: 81, outputValue: 37 },
                    { inputValue: 82, outputValue: 38 },
                    { inputValue: 83, outputValue: 39 },
                    { inputValue: 84, outputValue: 40 },
                    { inputValue: 85, outputValue: 41 },
                    { inputValue: 86, outputValue: 42 },
                    { inputValue: 87, outputValue: 43 },
                    // Row 7
                    { inputValue: 96, outputValue: 28 },
                    { inputValue: 97, outputValue: 29 },
                    { inputValue: 98, outputValue: 30 },
                    { inputValue: 99, outputValue: 31 },
                    { inputValue: 100, outputValue: 32 },
                    { inputValue: 101, outputValue: 33 },
                    { inputValue: 102, outputValue: 34 },
                    { inputValue: 103, outputValue: 35 },
                    // Row 8
                    { inputValue: 112, outputValue: 20 },
                    { inputValue: 113, outputValue: 21 },
                    { inputValue: 114, outputValue: 22 },
                    { inputValue: 115, outputValue: 23 },
                    { inputValue: 116, outputValue: 24 },
                    { inputValue: 117, outputValue: 25 },
                    { inputValue: 118, outputValue: 26 },
                    { inputValue: 119, outputValue: 27 }
                ]
            }
        }
    };
})(fluid, flock);
