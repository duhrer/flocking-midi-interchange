/* globals fluid, flock */
(function (fluid, flock) {
    "use strict";
    fluid.registerNamespace("flock.midi.interchange.demos.duet");


    // Add the SVG that will hold our colour data.
    flock.midi.interchange.demos.duet.addSvg = function (that) {
        var svgContainer = that.locate("svg");
        svgContainer.html(that.options.svgData);
    };

    // #device-note-112
    // elementToPaint.css("fill", htmlColour);
    flock.midi.interchange.demos.duet.updateSvg = function (that) {
        var svgContainer = that.locate("svg");
        var svgElement = $(svgContainer);

        // Set all the existing notes to black. Probably not needed with the current strategy.
        //svgElement.find(".device-note").css("fill", "#000000");

        // Iterate through the held notes and update the display.
        fluid.each(that.model.notes, function (value, note) {
            var noteSelector = "#device-note-" + flock.midi.interchange.oda.zeroPadNumber(parseInt(note, 10));
            var htmlColour = "#000000";
            if (value === 1) {
                htmlColour = "#ff0000";
            }
            else if (value === 2) {
                htmlColour = "#00ffff";
            }
            else if (value === 3) {
                htmlColour = "#ffffff"
            }
            var noteElement = svgElement.find(noteSelector);
            noteElement.css("fill", htmlColour);
        });
    };

    // TODO: Add something to relay the note model to the onscreen UI, such that:
    // 1. Notes with a value of 1 (left partner only) are red.
    // 2. Notes with a value of 2 (right partner only) are cyan (green + blue)
    // 3. Notes with a value of 3 (both partners) are white.
    // 4. Notes are blurred as we did with the aurora, center is 100%, edges are 75%, diagonals are 50%

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

    // Keep track of how many times each note is currently being held.
    flock.midi.interchange.demos.duet.updateModel = function (duetHarness, message, source) {
        var newValue = duetHarness.model.notes[message.note] ^ source;
        duetHarness.applier.change(["notes", message.note], newValue);
        flock.midi.interchange.demos.duet.updateSvg(duetHarness);
    };

    // Play any notes that are held by both partners, stop any that are released on both.
    flock.midi.interchange.demos.duet.sendToCombinedOutput = function (duetHarness, combinedOutput, updatePath, updateValue) {
        var outputConnection = fluid.get(combinedOutput, "connection");

        // Both pads have to hold a note to hit it (3).
        // Both pads have to release the note to stop it (0).
        if (outputConnection && (updateValue === 0 || updateValue === 3)) {
            var message = {
                channel: 0,
                note: parseInt(updatePath[updatePath.length - 1], 10),
                type: updateValue === 3 ? "noteOn" : "noteOff",
                velocity: updateValue === 3 ? 127 : 0
            };

            outputConnection.send(message);
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
            combinedOutput: ".midi-combined-output",
            svg:            ".duet-svg"
        },
        model: {
            notes: "@expand:fluid.generate(128,0)"
        },
        svgData: flock.midi.interchange.svg.oda,
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
                            args: ["{duet}", "{arguments}.0", 1] // duetHarness, noteMessage, source
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
                            args: ["{duet}", "{arguments}.0", 2] // duetHarness, noteMessage, source
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
        },
        listeners: {
            "onCreate.addSvg": {
                funcName: "flock.midi.interchange.demos.duet.addSvg",
                args: ["{that}"]
            }
        }
    });

    // TODO: Generate a launchpad ODA whose notes are tuned to the common tuning.
    // TODO: Add the "aurora" effect, which requires an understanding of which notes are our neighbours.
    fluid.defaults("flock.midi.interchange.demos.duet.launchpad", {
        gradeNames: ["flock.midi.interchange.demos.duet"],
        svgData: flock.midi.interchange.svg.launchpadCommon,
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
