/*

    A harness that tunes the launchpad to "common" tuning and also paints each note a consistent colour across the
    range of notes.

 */
(function (fluid) {
    "use strict";
    var flock = fluid.registerNamespace("flock");

    fluid.registerNamespace("flock.midi.interchange.demos.highlight");

    flock.midi.interchange.demos.highlight.handleNoteOn = function (that, originalMessage) {
        var transformedMessage = fluid.model.transformWithRules(originalMessage, flock.midi.interchange.tunings.launchpadPro.common);
        that.sendToNoteOut(transformedMessage);
    };

    flock.midi.interchange.demos.highlight.paintUi = function (that) {
        var header = [
            // common header
            0, 0x20, 0x29, 0x02, 0x10,
            // "RGB Grid Sysex" command
            0xF,
            // 0: all pads, 1: square drum pads only.
            1
        ];

        //var singleOctave = [
        //    252, 226,   9, // C
        //     63,  63,  63, // C#
        //     22, 169, 224, // D
        //     63,  63,  63, // D#
        //    200, 120,  35, // E
        //     19, 150, 111, // F
        //     63,  63,  63, // F#
        //    238,  10, 132, // G
        //     63,  63,  63, // G#
        //    255, 255, 255, // A
        //     63,  63,  63, // A#
        //      0,   0,   0, // B
        //];

        //var singleOctave = fluid.flatten(fluid.generate(12, [127, 127, 127]));

        var singleOctave = [
            126, 126,   0, // C
             16,  16,  16, // C#
              0,   0, 127, // D
             16,  16,  16, // D#
             16,   8,   0, // E
              0,  127,  0, // F
             16,  16,  16, // F#
            119,   5,  66, // G
             16,  16,  16, // G#
            127, 127, 127, // A
             16,  16,  16, // A#
              0,   0,   0, // B
        ];

        var fullPad = fluid.flatten(fluid.generate(6, singleOctave)).slice(0, 64 * 3);
        var data = header.concat(fullPad);

        that.sendToUi({
            type: "sysex",
            data: data
        });
    };

    flock.midi.interchange.demos.highlight.handleNoteOff = function (that, originalMessage) {
        var transformedMessage = fluid.model.transformWithRules(originalMessage, flock.midi.interchange.tunings.launchpadPro.common);

        // Pass the note along to the output device (we could make this conditional, but it's harmless).
        that.sendToNoteOut(transformedMessage);
    };

    // TODO: Make a generalised pattern for this, we use it so so often.
    flock.midi.interchange.demos.highlight.sendToOutput = function (outputComponent, message) {
        var outputConnection = fluid.get(outputComponent, "connection");
        if (outputConnection) {
            outputConnection.send(message);
        }
    };

    fluid.defaults("flock.midi.interchange.demos.highlights", {
        gradeNames: ["fluid.viewComponent"],
        preferredInputDevice:    "Launchpad Pro Standalone Port",
        preferredUIOutputDevice: "Launchpad Pro Standalone Port",

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
            activeNotes: {}
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
            noteInput: {
                type: "flock.midi.connectorView",
                container: "{that}.dom.noteInput",
                options: {
                    preferredPort: "{highlights}.options.preferredInputDevice",
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
                    preferredPort: "{highlights}.options.preferredOutputDevice",
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
                type: "flock.midi.connectorView",
                container: "{that}.dom.uiOutput",
                options: {
                    portType: "output",
                    preferredPort: "{highlights}.options.preferredUIOutputDevice",
                    components: {
                        connection: {
                            options: {
                                sysex: true, // Required to configure the Launchpad Pro.
                                listeners: {
                                    "onReady.setupDevice": {
                                        funcName: "fluid.each",
                                        args:     ["{highlights}.options.setupMessages", "{highlights}.sendToUi"]
                                    },
                                    "onReady.paintDevice": {
                                        funcName: "flock.midi.interchange.demos.highlight.paintUi",
                                        args: ["{highlights}"]
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
                funcName: "flock.midi.interchange.demos.highlight.sendToOutput",
                args: ["{noteOutput}", "{arguments}.0"] // outputComponent, message
            },
            sendToUi: {
                funcName: "flock.midi.interchange.demos.highlight.sendToOutput",
                args: ["{uiOutput}", "{arguments}.0"] // outputComponent, message
            }
        },
        listeners: {
            "noteOn.handle": {
                funcName: "flock.midi.interchange.demos.highlight.handleNoteOn",
                args: ["{that}", "{arguments}.0"] // midiMessage
            },
            "noteOff.handle": {
                funcName: "flock.midi.interchange.demos.highlight.handleNoteOff",
                args: ["{that}", "{arguments}.0"] // midiMessage
            }
        }
    });
})(fluid);
