/* globals fluid, flock */
(function (fluid, flock) {
    "use strict";
    fluid.registerNamespace("flock.midi.interchange.demos.duet");

    // Inverse transform and send the note to our partner as visual feedback.
    flock.midi.interchange.demos.duet.sendPartnerUiNote = function (noteMessage, partnerRouter, outputComponent) {
        var outputConnection = fluid.get(outputComponent, "connection");
        var rules = fluid.get(partnerRouter, ["options", "rules", "note"]);
        if (outputConnection && rules) {
            var invertedRules = fluid.model.transform.invertConfiguration(rules);
            var transformedMessage = fluid.model.transformWithRules(noteMessage, invertedRules);
            outputConnection.send(transformedMessage);
        }
    };

    // TODO: make a note of playing notes and send anything playing on both to the combined output.  Should be a
    // model listener.

    // Keep track of how many times each note is currently being held.
    flock.midi.interchange.demos.duet.updateModel = function (duetHarness, message) {
        var increment = (message.type === "noteOn" && message.velocity) ? 1 : -1;
        var noteHeldCount = duetHarness.model.notes[message.note] + increment;
        duetHarness.applier.change(["notes", message.note], noteHeldCount);
    };

    // Play any notes that are held twice, stop, any that aren't.
    flock.midi.interchange.demos.duet.sendToCombinedOutput = function (duetHarness, combinedOutput, updatePath, updateValue) {
        var outputConnection = fluid.get(combinedOutput, "connection");

        if (outputConnection) {
            // Both pads have to hold a note to hit it (2) and release the note to stop it (0).
            if (updateValue !== 1) {

                var message = {
                    channel: 0,
                    type: updateValue === 2 ? "noteOn" : "noteOff",
                    note: parseInt(updatePath[updatePath.length - 1], 10),
                    // TODO: smoother handling of velocity.
                    velocity: updateValue === 2 ? 127 : 0
                };
                outputConnection.send(message);
            }
        }
    };

    flock.midi.interchange.demos.duet.paintLaunchPadPro = function (output) {
        var connection = fluid.get(output, "connection");
        if (connection) {
            fluid.each(
                // TODO: Figure out how to reuse this more cleanly.
                // Boilerplate sysex to set mode and layout, see:
                // https://customer.novationmusic.com/sites/customer/files/novation/downloads/10598/launchpad-pro-programmers-reference-guide_0.pdf
                // All sysex messages for the launchpad pro have the same header (framing byte removed)
                // 00h 20h 29h 02h 10h
                [
                    // Select "standalone" mode.
                    { type: "sysex", data: [0, 0x20, 0x29, 0x02, 0x10, 33, 1] },
                    // Select "programmer" layout
                    { type: "sysex", data: [0, 0x20, 0x29, 0x02, 0x10, 44, 3]},

                ],
                connection.send
            );
        }
    };

    fluid.defaults("flock.midi.interchange.demos.duet", {
        gradeNames: ["fluid.viewComponent"],
        selectors: {
            leftInput:      ".midi-left-input",
            rightInput:     ".midi-right-input",
            leftOutput:     ".midi-left-output",
            rightOutput:    ".midi-right-output",
            combinedOutput: ".midi-combined-output"
        },
        model: {
            notes: "@expand:fluid.generate(128,0)"
        },
        sysex: true,
        distributeOptions: [
            {
                source: "{that}.options.sysex",
                target: "{that flock.auto.midi.system}.options.sysex"
            },
            {
                source: "{that}.options.sysex",
                target: "{that flock.midi.connection}.options.sysex"
            }
        ],
        components: {
            enviro: {
                type: "flock.enviro"
            },
            leftInput: {
                type: "flock.auto.ui.midiConnector",
                container: "{that}.dom.leftInput",
                options: {
                    portType: "input"
                }
            },
            leftRouter: {
                type: "flock.midi.interchange.transformingRouter",
                options: {
                    events: {
                        note: "{leftInput}.events.note"
                    },
                    listeners: {
                        "onTransformedMessage.sendMessage": {
                            funcName: "flock.midi.interchange.demos.duet.sendPartnerUiNote",
                            args: ["{arguments}.0", "{rightRouter}", "{rightOutput}"] // noteMessage, partnerRouter, outputComponent
                        },
                        // Add/remove notes to combined model
                        "onTransformedMessage.updateModel": {
                            funcName: "flock.midi.interchange.demos.duet.updateModel",
                            args: ["{duet}", "{arguments}.0"] // duetHarness, noteMessage
                        }
                    }
                }
            },
            leftOutput: {
                type: "flock.auto.ui.midiConnector",
                container: "{that}.dom.leftOutput",
                options: {
                    portType: "output"
                }
            },
            rightInput: {
                type: "flock.auto.ui.midiConnector",
                container: "{that}.dom.rightInput",
                options: {
                    portType: "input"
                }
            },
            rightRouter: {
                type: "flock.midi.interchange.transformingRouter",
                options: {
                    events: {
                        note: "{rightInput}.events.note"
                    },
                    listeners: {
                        "onTransformedMessage.sendMessage": {
                            funcName: "flock.midi.interchange.demos.duet.sendPartnerUiNote",
                            args: ["{arguments}.0", "{leftRouter}", "{leftOutput}"] // noteMessage, partnerRouter, outputComponent
                        },
                        // Add/remove notes to combined model
                        "onTransformedMessage.updateModel": {
                            funcName: "flock.midi.interchange.demos.duet.updateModel",
                            args: ["{duet}", "{arguments}.0"] // duetHarness, noteMessage
                        }
                    }
                }
            },
            rightOutput: {
                type: "flock.auto.ui.midiConnector",
                container: "{that}.dom.rightOutput",
                options: {
                    portType: "output"
                }
            },
            combinedOutput: {
                type: "flock.auto.ui.midiConnector",
                container: "{that}.dom.combinedOutput",
                options: {
                    portType: "output"
                }
            }
        },
        modelListeners: {
            "notes.*": {
                excludeSource: "init",
                funcName: "flock.midi.interchange.demos.duet.sendToCombinedOutput",
                args: ["{duet}", "{combinedOutput}", "{change}.path", "{change}.value"] // duetHarness, combinedOutput, updatePath, updateValue
            }
        }
    });

    fluid.defaults("flock.midi.interchange.demos.duet.launchpad", {
        gradeNames: ["flock.midi.interchange.demos.duet"],
        components: {
            leftInput: {
                options: {
                    preferredDevice: "Launchpad"
                }
            },
            leftRouter: {
                options: {
                    rules: {
                        note: flock.midi.interchange.tunings.launchpad.common
                    }
                }
            },
            leftOutput: {
                options: {
                    preferredDevice: "Launchpad"
                }
            },
            rightInput: {
                options: {
                    preferredDevice: "Launchpad Pro Standalone Port"
                }
            },
            rightRouter: {
                options: {
                    rules: {
                        note: flock.midi.interchange.tunings.launchpadPro.common
                    }
                }
            },
            rightOutput: {
                options: {
                    preferredDevice: "Launchpad Pro Standalone Port",
                    components: {
                        connection: {
                            options: {
                                listeners: {
                                    "onReady.paintLaunchPadPro": {
                                        funcName: "flock.midi.interchange.demos.duet.paintLaunchPadPro",
                                        args:     ["{rightOutput}"] // output
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    });

    fluid.defaults("flock.midi.interchange.demos.duet.oddCouple", {
        gradeNames: ["flock.midi.interchange.demos.duet"],
        components: {
            leftInput: {
                options: {
                    preferredDevice: "Launchpad"
                }
            },
            leftRouter: {
                options: {
                    rules: {
                        note: flock.midi.interchange.tunings.launchpad.common
                    }
                }
            },
            leftOutput: {
                options: {
                    preferredDevice: "Launchpad"
                }
            },
            rightInput: {
                options: {
                    preferredDevice: "EIE"
                }
            },
            combinedOutput: {
                options: {
                    preferredDevice: "MIDI Patchbay Input"
                }
            }
        }
    });
})(fluid, flock);
