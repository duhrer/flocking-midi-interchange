(function (fluid) {
    /*

    A router that monitors the "recently" held notes and ensures that play is constrained to a scale.  Supports the
    following scales, adapted from Wikipedia:

    https://en.wikipedia.org/wiki/Major_scale
    https://en.wikipedia.org/wiki/Minor_scale#Melodic_minor_scale

    - Major (Ionian)
    - Harmonic Major
    - Natural Minor
    - Harmonic Minor

    # Device Feedback

    This instrument is designed with a MIDI-programmable device like the Novation Launchpad or Launchpad Pro in mind.
    Whenever a note is "held" or released, MIDI messages are sent to highlight the "allowed" notes.  When no notes are
    held, all pads are lit.  As notes are "held", the number of "allowed" notes decreases until only octave variations
    on the existing "held" notes are possible.

 */
    (function (fluid) {
        "use strict";
        var flock = fluid.registerNamespace("flock");

        fluid.registerNamespace("flock.midi.interchange.demos.keymaster");

        flock.midi.interchange.demos.keymaster.timeoutOffsets = function (that) {
            var currentTimestamp = Date.now();
            var activeOffsetKeys = flock.midi.interchange.demos.keymaster.keysToIntArray(that.activeOffsets);
            fluid.each(activeOffsetKeys, function (offsetKey) {
                var currentValue = that.activeOffsets[offsetKey];
                if (!currentValue || (currentTimestamp - currentValue) >= that.options.rememberHeldNotesMs) {
                    delete that.activeOffsets[offsetKey];
                }
            });
        };

        flock.midi.interchange.demos.keymaster.allowedOffsets = function (that) {
            var activeOffsets = flock.midi.interchange.demos.keymaster.keysToIntArray(that.activeOffsets);
            if (activeOffsets.length) {
                var lookupResult = fluid.get(flock.midi.interchange.keymaster.lookupTable, activeOffsets);
                if (typeof lookupResult === "object") {
                    var futureOffsets = flock.midi.interchange.demos.keymaster.keysToIntArray(lookupResult);
                    return activeOffsets.concat(futureOffsets);
                }
                else {
                    return activeOffsets;
                }
            }
            else {
                return flock.midi.interchange.demos.keymaster.keysToIntArray(flock.midi.interchange.keymaster.lookupTable);
            }
        };

        flock.midi.interchange.demos.keymaster.keysToIntArray = function (arrayOrMap) {
            var intArray = [];

            fluid.each(arrayOrMap, function (timestamp, key) {
                intArray.push(parseInt(key, 10));
            });

            return intArray;
        };

        flock.midi.interchange.demos.keymaster.handleNoteOn = function (that, originalMessage) {
            var transformedMessage = fluid.model.transformWithRules(originalMessage, flock.midi.interchange.tunings.launchpadPro.common);

            if (that.allowedOffsets.indexOf(transformedMessage.note % 12) !== -1) {
                // Update the list of "held" notes (the actual MIDI input value)
                that.activeNotes[transformedMessage.note] = true;

                // Update the list of distinct relative notes.
                that.activeOffsets[transformedMessage.note % 12] = Date.now();
                that.allowedOffsets = flock.midi.interchange.demos.keymaster.allowedOffsets(that);

                // Pass the note along to the output device.
                if (transformedMessage.note > 0 && transformedMessage.note < 128) {
                    that.sendToNoteOut(transformedMessage);
                }
            }
        };

        flock.midi.interchange.demos.keymaster.paintDevice = function (that) {
            flock.midi.interchange.demos.keymaster.timeoutOffsets(that);
            that.allowedOffsets = flock.midi.interchange.demos.keymaster.allowedOffsets(that);

            var activeOffsetAsArray = flock.midi.interchange.demos.keymaster.mapToIntArray(that.activeOffsets);
            if (activeOffsetAsArray.length) {
                var valueArray = [];

                // We should only be trying to paint notes 20-83.
                for (var a = 20; a < 84; a++ ) {
                    var offset = a % 12;
                    if (that.activeNotes[a]) {
                        valueArray.push(1);
                    }
                    else if (that.activeOffsets[offset]) {
                        valueArray.push(0.5);
                    }
                    else if (that.allowedOffsets.indexOf(offset) !== -1) {
                        valueArray.push(0.1);
                    }
                    else {
                        valueArray.push(0);
                    }
                }

                flock.midi.interchange.demos.keymaster.sendValueArrayToDevice(that, valueArray);
            }
            else {
                flock.midi.interchange.demos.keymaster.sendValueArrayToDevice(that, that.options.valueSchemes.allNotesToDefault)
            }
        };

        flock.midi.interchange.demos.keymaster.generateColourArray = function (that, valueArray) {
            var colourArray = [];

            fluid.each(valueArray, function (singleValue) {
                colourArray.push(flock.midi.interchange.demos.keymaster.calculateSingleColor(that, "r", singleValue));
                colourArray.push(flock.midi.interchange.demos.keymaster.calculateSingleColor(that, "g", singleValue));
                colourArray.push(flock.midi.interchange.demos.keymaster.calculateSingleColor(that, "b", singleValue));
            });

            return colourArray;
        };

        // TODO: Puzzle out how we want to handle brightness and contrast.
        flock.midi.interchange.demos.keymaster.calculateSingleColor = function (that, channel, value) {
            var colourLevel = fluid.get(that.model.colourLevels, channel);
            var calculatedColourLevel = Math.round(that.model.brightness * colourLevel * value);
            return calculatedColourLevel;
        };


        flock.midi.interchange.demos.keymaster.sendValueArrayToDevice = function (that, valueArray) {
            var header = [
                // common header
                0, 0x20, 0x29, 0x02, 0x10,
                // "RGB Grid Sysex" command
                0xF,
                // 0: all pads, 1: square drum pads only.
                1
            ];
            var colourArray = flock.midi.interchange.demos.keymaster.generateColourArray(that, valueArray);
            var data = header.concat(colourArray);
            that.sendToUi({
                type: "sysex",
                data: data
            });

            // Paint the "side velocity" (0x63) a colour that matches the colour scheme.
            // F0h 00h 20h 29h 02h 10h 0Ah <velocity> <Colour> F7h
            that.sendToUi({ type: "sysex", data: [0, 0x20, 0x29, 0x02, 0x10, 0xA, 0x63, that.model.colourLevels.velocity]});

            fluid.each(that.options.colourSchemes, function (colourScheme) {
                if (colourScheme.control) {
                    that.sendToUi({ type: "control", channel: 0, number: colourScheme.control, value: colourScheme.velocity});
                }
            })
        };

        flock.midi.interchange.demos.keymaster.noteMapToOffsets = function (map) {
            var offsetMap = {};
            fluid.each(map, function (value, key) {
                if (value) {
                    offsetMap[key % 12] = true;
                }
            });
            return flock.midi.interchange.demos.keymaster.mapToIntArray(offsetMap);
        };

        flock.midi.interchange.demos.keymaster.handleNoteOff = function (that, originalMessage) {
            var transformedMessage = fluid.model.transformWithRules(originalMessage, flock.midi.interchange.tunings.launchpadPro.common);

            // Remove the note from the list of "held" notes (actual MIDI input value) if it's there.
            that.activeNotes[transformedMessage.note] = false;

            // Pass the note along to the output device (we could make this conditional, but it's harmless).
            that.sendToNoteOut(transformedMessage);
        };

        flock.midi.interchange.demos.keymaster.mapToIntArray = function (map) {
            var distinctIntMap = {};
            fluid.each(map, function (value, key) {
                if (value) {
                    distinctIntMap[key] = true;
                }
            });
            return flock.midi.interchange.demos.keymaster.keysToIntArray(distinctIntMap);
        };

        flock.midi.interchange.demos.keymaster.handleControl = function (that, midiMessage) {
            if (midiMessage.value) {
                // CCs one through eight control the colour
                var colourScheme = fluid.find(that.options.colourSchemes, function (candidateColourScheme) {
                    return candidateColourScheme.control === midiMessage.number ? candidateColourScheme : undefined;
                });
                if (colourScheme) {
                    that.applier.change("colourLevels", colourScheme);
                }
            }
        };

        // TODO: Make a generalised pattern for this, we use it so so often.
        flock.midi.interchange.demos.keymaster.sendToOutput = function (outputComponent, message) {
            var outputConnection = fluid.get(outputComponent, "connection");
            if (outputConnection) {
                outputConnection.send(message);
            }
        };

        flock.midi.interchange.demos.keymaster.startPolling = function (that) {
            that.scheduler.schedule({
                type: "repeat",
                freq: 10,
                callback: that.paintDevice
            });

            that.scheduler.start();
        };

        // Originally a copy of the keymaster, we should make a reusable base grade for the colour-changing parts.
        fluid.defaults("flock.midi.interchange.demos.keymaster", {
            gradeNames: ["fluid.viewComponent"],
            preferredInputDevice:    "Launchpad Pro 7 Standalone Port",
            preferredUIOutputDevice: "Launchpad Pro 7 Standalone Port",
            rememberHeldNotesMs: 10000,
            model: {
                brightness: 63,
                contrast:   1,
                colourLevels: "{that}.options.colourSchemes.white"
            },
            valueSchemes: {
                allNotesToDefault: "@expand:fluid.generate(64, 0.1)" // note awaiting selection
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
                activeOffsets: {},
                activeNotes:   {},
                allowedOffsets: [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11 ]
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
                        preferredPort: "{keymaster}.options.preferredInputDevice",
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
                        preferredPort: "{keymaster}.options.preferredOutputDevice",
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
                        preferredPort: "{keymaster}.options.preferredUIOutputDevice",
                        components: {
                            connection: {
                                options: {
                                    sysex: true, // Required to configure the Launchpad Pro.
                                    listeners: {
                                        "onReady.setupDevice": {
                                            funcName: "fluid.each",
                                            args:     ["{keymaster}.options.setupMessages", "{keymaster}.sendToUi"]
                                        },
                                        "onReady.paintKeys": {
                                            funcName: "flock.midi.interchange.demos.keymaster.sendValueArrayToDevice",
                                            args: ["{keymaster}", "{keymaster}.options.valueSchemes.allNotesToDefault"]
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
                },
                scheduler: {
                    type: "berg.scheduler",
                    options: {
                        components: {
                            clock: {
                                type: "berg.clock.raf",
                                options: {
                                    freq: 50 // times per second
                                }
                            }
                        }
                    }
                }
            },
            invokers: {
                paintDevice: {
                    funcName: "flock.midi.interchange.demos.keymaster.paintDevice",
                    args: ["{that}"]
                },
                sendToNoteOut: {
                    funcName: "flock.midi.interchange.demos.keymaster.sendToOutput",
                    args: ["{noteOutput}", "{arguments}.0"] // outputComponent, message
                },
                sendToUi: {
                    funcName: "flock.midi.interchange.demos.keymaster.sendToOutput",
                    args: ["{uiOutput}", "{arguments}.0"] // outputComponent, message
                }
            },
            listeners: {
                "onCreate.startPolling": {
                    funcName: "flock.midi.interchange.demos.keymaster.startPolling",
                    args: ["{that}"]
                },
                "noteOn.handle": {
                    funcName: "flock.midi.interchange.demos.keymaster.handleNoteOn",
                    args: ["{that}", "{arguments}.0"] // midiMessage
                },
                "noteOff.handle": {
                    funcName: "flock.midi.interchange.demos.keymaster.handleNoteOff",
                    args: ["{that}", "{arguments}.0"] // midiMessage
                },
                "control.handle": {
                    funcName: "flock.midi.interchange.demos.keymaster.handleControl",
                    args: ["{that}", "{arguments}.0"] // midiMessage
                }
            }
        });
    })(fluid);

})(fluid);
