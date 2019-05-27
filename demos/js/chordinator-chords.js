(function (fluid) {
    "use strict";
    var flock = fluid.registerNamespace("flock");

    fluid.registerNamespace("flock.midi.interchange.demos.chordinator");
    /*

        Chord data adapted from: https://en.wikipedia.org/wiki/Chord_(music)
        The patterns allowed are expressed in terms of their root (the 0th note) and the relative offset from the root.

        0, 4, 7 => major
        0, 3, 7 => minor
        0, 4, 8 => aug
        0, 3, 6 => dim

        // Seventh chords adapted from the above wikipedia article and: https://www.pianochord.org/seventh.html

        0, 4, 7, 10 => perfect 7th
        0, 4, 7, 11 => major 7th
        0, 3, 7, 10 => minor 7th

     */

    flock.midi.interchange.demos.chordinator.baseChords = {
        major:      [0, 4, 7],
        minor:      [0, 3, 7],
        augmented:  [0, 4, 8],
        diminished: [0, 3, 6],
        perfect7th: [0, 4, 7, 10],
        major7th:   [0, 4, 7, 11],
        minor7th:   [0, 3, 7, 10]
    };

    /**
     *
     * Starting with a chord expressed in terms of a root of 0, generate the full range of 12 variations, one for each
     * possible "root" note.
     *
     * @param {Array<Integer>} originalChord - The original chord to generate variations on.
     * @return {Array<Array<Integer>>} - An array of all possible variations on the chord, including the original chord.
     *
     */
    flock.midi.interchange.demos.chordinator.generateVariations = function (originalChord) {
        var variations = [originalChord];
        for (var offset = 1; offset < 12; offset++) {
            var offsetVariation = fluid.transform(originalChord, function (note) { return (note + offset) % 12; });
            variations.push(offsetVariation);
        }
        return variations;
    };

    flock.midi.interchange.demos.chordinator.allChords = [];

    // Generate an array of 12 variations on each of 7 types of chords.
    // TODO: If this proves to be expensive, pregenerate it as a namespaced include.
    fluid.each(flock.midi.interchange.demos.chordinator.baseChords, function (baseChord) {
        var varations =  flock.midi.interchange.demos.chordinator.generateVariations(baseChord);
        flock.midi.interchange.demos.chordinator.allChords = flock.midi.interchange.demos.chordinator.allChords.concat(varations);
    });
})(fluid);
