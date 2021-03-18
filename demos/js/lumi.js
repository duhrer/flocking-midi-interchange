/*

    // All sysex messages for the launchpad pro have the same header (framing byte removed)
    // 00h 20h 29h 02h 10h
    // Select "standalone" mode.
    { type: "sysex", data: [0, 0x20, 0x29, 0x02, 0x10, 33, 1] },

    In MIDI Monitor, this looks like:

    F0 00 20 29 02 10 2C 03 F7

    These are the distinct messages we have observed ROLI products sending to the LUMI Keys, with brief explanations.

    Colour Change:

    // All sysex messages for the LUMI have the same header:
    // 00 21 10 (77) (there's one message with 78)






 */

(function (fluid) {
    "use strict";
    var flock = fluid.registerNamespace("flock");

    fluid.registerNamespace("flock.midi.interchange.demos.lumi");

    // TODO: Make a generalised pattern for this, we use it so so often.
    flock.midi.interchange.demos.lumi.sendToOutput = function (outputComponent, message) {
        var outputConnection = fluid.get(outputComponent, "connection");
        if (outputConnection) {
            outputConnection.send(message);
        }
    };

    fluid.defaults("flock.midi.interchange.demos.lumi", {
        gradeNames: ["fluid.viewComponent"],
        preferredInputDevice:    "LUMI Keys BLOCK",
        preferredUIOutputDevice: "LUMI Keys BLOCK",
        setupMessages: [
            // Set non-root notes to 1EF040
            // {
            //     type: "sysex",
            //     data: [
            //         0x00, 0x21, 0x10, 0x77, // Header
            //         0x3D , 0x10 , 0x20 , 0x04 , 0x10 , 0x78 , 0x1E , 0x7E , 0x03 , 0x67
            //     ]
            // }
            {
                type: "sysex",
                data: [
                    0x00, 0x21, 0x10, 0x77, // Header
                    0x3D , 0x10 , 0x20 , 0x04 , 0x10 , 0x78 , 0x1E , 0x7E , 0x03 , 0x67
                ]
            }

        ],
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
            noteInput: {
                type: "flock.midi.connectorView",
                container: "{that}.dom.noteInput",
                options: {
                    preferredPort: "{lumi}.options.preferredInputDevice",
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
                    preferredPort: "{lumi}.options.preferredOutputDevice",
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
                    preferredPort: "{lumi}.options.preferredUIOutputDevice",
                    components: {
                        connection: {
                            options: {
                                sysex: true,
                                listeners: {
                                    "onReady.setupDevice": {
                                        funcName: "fluid.each",
                                        args:     ["{lumi}.options.setupMessages", "{lumi}.sendToUi"]
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
                funcName: "flock.midi.interchange.demos.lumi.sendToOutput",
                args: ["{noteOutput}", "{arguments}.0"] // outputComponent, message
            },
            sendToUi: {
                funcName: "flock.midi.interchange.demos.lumi.sendToOutput",
                args: ["{uiOutput}", "{arguments}.0"] // outputComponent, message
            }
        },
        listeners: {
            "noteOn.handle": {
                func: "{that}.sendToNoteOut",
                args: ["{arguments}.0"] // midiMessage
            },
            "noteOff.handle": {
                func: "{that}.sendToNoteOut",
                args: ["{arguments}.0"] // midiMessage
            }
        }
    });
})(fluid);
