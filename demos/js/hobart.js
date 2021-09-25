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

    fluid.registerNamespace("flock.midi.interchange.demos.hobart");

    flock.midi.interchange.demos.hobart.handleMidiEvent = function (that) {
        that.elapsedBeats++;

        // Switch polarity of phase.
        if (that.elapsedBeats % that.options.phaseTransition === 0) {
            that.hobartPhase = !(that.hobartPhase);
        }

        var connection = fluid.get(that, "noteOutput.connection");
        if (connection) {
            // song pointer only required for "Hobart phase" (I think).
            if (that.hobartPhase) {
                that.songPointerBeat--;
            }
            else {
                that.songPointerBeat++;
            }

            connection.send({
                type: "songPointer",
                value: that.songPointerBeat
            });

            connection.send({
                type: "clock"
            });
        }
    };

    fluid.defaults("flock.midi.interchange.demos.hobart", {
        gradeNames: ["fluid.viewComponent"],
        preferredInputDevice:    "QUNEO",
        preferredOutputDevice: "Scarlett 8i6 USB",
        phaseTransition: 120,
        maxBeat: 16384, // TODO: copied from eye-of-agamidi, haven't tried other values yet!
        members: {
            hobartPhase: false,
            elapsedBeats: 0,
            songPointerBeat: 0
        },
        events: {
            noteOn:  "{noteInput}.events.noteOn",
            noteOff: "{noteInput}.events.noteOff",
            control: "{noteInput}.events.control"
        },
        selectors: {
            noteInput:  ".note-input",
            noteOutput: ".note-output"
        },
        components: {
            noteInput: {
                type: "flock.midi.connectorView",
                container: "{that}.dom.noteInput",
                options: {
                    preferredPort: "{hobart}.options.preferredInputDevice",
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
                type: "flock.midi.connectorView",
                container: "{that}.dom.noteOutput",
                options: {
                    preferredPort: "{hobart}.options.preferredOutputDevice",
                    portType: "output",
                    components: {
                        connection: {
                            options: {
                                listeners: {
                                    "onReady.unleashHeck": {
                                        funcName: "{that}.send",
                                        args: [{ type: "start"}]
                                    }
                                }
                            }
                        },
                        midiPortSelector: {
                            options: {
                                strings: {
                                    selectBoxLabel: "Note Output",
                                }
                            }
                        }
                    }
                }
            }
        },
        listeners: {
            "noteOn.handle": {
                funcName: "flock.midi.interchange.demos.hobart.handleMidiEvent",
                args: ["{that}", "{arguments}.0"] // midiMessage
            },
            "noteOff.handle": {
                funcName: "flock.midi.interchange.demos.hobart.handleMidiEvent",
                args: ["{that}", "{arguments}.0"] // midiMessage
            },
            "control.handle": {
                funcName: "flock.midi.interchange.demos.hobart.handleMidiEvent",
                args: ["{that}", "{arguments}.0"] // midiMessage
            }
        }
    });
})(fluid);
