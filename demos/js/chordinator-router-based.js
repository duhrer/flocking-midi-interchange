/*

    A partial refactor of the choordinator to use transforming routers, stopped because of the asymmetry between UI
    output and note output, which does not match the previous model.

 */
(function (fluid) {
    "use strict";
    var flock = fluid.registerNamespace("flock");

    fluid.defaults("flock.midi.interchange.demos.chordinator.noteRouter", {
        gradeNames: ["flock.midi.interchange.transformingRouter"],
        members: {
            activeOffsets: {},
            activeNotes:   {},
            allowedChords: flock.midi.interchange.demos.chordinator.allChords,
        },
        rules: {
            // TODO: Write an invoker to transform note inputs using the above logic.
            // TODO: Adapt the "common tuning" from flock.midi.interchange.tunings.launchpadPro.common.note
            note: { "": "" },

            // TODO: Need some kind of transform for the UI output as well, review earlier work.

            // Mute all other types of messages by ensuring that the transforms result in `false` output.
            control: "{transformingRouter}.options.rules.mute",
            program: "{transformingRouter}.options.rules.mute",
            aftertouch: "{transformingRouter}.options.rules.mute",
            pitchbend: "{transformingRouter}.options.rules.mute",
            sysex: "{transformingRouter}.options.rules.mute",
            songPointer: "{transformingRouter}.options.rules.mute",
            songSelect: "{transformingRouter}.options.rules.mute",
            tuneRequest: "{transformingRouter}.options.rules.mute",
            clock: "{transformingRouter}.options.rules.mute",
            start: "{transformingRouter}.options.rules.mute",
            continue: "{transformingRouter}.options.rules.mute",
            stop: "{transformingRouter}.options.rules.mute",
            activeSense: "{transformingRouter}.options.rules.mute",
            reset: "{transformingRouter}.options.rules.mute"
        }
    });

    fluid.defaults("flock.midi.interchange.demos.chordinator.loom", {
        gradeNames: ["flock.midi.interchange.oda.launchpadPro.loom"],
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
        invokers: {
            noop: {
                funcName: "fluid.identity"
            }
        },
        components: {
            // Route notes from the note input
            router: {
                type: "flock.midi.interchange.demos.chordinator.noteRouter"
            },
            uiRouter: {

            },
            oda: {
                options: {
                    listeners: {
                        // Neuter the ODA->device message pipeline so that we don't clobber the UI.
                        "outputMessage.loopback": {
                            funcName: "fluid.identity"
                        }
                    }
                }
            },
            noteInput: {
                options: {
                    listeners: {
                        "control.displayOnOda": {
                            func: "{flock.midi.interchange.demos.chordinator.loom}.noop"
                        },
                        "note.displayOnOda": {
                            func: "{flock.midi.interchange.demos.chordinator.loom}.noop"
                        },
                        "control.displayOnUiOutput": {
                            func: "{flock.midi.interchange.demos.chordinator.loom}.noop"
                        },
                        "note.displayOnUiOutput": {
                            func: "{flock.midi.interchange.demos.chordinator.loom}.noop"
                        }
                    }
                }
            }
        }
    });
})(fluid);
