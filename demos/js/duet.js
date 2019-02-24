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
        var increment = message.type === "noteOn" ? 1 : -1;
        var noteHeldCount = duetHarness.model.notes[message.note] + increment;
        duetHarness.applier.change(["notes", message.note], noteHeldCount);
    };

    // Play any notes that are held twice, stop, any that aren't.
    flock.midi.interchange.demos.duet.sendToCombinedOutput = function (duetHarness, combinedOutput, updatePath, updateValue) {
        var outputConnection = fluid.get(combinedOutput, "connection");

        if (outputConnection) {
            var message = {
                channel: 0,
                type: updateValue === 2 ? "noteOn" : "noteOff",
                note: parseInt(updatePath[updatePath.length - 1], 10),
                // TODO: smoother handling of velocity.
                velocity: 127
            };
            outputConnection.send(message);
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
        components: {
            enviro: {
                type: "flock.enviro"
            },
            leftInput: {
                type: "flock.auto.ui.midiConnector",
                container: "{that}.dom.leftInput",
                options: {
                    portType: "input",
                    preferredDevice: "Launchpad"
                }
            },
            leftRouter: {
                type: "flock.midi.interchange.transformingRouter",
                options: {
                    rules: {
                        note: flock.midi.interchange.tunings.launchpad.common
                    },
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
                    portType: "output",
                    preferredDevice: "Launchpad"
                }
            },
            rightInput: {
                type: "flock.auto.ui.midiConnector",
                container: "{that}.dom.rightInput",
                options: {
                    portType: "input",
                    preferredDevice: "Launchpad Pro Standalone Port"
                }
            },
            rightRouter: {
                type: "flock.midi.interchange.transformingRouter",
                options: {
                    rules: {
                        note: flock.midi.interchange.tunings.launchpadPro.common
                    },
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
                    portType: "output",
                    preferredDevice: "Launchpad Pro Standalone Port"
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
})(fluid, flock);
