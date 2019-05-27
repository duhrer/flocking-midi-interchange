/*

    A router that monitors the "held" notes and ensures that only additional notes that would make a chord
    can be played.  Note that chord detection is limited to minor, major, augmented, diminished, and some 7th chords.

    When each note is played:

    1. It is "deoctavised", i.e. only its relative position within the octave is considered (note % 12).
    2. The note is compared to any "held" notes.
    3. If the new note would form a chord if added to the held notes, it is played and added to the "held" notes.
    4. If the new note would not form a chord, it is not played or added to the list of "held" notes.

    Note that because of "deoctavising", you are always allowed to play any "held" note in another octave.

    Each chord can be shifted up to 4 places higher, and notes "wrap" between octaves.  As an example, here are the
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

    fluid.registerNamespace("flock.midi.interchange.demos.chordinator");

    /**
     *
     * Confirm whether a single chord (array of notes) contains an individual note.
     *
     * @param {Array<Number>} chord - An array of notes representing a chord.
     * @param {Array<Number>} notes - An array of notes to check against the chord.
     * @return {Boolean} - `true` if the chord has all the notes, `false` otherwise.
     *
     */
    flock.midi.interchange.demos.chordinator.chordHasNotes = function (chord, notes) {
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
    flock.midi.interchange.demos.chordinator.findChordsWithNotes = function (candidateChords, notes) {
        var chordsWithNotes = [];
        fluid.each(candidateChords, function (candidateChord) {
            if (flock.midi.interchange.demos.chordinator.chordHasNotes(candidateChord, notes)) {
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
    flock.midi.interchange.demos.chordinator.distinctOffsets = function (chords) {
        var offsetMap = {};
        fluid.each(chords, function (chord) {
            fluid.each(chord, function (note) {
                var noteAsInt = parseInt(note, 10);
                offsetMap[noteAsInt % 12] = true;
            });
        });
        var distinctOffsets = flock.midi.interchange.demos.chordinator.mapToIntArray(offsetMap);
        return distinctOffsets;
    };

    flock.midi.interchange.demos.chordinator.mapToIntArray = function (map) {
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

    flock.midi.interchange.demos.chordinator.allNotesForOffsets = function (offsets) {
        var allNotes = [];

        fluid.each(offsets, function (offset) {
            for (var a = 0; a < 11; a++) {
                var octaveOffset = a * 12;
                allNotes.push(offset + octaveOffset);
            }
        });

        return allNotes;
    };

    flock.midi.interchange.demos.chordinator.handleNoteOn = function (that, originalMessage) {
        var transformedMessage = fluid.model.transformWithRules(originalMessage, flock.midi.interchange.tunings.launchpadPro.common);

        // When adding notes, we can filter what's currently possible down to just chords that include the new note.
        var possibleChords = flock.midi.interchange.demos.chordinator.findChordsWithNotes(that.allowedChords, [transformedMessage.note]);

        // There are chords possible with the added note, so play, display, et cetera.
        if (possibleChords.length) {
            // Update the list of "held" notes (the actual MIDI input value)
            that.activeNotes[transformedMessage.note] = true;

            // Update the list of distinct relative notes.
            that.activeOffsets[transformedMessage.note % 12] = true;

            // Filter the current list of possible chords to just the ones that include the new note.
            that.allowedChords = possibleChords;

            var activeNotesAsArray = flock.midi.interchange.demos.chordinator.mapToIntArray(that.activeNotes);
            // Everything is still possible until there are at least two held notes.
            if (activeNotesAsArray.length > 1) {
                var allowedOffsets = flock.midi.interchange.demos.chordinator.distinctOffsets(possibleChords);
                flock.midi.interchange.demos.chordinator.paintAllowedNotes(that, allowedOffsets);
            }
            else {
                that.sendToUi(that.options.uiPaintMessages.allWhite);
            }

            // Pass the note along to the output device.
            // TODO: break this behaviour down further and perhaps improve the offset->note generation.
            if (transformedMessage.note > 0 && transformedMessage.note < 128) {
                that.sendToNoteOut(transformedMessage);
            }
        }
    };

    // TODO: Note positions always appear to be the same, and are always wrong.
    flock.midi.interchange.demos.chordinator.paintAllowedNotes = function (that, allowedOffsets) {
        that.sendToUi(that.options.uiPaintMessages.allBlack);

        // Update the UIs with the range of remaining allowed notes. that.sendToUi and that.oda.X
        var allowedNotes = flock.midi.interchange.demos.chordinator.allNotesForOffsets(allowedOffsets);
        fluid.each(allowedNotes, function (allowedNote) {
            var originalMessage = {
                channel: 0,
                type: "noteOn",
                note: allowedNote, // TODO: This screams out for a proper transform either in the input, the routing, or the output.
                velocity: 3, // White.
            };

            // transform back to the UI tuning for the Launchpad Pro
            var invertedTransform = fluid.model.transform.invertConfiguration(flock.midi.interchange.tunings.launchpadPro.common);
            var invertedMessage= fluid.model.transformWithRules(originalMessage, invertedTransform);

            // TODO: break this behaviour down further and perhaps improve the offset->note generation.
            if (invertedMessage.note > 0 && invertedMessage.note < 128) {
                // TODO: remove
                console.log(JSON.stringify(invertedMessage));
                that.sendToUi(invertedMessage);
            }
        });
    };

    flock.midi.interchange.demos.chordinator.noteMapToOffsets = function (map) {
        var offsetMap = {};
        fluid.each(map, function (value, key) {
            if (value) {
                offsetMap[key % 12] = true;
            }
        });
        return flock.midi.interchange.demos.chordinator.mapToIntArray(offsetMap);
    };


    flock.midi.interchange.demos.chordinator.handleNoteOff = function (that, originalMessage) {
        var transformedMessage = fluid.model.transformWithRules(originalMessage, flock.midi.interchange.tunings.launchpadPro.common);

        // Remove the note from the list of "held" notes (actual MIDI input value) if it's there.
        that.activeNotes[transformedMessage.note] = false;

        // Update the list of distinct relative notes (%12 values) based on the held notes.
        var offsetsAsArray = flock.midi.interchange.demos.chordinator.noteMapToOffsets(that.activeNotes);
        that.activeOffsets = fluid.arrayToHash(offsetsAsArray);

        // Generate an updated list of allowed chords.  For now, seems like we have to do a full pass to bring material back.
        var allowedChords = flock.midi.interchange.demos.chordinator.findChordsWithNotes(flock.midi.interchange.demos.chordinator.allChords, offsetsAsArray);
        that.allowedChords = allowedChords;

        var activeNotesAsArray = flock.midi.interchange.demos.chordinator.mapToIntArray(that.activeNotes);
        // Everything is still possible until there are at least two held notes.
        if (activeNotesAsArray.length > 1) {
            // Update the UI with the range of remaining allowed notes.
            var allowedOffsets = flock.midi.interchange.demos.chordinator.distinctOffsets(allowedChords);
            flock.midi.interchange.demos.chordinator.paintAllowedNotes(that, allowedOffsets);
        }
        else {
            that.sendToUi(that.options.uiPaintMessages.allWhite);
        }

        // Pass the note along to the output device (we could make this conditional, but it's harmless).
        that.sendToNoteOut(transformedMessage);
    };

    // TODO: Make a generalised pattern for this, we use it so so often.
    flock.midi.interchange.demos.chordinator.sendToOutput = function (outputComponent, message) {
        var outputConnection = fluid.get(outputComponent, "connection");
        if (outputConnection) {
            outputConnection.send(message);
        }
    };

    //flock.midi.interchange.demos.chordinator.handleOdaMessage = function (that, midiMessage) {
    //    if (midiMessage.type === "noteOn") {
    //        flock.midi.interchange.demos.chordinator.handleNoteOn(that, midiMessage);
    //    }
    //    else if (midiMessage.type === "noteOff") {
    //        flock.midi.interchange.demos.chordinator.handleNoteOff(that, midiMessage);
    //    }
    //};

    // Although this grade has a lot in common with the ODA loom and transforming router, it is currently separate
    // because many of its checks prevent messages from being transported.  Need to come up with a pattern for this,
    // perhaps updating the transforming router grade to filter notes that transform to `false`, and also a means of
    // handling "asymmetric" UI and note outputs that need different transforms.
    fluid.defaults("flock.midi.interchange.demos.chordinator", {
        gradeNames: ["fluid.viewComponent"],
        preferredInputDevice:    "Launchpad Pro Standalone Port",
        preferredUIOutputDevice: "Launchpad Pro Standalone Port",
        uiPaintMessages: {
            allWhite: {
                type: "sysex", data: [
                    // common header
                    0, 0x20, 0x29, 0x02, 0x10,
                    // "RGB Grid Sysex" command
                    0xF,
                    // 0: all pads, 1: square drum pads only.
                    1,
                    // each row represents a single row of colour data as 8 sets of r, g, b values.
                    0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F,
                    0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F,
                    0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F,
                    0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F,
                    0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F,
                    0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F,
                    0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F,
                    0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F, 0x3F
                ]
            },
            // We don't particularly care if we clobber the control keys with black, so we don't need the full grid here.
            allBlack: {
                // All notes to a single colour
                // F0h 00h 20h 29h 02h 10h 0Eh <Colour> F7h
                type: "sysex", data: [0, 0x20, 0x29, 0x02, 0x10, 0xE, 0]
            },
            startup: [
                // TODO: Figure out how to reuse this more cleanly.
                // Boilerplate sysex to set mode and layout, see:
                // https://customer.novationmusic.com/sites/customer/files/novation/downloads/10598/launchpad-pro-programmers-reference-guide_0.pdf
                // All sysex messages for the launchpad pro have the same header (framing byte removed)
                // 00h 20h 29h 02h 10h
                // Select "standalone" mode.
                { type: "sysex", data: [0, 0x20, 0x29, 0x02, 0x10, 33, 1] },
                // Select "programmer" layout
                { type: "sysex", data: [0, 0x20, 0x29, 0x02, 0x10, 44, 3]},
                // Paint the "side LED" (0x63) white
                // F0h 00h 20h 29h 02h 10h 0Ah <LED> <Colour> F7h
                { type: "sysex", data: [0, 0x20, 0x29, 0x02, 0x10, 0xA, 0x63, 1]},
                "{that}.options.uiPaintMessages.allWhite"
            ]
        },
        members: {
            activeOffsets: {},
            activeNotes:   {},
            allowedChords: flock.midi.interchange.demos.chordinator.allChords,
        },
        events: {
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
                    preferredDevice: "{chordinator}.options.preferredInputDevice",
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
                    preferredDevice: "{chordinator}.options.preferredOutputDevice",
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
                    preferredDevice: "{chordinator}.options.preferredUIOutputDevice",
                    components: {
                        connection: {
                            options: {
                                sysex: true, // Required to configure the Launchpad Pro.
                                listeners: {
                                    "onReady.paintUiOutput": {
                                        funcName: "fluid.each",
                                        args:     ["{chordinator}.options.uiPaintMessages.startup", "{chordinator}.sendToUi"]
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
                funcName: "flock.midi.interchange.demos.chordinator.sendToOutput",
                args: ["{noteOutput}", "{arguments}.0"] // outputComponent, message
            },
            sendToUi: {
                funcName: "flock.midi.interchange.demos.chordinator.sendToOutput",
                args: ["{uiOutput}", "{arguments}.0"] // outputComponent, message
            }
        },
        listeners: {
            "noteOn.handle": {
                funcName: "flock.midi.interchange.demos.chordinator.handleNoteOn",
                args: ["{that}", "{arguments}.0"] // midiMessage
            },
            "noteOff.handle": {
                funcName: "flock.midi.interchange.demos.chordinator.handleNoteOff",
                args: ["{that}", "{arguments}.0"] // midiMessage
            }
        }
    });
})(fluid);
