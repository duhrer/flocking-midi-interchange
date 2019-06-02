/*

    A router that monitors the "held" notes and ensures that only additional notes that would make a chord
    can be played.  Note that chord detection is limited to minor, major, augmented, diminished, and some 7th chords.

    When each note is played:

    1. It is "deoctavised", i.e. only its relative position within the octave is considered (note % 12).
    2. The note is compared to any "held" notes.
    3. If the new note would form a chord if added to the held notes, it is played and added to the "held" notes.
    4. If the new note would not form a chord, it is not played or added to the list of "held" notes.

    Note that because of "deoctavising", you are always allowed to play any "held" note in another octave.

    Each chord can be shifted up to 11 places higher, and notes "wrap" between octaves.  As an example, here are the
    twelve variations on a major chord (in this diagram the first note is always the root):

    1.  0,  4,  7
    2.  1,  5,  8
    3.  2,  6,  9
    4.  3,  7, 10
    5.  4,  8, 11
    6.  5,  9,  0
    7.  6, 10,  1
    8.  7, 11,  2
    9.  8,  0,  3
    10. 9,  1,  4
    11. 10, 2,  5
    12. 11, 3,  6

    If only major chords were allowed and you pressed the 4th note, you might be trying for variation #1, #5, or #10,
    and notes 0, 1, 7, 8, 9, and 11 would be allowed.  Once you pressed the 9th note, only the 1st note would be
    allowed.

    # Device Feedback

    This instrument is designed with a MIDI-programmable device like the Novation Launchpad or Launchpad Pro in mind.
    Whenever a note is "held" or released, MIDI messages are sent to highlight the "allowed" notes.  When no notes are
    held, all pads are lit.  As notes are "held", the number of "allowed" notes decreases until only octave variations
    on the existing "held" notes are possible.  With the current range of chords, this means that you will only be able
    to hit at most four distinct (non octave shifted) notes before you are limited to octave variations on existing
    notes.

 */
(function (fluid) {
    "use strict";
    var flock = fluid.registerNamespace("flock");

    fluid.registerNamespace("flock.midi.interchange.demos.bifrost");

    /**
     *
     * Confirm whether a single chord (array of notes) contains an individual note.
     *
     * @param {Array<Number>} chord - An array of notes representing a chord.
     * @param {Array<Number>} notes - An array of notes to check against the chord.
     * @return {Boolean} - `true` if the chord has all the notes, `false` otherwise.
     *
     */
    flock.midi.interchange.demos.bifrost.chordHasNotes = function (chord, notes) {
        if (notes.length) {
            var missingNote = fluid.find(notes, function (note) {
                return (chord.indexOf(note % 12) === -1) || undefined;
            });
            return !missingNote ? true : false;
        }
        else {
            return true;
        }
    };

    /**
     *
     * Check a list of candidate chords to confirm whether there are any that contain all the specified notes.
     *
     * @param {Array<Array<Number>>} candidateChords - An array of chords (themselves arrays of notes).
     * @param {Array<Number>} notes - An array of notes to check against the candidateChords.
     * @return {Array<Array<Number>>} - An array that contains all the chords that include the specified notes.
     *
     */
    flock.midi.interchange.demos.bifrost.findChordsWithNotes = function (candidateChords, notes) {
        var chordsWithNotes = [];
        fluid.each(candidateChords, function (candidateChord) {
            if (flock.midi.interchange.demos.bifrost.chordHasNotes(candidateChord, notes)) {
                chordsWithNotes.push(candidateChord);
            }
        });
        return chordsWithNotes;
    };

    /**
     *
     * Calculate the distinct offsets for an array chords.  Used to display the allowed notes.
     *
     * @param {Array<Array<Number>>} chords - An array of chords, which are themselves arrays of notes.
     * @return {Array<Number>} - The distinct "offsets" (modulo 12).
     */
    flock.midi.interchange.demos.bifrost.distinctOffsets = function (chords) {
        var offsetMap = {};
        fluid.each(chords, function (chord) {
            fluid.each(chord, function (note) {
                var noteAsInt = parseInt(note, 10);
                offsetMap[noteAsInt % 12] = true;
            });
        });
        var distinctOffsets = flock.midi.interchange.demos.bifrost.mapToIntArray(offsetMap);
        return distinctOffsets;
    };

    flock.midi.interchange.demos.bifrost.mapToIntArray = function (map) {
        var distinctIntMap = {};
        fluid.each(map, function (value, key) {
            if (value) {
                distinctIntMap[key] = true;
            }
        });
        var keysAsStrings = Object.keys(distinctIntMap);
        var keysAsInts = fluid.transform(keysAsStrings, function (key) { return parseInt(key, 10);});
        return keysAsInts;
    };

    flock.midi.interchange.demos.bifrost.handleNoteOn = function (that, originalMessage) {
        var transformedMessage = fluid.model.transformWithRules(originalMessage, flock.midi.interchange.tunings.launchpadPro.common);

        // When adding notes, we can filter what's currently possible down to just chords that include the new note.
        var possibleChords = flock.midi.interchange.demos.bifrost.findChordsWithNotes(that.allowedChords, [transformedMessage.note]);

        // There are chords possible with the added note, so play, display, et cetera.
        if (possibleChords.length) {
            // Update the list of "held" notes (the actual MIDI input value)
            that.activeNotes[transformedMessage.note] = true;

            // Update the list of distinct relative notes.
            that.activeOffsets[transformedMessage.note % 12] = true;

            // Filter the current list of possible chords to just the ones that include the new note.
            that.allowedChords = possibleChords;

            // Update the device UI.
            flock.midi.interchange.demos.bifrost.paintDevice(that);

            // Pass the note along to the output device.
            // TODO: break this behaviour down further and perhaps improve the offset->note generation.
            if (transformedMessage.note > 0 && transformedMessage.note < 128) {
                that.sendToNoteOut(transformedMessage);
            }
        }
    };

    // TODO: function to paint the bottom controls with their respective colours (same as velocity!)

    flock.midi.interchange.demos.bifrost.paintDevice = function (that) {
        var activeNotesAsArray = flock.midi.interchange.demos.bifrost.mapToIntArray(that.activeNotes);
        if (activeNotesAsArray.length) {
            var valueArray = [];
            var allowedOffsets = flock.midi.interchange.demos.bifrost.distinctOffsets(that.allowedChords);
            // We should only be trying to paint notes 20-83.
            for (var a = 20; a < 84; a++ ) {
                var offset = a % 12;
                if (that.activeNotes[a]) {
                    valueArray.push(1);
                }
                else if (that.activeOffsets[offset]) {
                    valueArray.push(0.65);
                }
                else if (allowedOffsets.indexOf(offset) !== -1) {
                    valueArray.push(0.15);
                }
                else {
                    valueArray.push(0);
                }
            }

            flock.midi.interchange.demos.bifrost.sendValueArrayToDevice(that, valueArray);
        }
        else {
            flock.midi.interchange.demos.bifrost.sendValueArrayToDevice(that, that.options.valueSchemes.allNotesToDefault)
        }
    };

    flock.midi.interchange.demos.bifrost.generateColourArray = function (that, valueArray) {
        var colourArray = [];

        fluid.each(valueArray, function (singleValue) {
            colourArray.push(flock.midi.interchange.demos.bifrost.calculateSingleColor(that, "r", singleValue));
            colourArray.push(flock.midi.interchange.demos.bifrost.calculateSingleColor(that, "g", singleValue));
            colourArray.push(flock.midi.interchange.demos.bifrost.calculateSingleColor(that, "b", singleValue));
        });

        return colourArray;
    };

    // TODO: Puzzle out how we want to handle brightness and contrast.
    flock.midi.interchange.demos.bifrost.calculateSingleColor = function (that, channel, value) {
        var colourLevel = fluid.get(that.model.colourLevels, channel);
        var calculatedColourLevel = Math.round(that.model.brightness * colourLevel * value);
        return calculatedColourLevel;
    };


    flock.midi.interchange.demos.bifrost.sendValueArrayToDevice = function (that, valueArray) {
        var header = [
            // common header
            0, 0x20, 0x29, 0x02, 0x10,
            // "RGB Grid Sysex" command
            0xF,
            // 0: all pads, 1: square drum pads only.
            1
        ];
        var colourArray = flock.midi.interchange.demos.bifrost.generateColourArray(that, valueArray);
        var data = header.concat(colourArray);
        that.sendToUi({
            type: "sysex",
            data: data
        });

        // Paint the "side velocity" (0x63) a colour that matches the colour scheme.
        // F0h 00h 20h 29h 02h 10h 0Ah <velocity> <Colour> F7h
        that.sendToUi({ type: "sysex", data: [0, 0x20, 0x29, 0x02, 0x10, 0xA, 0x63, that.model.colourLevels.velocity]});

        fluid.each(that.options.colourSchemes, function (colourScheme) {
            if (colourScheme.control) {
                that.sendToUi({ type: "control", channel: 0, number: colourScheme.control, value: colourScheme.velocity});
            }
        })
    };

    flock.midi.interchange.demos.bifrost.noteMapToOffsets = function (map) {
        var offsetMap = {};
        fluid.each(map, function (value, key) {
            if (value) {
                offsetMap[key % 12] = true;
            }
        });
        return flock.midi.interchange.demos.bifrost.mapToIntArray(offsetMap);
    };

    flock.midi.interchange.demos.bifrost.handleNoteOff = function (that, originalMessage) {
        var transformedMessage = fluid.model.transformWithRules(originalMessage, flock.midi.interchange.tunings.launchpadPro.common);

        // Remove the note from the list of "held" notes (actual MIDI input value) if it's there.
        that.activeNotes[transformedMessage.note] = false;

        // Update the list of distinct relative notes (%12 values) based on the held notes.
        var offsetsAsArray = flock.midi.interchange.demos.bifrost.noteMapToOffsets(that.activeNotes);
        that.activeOffsets = fluid.arrayToHash(offsetsAsArray);

        // Generate an updated list of allowed chords.  For now, seems like we have to do a full pass to bring material back.
        var allowedChords = flock.midi.interchange.demos.bifrost.findChordsWithNotes(flock.midi.interchange.demos.chordinator.allChords, offsetsAsArray);
        that.allowedChords = allowedChords;

        flock.midi.interchange.demos.bifrost.paintDevice(that);

        // Pass the note along to the output device (we could make this conditional, but it's harmless).
        that.sendToNoteOut(transformedMessage);
    };

    flock.midi.interchange.demos.bifrost.handleControl = function (that, midiMessage) {
        if (midiMessage.value) {
            // CCs one through eight control the colour
            var colourScheme = fluid.find(that.options.colourSchemes, function (candidateColourScheme) {
                return candidateColourScheme.control === midiMessage.number ? candidateColourScheme : undefined;
            });
            if (colourScheme) {
                that.applier.change("colourLevels", colourScheme);
            }

            // TODO: Add support for brightness, contrast.
        }
    };

    // TODO: Make a generalised pattern for this, we use it so so often.
    flock.midi.interchange.demos.bifrost.sendToOutput = function (outputComponent, message) {
        var outputConnection = fluid.get(outputComponent, "connection");
        if (outputConnection) {
            outputConnection.send(message);
        }
    };

    // Although this grade has a lot in common with the ODA loom and transforming router, it is currently separate
    // because many of its checks prevent messages from being transported.  Need to come up with a pattern for this,
    // perhaps updating the transforming router grade to filter notes that transform to `false`, and also a means of
    // handling "asymmetric" UI and note outputs that need different transforms.
    fluid.defaults("flock.midi.interchange.demos.bifrost", {
        gradeNames: ["fluid.viewComponent"],
        preferredInputDevice:    "Launchpad Pro Standalone Port",
        preferredUIOutputDevice: "Launchpad Pro Standalone Port",
        model: {
            brightness: 63,
            contrast:   1,
            colourLevels: "{that}.options.colourSchemes.white"
        },
        valueSchemes: {
            allNotesToDefault: "@expand:fluid.generate(64, 0.125)" // 0.125, note awaiting selection
        },
        colourSchemes: {
            white:  { r: 1, g: 1,    b: 1, control: 1, velocity: 1  },
            red:    { r: 1, g: 0,    b: 0, control: 2, velocity: 5 },
            orange: { r: 1, g: 0.25, b: 0, control: 3, velocity: 9  }, // In HTML the RGB values for orange would be way off, but for the Launchpad Pro it works.
            yellow: { r: 1, g: 1,    b: 0, control: 4, velocity: 13 },
            green:  { r: 0, g: 1,    b: 0, control: 5, velocity: 17 },
            blue:   { r: 0, g: 1,    b: 1, control: 6, velocity: 90 },
            indigo: { r: 0, g: 0,    b: 1, control: 7, velocity: 79 },
            violet: { r: 1, g: 0,    b: 1, control: 8, velocity: 53 }
        },
        setupMessages: [
            // TODO: Figure out how to reuse this more cleanly.
            // Boilerplate sysex to set mode and layout, see:
            // https://customer.novationmusic.com/sites/customer/files/novation/downloads/10598/launchpad-pro-programmers-reference-guide_0.pdf
            // All sysex messages for the launchpad pro have the same header (framing byte removed)
            // 00h 20h 29h 02h 10h
            // Select "standalone" mode.
            { type: "sysex", data: [0, 0x20, 0x29, 0x02, 0x10, 33, 1] },
            // Select "programmer" layout
            { type: "sysex", data: [0, 0x20, 0x29, 0x02, 0x10, 44, 3]}
        ],
        members: {
            activeOffsets: {},
            activeNotes:   {},
            allowedChords: flock.midi.interchange.demos.chordinator.allChords,
        },
        events: {
            control: "{noteInput}.events.control",
            noteOn:  "{noteInput}.events.noteOn",
            noteOff: "{noteInput}.events.noteOff"
        },
        selectors: {
            noteInput:  ".note-input",
            noteOutput: ".note-output",
            uiOutput:   ".ui-output"
        },
        components: {
            enviro: {
                type: "flock.enviro"
            },
            noteInput: {
                type: "flock.auto.ui.midiConnector",
                container: "{that}.dom.noteInput",
                options: {
                    preferredDevice: "{bifrost}.options.preferredInputDevice",
                    portType: "input",
                    components: {
                        midiPortSelector: {
                            options: {
                                strings: {
                                    selectBoxLabel: "Note Input",
                                }
                            }
                        }
                    }
                }
            },
            noteOutput: {
                type: "flock.auto.ui.midiConnector",
                container: "{that}.dom.noteOutput",
                options: {
                    preferredDevice: "{bifrost}.options.preferredOutputDevice",
                    portType: "output",
                    components: {
                        midiPortSelector: {
                            options: {
                                strings: {
                                    selectBoxLabel: "Note Output",
                                }
                            }
                        }
                    }
                }
            },
            uiOutput: {
                type: "flock.auto.ui.midiConnector",
                container: "{that}.dom.uiOutput",
                options: {
                    portType: "output",
                    preferredDevice: "{bifrost}.options.preferredUIOutputDevice",
                    components: {
                        connection: {
                            options: {
                                sysex: true, // Required to configure the Launchpad Pro.
                                listeners: {
                                    "onReady.setupDevice": {
                                        funcName: "fluid.each",
                                        args:     ["{bifrost}.options.setupMessages", "{bifrost}.sendToUi"]
                                    },
                                    "onReady.paintKeys": {
                                        funcName: "flock.midi.interchange.demos.bifrost.sendValueArrayToDevice",
                                        args: ["{bifrost}", "{bifrost}.options.valueSchemes.allNotesToDefault"]
                                    }
                                }
                            }
                        },
                        midiPortSelector: {
                            options: {
                                strings: {
                                    selectBoxLabel: "UI Output",
                                }
                            }
                        }
                    }
                }
            }
        },
        invokers: {
            sendToNoteOut: {
                funcName: "flock.midi.interchange.demos.bifrost.sendToOutput",
                args: ["{noteOutput}", "{arguments}.0"] // outputComponent, message
            },
            sendToUi: {
                funcName: "flock.midi.interchange.demos.bifrost.sendToOutput",
                args: ["{uiOutput}", "{arguments}.0"] // outputComponent, message
            }
        },
        listeners: {
            "noteOn.handle": {
                funcName: "flock.midi.interchange.demos.bifrost.handleNoteOn",
                args: ["{that}", "{arguments}.0"] // midiMessage
            },
            "noteOff.handle": {
                funcName: "flock.midi.interchange.demos.bifrost.handleNoteOff",
                args: ["{that}", "{arguments}.0"] // midiMessage
            },
            "control.handle": {
                funcName: "flock.midi.interchange.demos.bifrost.handleControl",
                args: ["{that}", "{arguments}.0"] // midiMessage
            }
        },
        modelListeners: {
            "brightness": {
                excludeSource: "init",
                funcName: "flock.midi.interchange.demos.bifrost.paintDevice",
                args: ["{that}"]
            },
            "contrast": {
                excludeSource: "init",
                funcName: "flock.midi.interchange.demos.bifrost.paintDevice",
                args: ["{that}"]
            },
            "colourLevels": {
                excludeSource: "init",
                funcName: "flock.midi.interchange.demos.bifrost.paintDevice",
                args: ["{that}"]
            }
        }
    });
})(fluid);
