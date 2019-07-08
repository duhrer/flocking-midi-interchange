/* globals fluid, flock */
(function (fluid, flock) {
    "use strict";
    fluid.registerNamespace("flock.midi.interchange.demos.duet");


    // Add the SVG that will hold our colour data.
    flock.midi.interchange.demos.duet.addSvg = function (that) {
        var svgContainer = that.locate("svg");
        svgContainer.html(that.options.svgData);
    };

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
        duetHarness.updateSvg();
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
        },
        invokers: {
            updateSvg: {
                funcName: "flock.midi.interchange.demos.duet.updateSvg",
                args:     ["{that}"]
            }
        }
    });

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

    fluid.registerNamespace("flock.midi.interchange.demos.duet.launchpad");

    flock.midi.interchange.demos.duet.launchpad.mergeCell = function (originalCell, toMerge) {
        if (!originalCell) {
            return toMerge;
        }
        else {
            var merged = {};
            fluid.each(["r", "g", "b"], function (colourKey) {
                merged[colourKey] = originalCell[colourKey] + toMerge[colourKey];
            });
            return merged;
        }
    };

    // For the launchpad, add the "aurora" effect, which requires an understanding of which notes are our neighbours.
    flock.midi.interchange.demos.duet.launchpad.updateSvg = function (that) {
        var svgContainer = that.locate("svg");
        var svgElement = $(svgContainer);

        // Set all the existing notes to black.
        svgElement.find(".device-note").css("fill", "#000000");

        /*
             76 77 78 79 80 81 82 83
             68 69 70 71 72 73 74 75
             60 61 62 63 64 65 66 67
             52 53 54 55 56 57 58 59
             44 45 46 47 48 49 50 51
             36 37 38 39 40 41 42 43
             28 29 30 31 32 33 34 35
             20 21 22 23 24 25 26 27
         */
        // Calculate the colour map for the held notes.
        var colourMap = {};
        fluid.each(that.model.notes, function (value, note) {
            var noteAsNumber = parseInt(note, 10);
            if (value && noteAsNumber >= 20 && noteAsNumber <= 83) {
                var offsetNoteNumber = noteAsNumber - 20;
                var row = Math.floor(offsetNoteNumber / 8);
                var col = offsetNoteNumber % 8;

                var baseColourSpec = {
                    r: (value === 1 || value === 3) ? 255 : 0,
                    g: (value === 2 || value === 3) ? 255 : 0,
                    b: (value === 2 || value === 3) ? 255 : 0
                };

                var edgeColourSpec = {
                    r: Math.round(baseColourSpec.r * 0.25),
                    g: Math.round(baseColourSpec.g * 0.25),
                    b: Math.round(baseColourSpec.b * 0.25)
                };

                var cornerColourSpec = {
                    r: Math.round(baseColourSpec.r * 0.125),
                    g: Math.round(baseColourSpec.g * 0.125),
                    b: Math.round(baseColourSpec.b * 0.125)
                };

                // The note itself
                colourMap[note] = baseColourSpec;

                // Upstairs neighbours
                if (row > 0) {
                    // NW
                    if (col > 0) {
                        colourMap[noteAsNumber - 9] = flock.midi.interchange.demos.duet.launchpad.mergeCell(colourMap[noteAsNumber - 9], cornerColourSpec);
                    }

                    // N
                    colourMap[noteAsNumber - 8] = flock.midi.interchange.demos.duet.launchpad.mergeCell(colourMap[noteAsNumber - 8], edgeColourSpec);

                    // NE
                    if (col < 7)  {
                        colourMap[noteAsNumber - 7] = flock.midi.interchange.demos.duet.launchpad.mergeCell(colourMap[noteAsNumber - 7], cornerColourSpec);
                    }
                }

                // Left neighbour
                if (col > 0) {
                    colourMap[noteAsNumber - 1] = flock.midi.interchange.demos.duet.launchpad.mergeCell(colourMap[noteAsNumber - 1], edgeColourSpec);
                }

                // Right neighbour
                if (col < 7) {
                    colourMap[noteAsNumber + 1] = flock.midi.interchange.demos.duet.launchpad.mergeCell(colourMap[noteAsNumber + 1], edgeColourSpec);
                }

                // Downstairs neighbours
                if (row < 7) {
                    // SW
                    if (col > 0) {
                        colourMap[noteAsNumber + 7] = flock.midi.interchange.demos.duet.launchpad.mergeCell(colourMap[noteAsNumber + 7], cornerColourSpec);
                    }

                    // S
                    colourMap[noteAsNumber + 8] = flock.midi.interchange.demos.duet.launchpad.mergeCell(colourMap[noteAsNumber + 8], edgeColourSpec);

                    // SE
                    if (col < 7) {
                        colourMap[noteAsNumber + 9] = flock.midi.interchange.demos.duet.launchpad.mergeCell(colourMap[noteAsNumber + 9], cornerColourSpec);
                    }
                }
            }
        });

        // Update the display
        fluid.each(colourMap, function (colourDesc, note) {
            var noteAsNumber = parseInt(note, 10);
            var noteSelector = "#device-note-" + flock.midi.interchange.oda.zeroPadNumber(noteAsNumber);
            var htmlColour   = "#";
            fluid.each(["r","g","b"], function (colourKey) {
                var colourValue = colourDesc[colourKey];
                var colourAsHexString = Math.min(255, colourValue).toString(16);
                if (colourValue < 16) {
                    htmlColour += "0";
                }
                htmlColour += colourAsHexString;
            });
            var noteElement  = svgElement.find(noteSelector);
            noteElement.css("fill", htmlColour);
        });
    };

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
        },
        invokers: {
            updateSvg: {
                funcName: "flock.midi.interchange.demos.duet.launchpad.updateSvg",
                args:     ["{that}"]
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
