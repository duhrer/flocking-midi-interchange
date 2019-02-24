/*

    Transform the Launchpad Pro's "programmer" tuning to a guitar-like "E" tuning, where:

    1. "low E" (10c) is E3
    2. The first notes in each row are the "open" string.

    // TODO: Drop by an octave

    10c 11 12 13 14 15 16 17 18 19c        =>        52 53 54 55 56 57 58 59 60 61
    20c 21 22 23 24 25 26 27 28 29c        =>        57 58 59 60 61 62 63 64 65 66
    30c 31 32 33 34 35 36 37 38 39c        =>        62 63 64 65 66 67 68 69 70 71
    40c 41 42 43 44 45 46 47 48 49c        =>        67 68 69 70 71 72 73 74 75 76
    50c 51 52 53 54 55 56 57 58 59c        =>        71 72 73 74 75 76 77 78 79 80
    60c 61 62 63 64 65 66 67 68 69c        =>        76 77 78 79 80 81 82 83 84 85
    70c 71 72 73 74 75 76 77 78 79c        =>        81 82 83 84 85 86 87 88 89 90
    80c 81 82 83 84 85 86 87 88 89c        =>        86 87 88 89 90 91 92 93 94 95

    TODO: Support for tunings other than E or Bass, i.e. Drop D or the like.

    TODO: Add the right controls as additional notes for both the Launchpad and Launchpad Pro
 */
/* globals fluid, flock */
(function (fluid, flock) {
    "use strict";
    fluid.registerNamespace("flock.midi.interchange.tunings.launchpadPro");

    flock.midi.interchange.tunings.launchpadPro.guitarE = {
        note: {
            "": "",
            "note": {
                transform: {
                    type: "fluid.transforms.valueMapper",
                    defaultInputPath: "note",
                    match: [
                    // TODO: Correct tuning down an octave.
                        // Low "E"
                        // 10c 11 12 13 14 15 16 17 18 19c => 52 53 54 55 56 57 58 59 60 61
                        { inputValue: 11, outputValue: 41 },
                        { inputValue: 12, outputValue: 42 },
                        { inputValue: 13, outputValue: 43 },
                        { inputValue: 14, outputValue: 44 },
                        { inputValue: 15, outputValue: 45 },
                        { inputValue: 16, outputValue: 46 },
                        { inputValue: 17, outputValue: 47 },
                        { inputValue: 18, outputValue: 48 },
                        // "A"
                        // 20c 21 22 23 24 25 26 27 28 29c => 57 58 59 60 61 62 63 64 65 66
                        { inputValue: 21, outputValue: 46 },
                        { inputValue: 22, outputValue: 47 },
                        { inputValue: 23, outputValue: 48 },
                        { inputValue: 24, outputValue: 49 },
                        { inputValue: 25, outputValue: 50 },
                        { inputValue: 26, outputValue: 51 },
                        { inputValue: 27, outputValue: 52 },
                        { inputValue: 28, outputValue: 53 },
                        // "D"
                        // 30c 31 32 33 34 35 36 37 38 39c => 62 63 64 65 66 67 68 69 70 71
                        { inputValue: 31, outputValue: 51 },
                        { inputValue: 32, outputValue: 52 },
                        { inputValue: 33, outputValue: 53 },
                        { inputValue: 34, outputValue: 54 },
                        { inputValue: 35, outputValue: 55 },
                        { inputValue: 36, outputValue: 56 },
                        { inputValue: 37, outputValue: 57 },
                        { inputValue: 38, outputValue: 58 },
                        // "G"
                        // 40c 41 42 43 44 45 46 47 48 49c => 67 68 69 70 71 72 73 74 75 76
                        { inputValue: 41, outputValue: 56 },
                        { inputValue: 42, outputValue: 57 },
                        { inputValue: 43, outputValue: 58 },
                        { inputValue: 44, outputValue: 59 },
                        { inputValue: 45, outputValue: 60 },
                        { inputValue: 46, outputValue: 61 },
                        { inputValue: 47, outputValue: 62 },
                        { inputValue: 48, outputValue: 63 },
                        // "B"
                        // 50c 51 52 53 54 55 56 57 58 59c => 71 72 73 74 75 76 77 78 79 80
                        { inputValue: 51, outputValue: 60 },
                        { inputValue: 52, outputValue: 61 },
                        { inputValue: 53, outputValue: 62 },
                        { inputValue: 54, outputValue: 63 },
                        { inputValue: 55, outputValue: 64 },
                        { inputValue: 56, outputValue: 65 },
                        { inputValue: 57, outputValue: 66 },
                        { inputValue: 58, outputValue: 67 },
                        // "High E"
                        // 60c 61 62 63 64 65 66 67 68 69c => 76 77 78 79 80 81 82 83 84 85
                        { inputValue: 61, outputValue: 65 },
                        { inputValue: 62, outputValue: 66 },
                        { inputValue: 63, outputValue: 67 },
                        { inputValue: 64, outputValue: 68 },
                        { inputValue: 65, outputValue: 69 },
                        { inputValue: 66, outputValue: 70 },
                        { inputValue: 67, outputValue: 71 },
                        { inputValue: 68, outputValue: 72 },
                        // "High A"
                        // 70c 71 72 73 74 75 76 77 78 79c => 81 82 83 84 85 86 87 88 89 90
                        { inputValue: 71, outputValue: 70 },
                        { inputValue: 72, outputValue: 71 },
                        { inputValue: 73, outputValue: 72 },
                        { inputValue: 74, outputValue: 73 },
                        { inputValue: 75, outputValue: 74 },
                        { inputValue: 76, outputValue: 75 },
                        { inputValue: 77, outputValue: 76 },
                        { inputValue: 78, outputValue: 77 },
                        // "High D"
                        // 80c 81 82 83 84 85 86 87 88 89c => 86 87 88 89 90 91 92 93 94 95
                        { inputValue: 81, outputValue: 75 },
                        { inputValue: 82, outputValue: 76 },
                        { inputValue: 83, outputValue: 77 },
                        { inputValue: 84, outputValue: 78 },
                        { inputValue: 85, outputValue: 79 },
                        { inputValue: 86, outputValue: 80 },
                        { inputValue: 87, outputValue: 81 },
                        { inputValue: 88, outputValue: 82 },
                    ]
                }
            }
        },
        // TODO: Filter out everything but 0th and 9th controls to notes.
        control: {
            "type": { literalValue: "noteOn" },
            "channel": "channel",
            "velocity": "value",
            "note": {
                transform: {
                    type: "fluid.transforms.valueMapper",
                    defaultInputPath: "number",
                    match: [
                        // TODO: Correct tuning down an octave.

                        // Low "E"
                        // 10c 11 12 13 14 15 16 17 18 19c => 52 53 54 55 56 57 58 59 60 61
                        { inputValue: 10, outputValue: 40 },
                        { inputValue: 19, outputValue: 49 },
                        // "A"
                        // 20c 21 22 23 24 25 26 27 28 29c => 57 58 59 60 61 62 63 64 65 66
                        { inputValue: 20, outputValue: 45 },
                        { inputValue: 29, outputValue: 54 },
                        // "D"
                        // 30c 31 32 33 34 35 36 37 38 39c => 62 63 64 65 66 67 68 69 70 71
                        { inputValue: 30, outputValue: 50 },
                        { inputValue: 39, outputValue: 59 },
                        // "G"
                        // 40c 41 42 43 44 45 46 47 48 49c => 67 68 69 70 71 72 73 74 75 76
                        { inputValue: 40, outputValue: 55 },
                        { inputValue: 49, outputValue: 64 },
                        // "B"
                        // 50c 51 52 53 54 55 56 57 58 59c => 71 72 73 74 75 76 77 78 79 80
                        { inputValue: 50, outputValue: 59 },
                        { inputValue: 59, outputValue: 68 },
                        // "High E"
                        // 60c 61 62 63 64 65 66 67 68 69c => 76 77 78 79 80 81 82 83 84 85
                        { inputValue: 60, outputValue: 64 },
                        { inputValue: 69, outputValue: 73 },
                        // "High A"
                        // 70c 71 72 73 74 75 76 77 78 79c => 81 82 83 84 85 86 87 88 89 90
                        { inputValue: 70, outputValue: 69 },
                        { inputValue: 79, outputValue: 78 },
                        // "High D"
                        // 80c 81 82 83 84 85 86 87 88 89c => 86 87 88 89 90 91 92 93 94 95
                        { inputValue: 80, outputValue: 74 },
                        { inputValue: 89, outputValue: 83 },
                    ]
                }
            }
        }
    };

/*

    TODO: Bass tuning

    80c 81 82 83 84 85 86 87 88 89c        =>        74 75 76 77 78 79 80 81 82 83
    70c 71 72 73 74 75 76 77 78 79c        =>        69 70 71 72 73 74 75 76 77 78
    60c 61 62 63 64 65 66 67 68 69c        =>        64 65 66 67 68 69 70 71 72 73
    50c 51 52 53 54 55 56 57 58 59c        =>        59 60 61 62 63 64 65 66 67 68
    40c 41 42 43 44 45 46 47 48 49c        =>        55 56 57 58 59 60 61 62 63 64
    30c 31 32 33 34 35 36 37 38 39c        =>        50 51 52 53 54 55 56 57 58 59
    20c 21 22 23 24 25 26 27 28 29c        =>        45 46 47 48 49 50 51 52 53 54
    10c 11 12 13 14 15 16 17 18 19c        =>        40 41 42 43 44 45 46 47 48 49

 */
})(fluid, flock);
