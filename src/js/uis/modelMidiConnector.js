/*

    A modelised midi connector that preserves the active "state" of all notes, control messages et cetera.

    Messages are added to the model by:

    1. MIDI channel number.
    2. Rough message type, i. e. both noteOn and noteOff update a `notes` element.
    3. Remaining message content, handling varies by message type (see below).


    NoteOn and noteOff messages are stored under "notes", the note is used as the key, and the velocity is the value, as
    in:

    model: {
        channels: {
            1: {
                notes: {
                    0: 127
                }
            }
        }
    }

    Control code messages are stored under "controls", the control number is the key, the value is the value, as in:


    model: {
        channels: {
            1: {
                controls: {
                    5: 64
                }
            }
        }
    }


    Pitchbend messages are stored under a "pitchbend" element, with the bend amount as the value, as in:

    model: {
        channels: {
            1: {
                pitchbend: 8192
            }
        }
    }

    Aftertouch messages are stored under an "aftertouch" element, which has a "channel" and "poly" element for channel
    and polyphonic aftertouch messages respectively.  The "channel" key stores the "pressure" value.  The "poly" key
    stores individual polyphonic aftertouch messages using the "note" as the key and the "pressure" as the value, as in:

    model: {
        channels: {
            1: {
                channelAftertouch: 0,
                polyAftertouch: {
                    64: 100
                }
            }
        }
    }

    Those are the only message types this component processes and adds to the model, all others are silently ignored.

 */
(function (flock, fluid) {
    "use strict";

    fluid.registerNamespace("flock.midi.interchange.connector.input");

    flock.midi.interchange.connector.input.detectAftertouchType = function (message) {
        return message.note !== undefined ? "polyAftertouch" : "channelAftertouch"
    };

    flock.midi.interchange.connector.input.midiMessageToModelChange = function (that, message) {
        var messageType = message.type === "aftertouch" ? flock.midi.interchange.connector.input.detectAftertouchType(message) : message.type;
        var transformRules = fluid.get(that, ["options", "rules", messageType]);

        if (transformRules) {
            var changePayload = fluid.model.transformWithRules(message, transformRules);
            that.applier.change(changePayload.pathSegments, changePayload.changeValue);
        }
    };

    fluid.defaults("flock.midi.interchange.connector.input", {
        portType: "input",
        gradeNames: ["flock.midi.connectorView"],
        rules: {
            note: {
                pathSegments: [
                    { literalValue: "channels" },
                    "channel",
                    { literalValue: "notes" },
                    "note"
                ],
                changeValue: "velocity"
            },
            noteOn: "{that}.options.rules.note",
            noteOff: {
                pathSegments: [
                    { literalValue: "channels" },
                    "channel",
                    { literalValue: "notes" },
                    "note"
                ],
                changeValue: { literalValue: 0 }
            },
            control: {
                pathSegments: [
                    { literalValue: "channels" },
                    "channel",
                    { literalValue: "controls" },
                    "number"
                ],
                changeValue: "value"
            },
            channelAftertouch: {
                pathSegments: [
                    { literalValue: "channels" },
                    "channel",
                    { literalValue: "channelAftertouch" }
                ],
                changeValue: "pressure"
            },
            polyAftertouch: {
                pathSegments: [
                    { literalValue: "channels" },
                    "channel",
                    { literalValue: "polyAftertouch" },
                    "note"
                ],
                changeValue: "pressure"
            },
            pitchbend: {
                pathSegments: [
                    { literalValue: "channels" },
                    "channel",
                    { literalValue: "pitchbend" }
                ],
                changeValue: "value"
            }
        },
        invokers: {
            midiMessageToModelChange: {
                funcName: "flock.midi.interchange.connector.input.midiMessageToModelChange",
                args:     ["{that}", "{arguments}.0"]
            }
        },
        listeners: {
            aftertouch: { func: "{that}.midiMessageToModelChange" },
            control:    { func: "{that}.midiMessageToModelChange" },
            note:       { func: "{that}.midiMessageToModelChange" },
            pitchbend:  { func: "{that}.midiMessageToModelChange" }
        }
    });

    fluid.registerNamespace("flock.midi.interchange.connector.output");

    flock.midi.interchange.connector.output.modelChangeToMidiMessage = function (that, pathSegs, changeValue) {
        var connection = fluid.get(that, ["connection"]);
        if (connection) {
            var changeType = fluid.get(pathSegs, 2); // channels -> # -> type
            var transformRules = fluid.get(that.options.rules, changeType);
            if (transformRules) {
                var midiMessage = fluid.model.transformWithRules({ pathSegs: pathSegs, value: changeValue }, transformRules);
                connection.send(midiMessage);
            }
        }
    };

    /**
     *
     * Dynamically register model listeners for all supported types of change so that we can get full path information
     * for each discrete change without defining thousands of listeners (16 channels x 128 values for notes alone).
     *
     * @param {Object} that - The interchange output component itself.
     *
     */
    flock.midi.interchange.connector.output.addModelListeners = function (that) {
        for (var channel = 0; channel < 16; channel++) {
            for (var index = 0; index < 128; index++) {
                // notes
                var noteSegs = ["channels", channel, "notes", index];
                var noteNamespace = noteSegs.join("-");
                that.applier.modelChanged.addListener({ segs: noteSegs }, that.modelChangeToMidiMessage, noteNamespace);

                // controls
                var controlSegs = ["channels", channel, "controls", index];
                var controlNamespace = controlSegs.join("-");
                that.applier.modelChanged.addListener({ segs: controlSegs }, that.modelChangeToMidiMessage, controlNamespace);

                // polyphonic aftertouch
                var polyAftertouchSegs = ["channels", channel, "polyAftertouch", index];
                var polyAftertouchNamespace = polyAftertouchSegs.join("-");
                that.applier.modelChanged.addListener({ segs: polyAftertouchSegs }, that.modelChangeToMidiMessage, polyAftertouchNamespace);
            }

            // pitchbend
            var pitchbendSegs = ["channels", channel, "pitchbend"];
            var pitchbendNamespace = pitchbendSegs.join("-");
            that.applier.modelChanged.addListener({ segs: pitchbendSegs }, that.modelChangeToMidiMessage, pitchbendNamespace);

            // channel aftertouch
            var channelAftertouchSegs = ["channels", channel, "channelAftertouch"];
            var channelAftertouchNamespace = channelAftertouchSegs.join("-");
            that.applier.modelChanged.addListener({ segs: channelAftertouchSegs }, that.modelChangeToMidiMessage, channelAftertouchNamespace);
        }
    };

    fluid.defaults("flock.midi.interchange.connector.output", {
        gradeNames: ["flock.midi.connectorView"],
        portType: "output",
        // inverse transforms based on change and path
        rules: {
            notes: {
                channel: {
                    "transform": {
                        "type": "fluid.transforms.stringToNumber",
                        "inputPath": "pathSegs.1"
                    }
                },
                type: { literalValue: "noteOn"},
                note: {
                    "transform": {
                        "type": "fluid.transforms.stringToNumber",
                        "inputPath": "pathSegs.3"
                    }
                },
                velocity: "value"
            },
            controls: {
                channel: {
                    "transform": {
                        "type": "fluid.transforms.stringToNumber",
                        "inputPath": "pathSegs.1"
                    }
                },
                type:    { literalValue: "control"},
                number:  {
                    "transform": {
                        "type": "fluid.transforms.stringToNumber",
                        "inputPath": "pathSegs.3"
                    }
                },
                value:   "value"
            },
            polyAftertouch: {
                channel: {
                    "transform": {
                        "type": "fluid.transforms.stringToNumber",
                        "inputPath": "pathSegs.1"
                    }
                },
                type: { literalValue: "aftertouch" },
                note: {
                    "transform": {
                        "type": "fluid.transforms.stringToNumber",
                        "inputPath": "pathSegs.3"
                    }
                },
                // We have to cross-register the pressure as velocity because of this line:
                // https://github.com/colinbdclark/Flocking/blob/master/src/web/midi.js#L613
                velocity: "value"
            },
            channelAftertouch: {
                channel: {
                    "transform": {
                        "type": "fluid.transforms.stringToNumber",
                        "inputPath": "pathSegs.1"
                    }
                },
                type:    { literalValue: "aftertouch"},
                pressure:   "value"
            },
            pitchbend: {
                channel: {
                    "transform": {
                        "type": "fluid.transforms.stringToNumber",
                        "inputPath": "pathSegs.1"
                    }
                },
                type:    { literalValue: "pitchbend"},
                value:   "value"
            }
        },
        model: {
            channels: {}
        },
        invokers: {
            "modelChangeToMidiMessage": {
                funcName: "flock.midi.interchange.connector.output.modelChangeToMidiMessage",
                args:     ["{that}", "{arguments}.2", "{arguments}.0"] // `
            }
        },
        listeners: {
            "onCreate.addModelListeners": {
                funcName: "flock.midi.interchange.connector.output.addModelListeners",
                args:     ["{that}"]
            }
        }
    });
})(flock, fluid);
