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
        gradeNames: ["fluid.viewComponent"],
        mergePolicy: {
            "uiPaintMessages": "nomerge"
        },
        uiPaintMessages: {
            startup: []
        },
        selectors: {
            input: ".device-input-container",
            noteOutput: ".midi-output-container",
            output: ".device-output-container",
            oda: ".oda-container"
        },
        invokers: {
            paintDevice: {
                funcName: "flock.midi.interchange.oda.paintDevice",
                args:     ["{that}", "{output}", "{arguments}.0"] // notesToPaint
            }
        },
        components: {
            enviro: {
                type: "flock.enviro"
            },
            router: {
                type: "flock.midi.interchange.transformingRouter",
                options: {
                    events: {
                        note:       "{input}.events.note",
                        control:    "{input}.events.control",
                        program:    "{input}.events.program",
                        aftertouch: "{input}.events.aftertouch",
                        pitchbend:  "{input}.events.pitchbend"
                    },
                    listeners: {
                        "onTransformedMessage.sendMessage": {
                            funcName: "flock.midi.interchange.transformingRouterHarness.sendTransformedMessage",
                            args: ["{noteOutput}", "{arguments}.0"] // outputComponent, transformedMessage
                        }
                    }
                }
            },
            input: {
                type: "flock.auto.ui.midiConnector",
                container: "{that}.dom.input",
                options: {
                    portType: "input",
                    preferredDevice: "{loom}.options.preferredDevice",
                    listeners: {
                        "control.display": {
                            func: "{oda}.events.control.fire",
                            args: ["{arguments}.0"]
                        },
                        "note.display": {
                            func: "{oda}.events.note.fire",
                            args: ["{arguments}.0"]
                        }
                        //,
                        //"message.relayToOutput": {
                        //    funcName: "flock.midi.interchange.oda.relayMessage",
                        //    args: ["{noteOutput}", "{arguments}.0"] // message
                        //}
                    },
                    components: {
                        midiPortSelector: {
                            options: {
                                strings: {
                                    selectBoxLabel: "Device Input",
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
                    portType: "output",
                    components: {
                        midiPortSelector: {
                            options: {
                                strings: {
                                    selectBoxLabel: "MIDI Output",
                                }
                            }
                        }
                    }
                }
            },
            output: {
                type: "flock.auto.ui.midiConnector",
                container: "{that}.dom.output",
                options: {
                    preferredDevice: "{loom}.options.preferredDevice",
                    portType: "output",
                    components: {
                        midiPortSelector: {
                            options: {
                                strings: {
                                    selectBoxLabel: "Device UI Output",
                                }
                            }
                        },
                        connection: {
                            options: {
                                listeners: {
                                    "onReady.paintDevice": {
                                        funcName: "flock.midi.interchange.oda.paintDevice",
                                        args:     ["{loom}", "{output}", "{loom}.options.uiPaintMessages.startup"] // output, notesToPaint
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
                        "outputMessage.sendToOutput": {
                            funcName: "flock.midi.interchange.oda.relayMessage",
                            args: ["{noteOutput}", "{arguments}.0"]
                        },
                        "outputMessage.loopback": {
                            funcName: "flock.midi.interchange.oda.relayMessage",
                            args: ["{output}", "{arguments}.0"]
                        }
                    }
                }
            }
        }
    })
})(fluid, flock);
