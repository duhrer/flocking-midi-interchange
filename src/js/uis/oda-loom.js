/*

    A "loom" to weave together a MIDI input and an Onscreen Device Analogue (by default, the reference ODA).

*/
(function (fluid, flock) {
    "use strict";

    fluid.registerNamespace("flock.midi.interchange.oda");

    flock.midi.interchange.oda.relayMessage = function (output, message) {
        var connection = fluid.get(output, "connection");
        if (connection) {
            connection.send(message);
        }
    };

    flock.midi.interchange.oda.paintDevice = function (that, output, notesToPaint) {
        fluid.each(notesToPaint, function (noteToPaint) {
            flock.midi.interchange.oda.relayMessage(output, noteToPaint);
        });
    };

    flock.midi.interchange.oda.paintOda = function (oda, notesToPaint) {
        fluid.each(notesToPaint, function (noteToPaint) {
            flock.midi.interchange.oda.paintFromMessage(oda, noteToPaint);
        });
    };

    fluid.defaults("flock.midi.interchange.oda.loom", {
        gradeNames: ["flock.midi.interchange.transformingRouterHarness"],
        mergePolicy: {
            "uiPaintMessages": "nomerge"
        },
        uiPaintMessages: {
            startup: []
        },
        selectors: {
            uiOutput: ".ui-output",
            oda: ".oda-container"
        },
        invokers: {
            paintDevice: {
                funcName: "flock.midi.interchange.oda.paintDevice",
                args:     ["{that}", "{uiOutput}", "{arguments}.0"] // notesToPaint
            }
        },
        components: {
            uiOutput: {
                type: "flock.midi.connectorView",
                container: "{that}.dom.uiOutput",
                options: {
                    preferredPort: "{loom}.options.preferredUiOutput",
                    portType: "output",
                    components: {
                        midiPortSelector: {
                            options: {
                                strings: {
                                    selectBoxLabel: "UI Output"
                                }
                            }
                        },
                        connection: {
                            options: {
                                listeners: {
                                    "onReady.paintUiOutput": {
                                        funcName: "flock.midi.interchange.oda.paintDevice",
                                        args:     ["{loom}", "{uiOutput}", "{loom}.options.uiPaintMessages.startup"] // output, notesToPaint
                                    },
                                    "onReady.paintOda": {
                                        funcName: "flock.midi.interchange.oda.paintOda",
                                        args:     ["{oda}", "{loom}.options.uiPaintMessages.startup"] // oda, notesToPaint
                                    }
                                }
                            }
                        }
                    }
                }
            },
            oda: {
                type: "flock.midi.interchange.oda",
                container: "{that}.dom.oda",
                options: {
                    listeners: {
                        // Play the note.
                        "outputMessage.sendToOutput": {
                            funcName: "flock.midi.interchange.oda.relayMessage",
                            args: ["{noteOutput}", "{arguments}.0"]
                        },
                        // Display the note on the connected "ui" device.
                        "outputMessage.loopback": {
                            funcName: "flock.midi.interchange.oda.relayMessage",
                            args: ["{uiOutput}", "{arguments}.0"]
                        }
                    }
                }
            },
            noteInput: {
                options: {
                    preferredPort: "{loom}.options.preferredInput",
                    listeners: {
                        "control.displayOnOda": {
                            func: "{oda}.events.control.fire",
                            args: ["{arguments}.0"]
                        },
                        "note.displayOnOda": {
                            func: "{oda}.events.note.fire",
                            args: ["{arguments}.0"]
                        },
                        "control.displayOnUiOutput": {
                            func: "{uiOutput}.events.control.fire",
                            args: ["{arguments}.0"]
                        },
                        "note.displayOnUiOutput": {
                            func: "{uiOutput}.events.note.fire",
                            args: ["{arguments}.0"]
                        }
                    }
                }
            }
        }
    });
})(fluid, flock);
