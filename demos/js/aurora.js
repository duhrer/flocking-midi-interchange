/*

    A router that monitors "held" notes and paints a Launchpad Pro with a dithered colour scheme based on their
    position.

 */
(function (fluid) {
    "use strict";
    var flock = fluid.registerNamespace("flock");

    fluid.registerNamespace("flock.midi.interchange.demos.aurora");

    flock.midi.interchange.demos.aurora.handleNoteOn = function (that, originalMessage) {
        var transformedMessage = fluid.model.transformWithRules(originalMessage, flock.midi.interchange.tunings.launchpadPro.common);

        // Add the note to the list of "held" notes (actual MIDI input value).
        // We use the original note because we are going to have to paint it on the raw device.
        that.activeNotes[originalMessage.note] = true;

        flock.midi.interchange.demos.aurora.paintDevice(that);

        that.sendToNoteOut(transformedMessage);
    };

    flock.midi.interchange.demos.aurora.paintDevice = function (that) {
        var valueArray = flock.midi.interchange.demos.aurora.generateColourArray(that);
        flock.midi.interchange.demos.aurora.sendValueArrayToDevice(that, valueArray);
    };

    /*

       Look at the list of "held" notes and generate a colour scheme.  The Launchpad Pro's programmer layout is
       as follows:

        81 82 83 84 85 86 87 88
        71 72 73 74 75 76 77 78
        61 62 63 64 65 66 67 68
        51 52 53 54 55 56 57 58
        41 42 43 44 45 46 47 48
        31 32 33 34 35 36 37 38
        21 22 23 24 25 26 27 28
        11 12 13 14 15 16 17 18

     */
    flock.midi.interchange.demos.aurora.generateColourArray = function (that) {
        var colourArray = fluid.generate(64, function () { return [0,0,0]; }, true); // an array of [r,g,b] values from 0 -> 0x3F

        fluid.each(that.activeNotes, function (isActive, activeNoteAsString) {
            if (isActive) {
                var noteNumber = parseInt(activeNoteAsString, 10);
                var row = (Math.floor(noteNumber/10)) - 1;
                var col = (noteNumber % 10) - 1;

                // update our own value
                var heldNoteIndex = (row * 8) + col;
                flock.midi.interchange.demos.aurora.updateSingleCellColour(colourArray[heldNoteIndex], that.model.colourScheme, that.options.contrastScheme.held);

                // Update immediate vertical/horizontal neighbours
                // update left neighbour
                if (col > 0) {
                    var leftNeighbourIndex = heldNoteIndex - 1;
                    flock.midi.interchange.demos.aurora.updateSingleCellColour(colourArray[leftNeighbourIndex], that.model.colourScheme, that.options.contrastScheme.adjacent);
                }
                // update right neighbour
                if (col < 7) {
                    var rightNeighbourIndex = heldNoteIndex + 1;
                    flock.midi.interchange.demos.aurora.updateSingleCellColour(colourArray[rightNeighbourIndex], that.model.colourScheme, that.options.contrastScheme.adjacent);
                }
                // update upstairs neighbour
                if (row < 7) {
                    var upstairsNeighbourIndex = heldNoteIndex + 8;
                    flock.midi.interchange.demos.aurora.updateSingleCellColour(colourArray[upstairsNeighbourIndex], that.model.colourScheme, that.options.contrastScheme.adjacent);
                }
                // update downstairs neighbour
                if (row > 0) {
                    var downstairsNeighbourIndex = heldNoteIndex - 8;
                    flock.midi.interchange.demos.aurora.updateSingleCellColour(colourArray[downstairsNeighbourIndex], that.model.colourScheme, that.options.contrastScheme.adjacent);
                }

                // Update diagonal neighbours
                // Upstairs left neighbor
                if (col > 0 && row < 7) {
                    var upstairsLeftNeighbourIndex = heldNoteIndex + 7;
                    flock.midi.interchange.demos.aurora.updateSingleCellColour(colourArray[upstairsLeftNeighbourIndex], that.model.colourScheme, that.options.contrastScheme.diagonal);
                }
                // Upstairs right neighbor
                if (col < 7 && row < 7) {
                    var upstairsRightNeighbourIndex = heldNoteIndex + 9;
                    flock.midi.interchange.demos.aurora.updateSingleCellColour(colourArray[upstairsRightNeighbourIndex], that.model.colourScheme, that.options.contrastScheme.diagonal);
                }
                // Downstairs left neighbor
                if (col > 0 && row > 0) {
                    var downstairsLeftNeighbourIndex = heldNoteIndex - 9;
                    flock.midi.interchange.demos.aurora.updateSingleCellColour(colourArray[downstairsLeftNeighbourIndex], that.model.colourScheme, that.options.contrastScheme.diagonal);
                }
                // Downstairs right neighbor
                if (col < 7 && row > 0) {
                    var downstairsRightNeighbourIndex = heldNoteIndex - 7;
                    flock.midi.interchange.demos.aurora.updateSingleCellColour(colourArray[downstairsRightNeighbourIndex], that.model.colourScheme, that.options.contrastScheme.diagonal);
                }
            }
        });

        // https://docs.fluidproject.org/infusion/development/CoreAPI.html#fluidflattenarray
        return fluid.flatten(colourArray);
    };

    flock.midi.interchange.demos.aurora.updateSingleCellColour = function (existingCellValues, colourScheme, opacity) {
        fluid.each(["r", "g", "b"], function (colourKey, index) {
            var maxLevel        = colourScheme[colourKey] * 0x3F;
            var calculatedLevel = maxLevel * opacity;
            var existingLevel   = existingCellValues[index];

            // no value can be greater than the max specified in `that.model.colourScheme`
            var updatedLevel = Math.min(maxLevel, existingLevel + calculatedLevel);

            existingCellValues[index] = updatedLevel;
        });
    };

    flock.midi.interchange.demos.aurora.sendValueArrayToDevice = function (that, colourArray) {
        var header = [
            // common header
            0, 0x20, 0x29, 0x02, 0x10,
            // "RGB Grid Sysex" command
            0xF,
            // 0: all pads, 1: square drum pads only.
            1
        ];
        var data = header.concat(colourArray);
        that.sendToUi({
            type: "sysex",
            data: data
        });

        // Paint the "side velocity" (0x63) a colour that matches the colour scheme.
        // F0h 00h 20h 29h 02h 10h 0Ah <velocity> <Colour> F7h
        that.sendToUi({ type: "sysex", data: [0, 0x20, 0x29, 0x02, 0x10, 0xA, 0x63, that.model.colourScheme.velocity]});

        fluid.each(that.options.colourSchemes, function (colourScheme) {
            if (colourScheme.control) {
                that.sendToUi({ type: "control", channel: 0, number: colourScheme.control, value: colourScheme.velocity});
            }
        })
    };

    flock.midi.interchange.demos.aurora.handleNoteOff = function (that, originalMessage) {
        var transformedMessage = fluid.model.transformWithRules(originalMessage, flock.midi.interchange.tunings.launchpadPro.common);

        // Remove the note from the list of "held" notes (actual MIDI input value) if it's there.
        // We use the original note because we are going to have to paint it on the raw device.
        that.activeNotes[originalMessage.note] = false;

        flock.midi.interchange.demos.aurora.paintDevice(that);

        // Pass the note along to the output device (we could make this conditional, but it's harmless).
        that.sendToNoteOut(transformedMessage);
    };

    flock.midi.interchange.demos.aurora.handleControl = function (that, midiMessage) {
        if (midiMessage.value) {
            // CCs one through eight control the colour
            var colourScheme = fluid.find(that.options.colourSchemes, function (candidateColourScheme) {
                return candidateColourScheme.control === midiMessage.number ? candidateColourScheme : undefined;
            });
            if (colourScheme) {
                that.applier.change("colourScheme", colourScheme);
            }
        }
    };

    // TODO: Make a generalised pattern for this, we use it so so often.
    flock.midi.interchange.demos.aurora.sendToOutput = function (outputComponent, message) {
        var outputConnection = fluid.get(outputComponent, "connection");
        if (outputConnection) {
            outputConnection.send(message);
        }
    };

    fluid.defaults("flock.midi.interchange.demos.aurora", {
        gradeNames: ["fluid.viewComponent"],
        preferredInputDevice:    "Launchpad Pro Standalone Port",
        preferredUIOutputDevice: "Launchpad Pro Standalone Port",
        model: {
            colourScheme: "{that}.options.colourSchemes.white"
        },
        contrastScheme: {
            held:     1.0,
            adjacent: 0.1,
            diagonal: 0.025
        },
        colourSchemes: {
            white:  { r: 1, g: 1,    b: 1, control: 1, velocity: 1  },
            red:    { r: 1, g: 0,    b: 0, control: 2, velocity: 5 },
            orange: { r: 1, g: 0.25, b: 0, control: 3, velocity: 9  }, // In HTML the RGB values for orange would be way off, but for the Launchpad Pro it works.
            yellow: { r: 1, g: 1,    b: 0, control: 4, velocity: 13 },
            green:  { r: 0, g: 1,    b: 0, control: 5, velocity: 17 },
            blue:   { r: 0, g: 1,    b: 1, control: 6, velocity: 90 },
            indigo: { r: 0, g: 0,    b: 1, control: 7, velocity: 79 },
            violet: { r: 1, g: 0,    b: 1, control: 8, velocity: 53 }
        },
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
                    preferredPort: "{aurora}.options.preferredInputDevice",
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
                    preferredPort: "{aurora}.options.preferredOutputDevice",
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
                    preferredPort: "{aurora}.options.preferredUIOutputDevice",
                    components: {
                        connection: {
                            options: {
                                sysex: true, // Required to configure the Launchpad Pro.
                                listeners: {
                                    "onReady.setupDevice": {
                                        funcName: "fluid.each",
                                        args:     ["{aurora}.options.setupMessages", "{aurora}.sendToUi"]
                                    },
                                    "onReady.paintDevice": {
                                        funcName: "flock.midi.interchange.demos.aurora.paintDevice",
                                        args: ["{aurora}"]
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
                funcName: "flock.midi.interchange.demos.aurora.sendToOutput",
                args: ["{noteOutput}", "{arguments}.0"] // outputComponent, message
            },
            sendToUi: {
                funcName: "flock.midi.interchange.demos.aurora.sendToOutput",
                args: ["{uiOutput}", "{arguments}.0"] // outputComponent, message
            }
        },
        listeners: {
            "noteOn.handle": {
                funcName: "flock.midi.interchange.demos.aurora.handleNoteOn",
                args: ["{that}", "{arguments}.0"] // midiMessage
            },
            "noteOff.handle": {
                funcName: "flock.midi.interchange.demos.aurora.handleNoteOff",
                args: ["{that}", "{arguments}.0"] // midiMessage
            },
            "control.handle": {
                funcName: "flock.midi.interchange.demos.aurora.handleControl",
                args: ["{that}", "{arguments}.0"] // midiMessage
            }
        },
        modelListeners: {
            "colourScheme": {
                excludeSource: "init",
                funcName: "flock.midi.interchange.demos.aurora.paintDevice",
                args: ["{that}"]
            }
        }
    });
})(fluid);
