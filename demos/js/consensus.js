/* globals fluid, flock */
(function (fluid, flock) {
    "use strict";
    fluid.registerNamespace("flock.midi.interchange.demos.consensus");

    flock.midi.interchange.demos.consensus.handleNoteMessage = function (that, midiMessage) {
        var oldState = flock.midi.interchange.demos.consensus.calculateAverages(that.heldNotesByChannel[midiMessage.channel]);

        var isHeld = (midiMessage.type === "noteOn" && midiMessage.velocity) ? true : false;
        that.heldNotesByChannel[midiMessage.channel][midiMessage.note] = isHeld ? midiMessage.velocity : 0;

        var newState = flock.midi.interchange.demos.consensus.calculateAverages(that.heldNotesByChannel[midiMessage.channel]);

        if (newState.note === oldState.note) {
            if (newState.notesHeld === 0) {
                var noteStopMessage = fluid.extend({}, midiMessage, { type: "noteOff", note: newState.note, velocity: 0 });
                that.sendNote(noteStopMessage);
            }
            else if (newState.notesHeld && !oldState.notesHeld) {
                var noteStartMessage = fluid.extend({}, midiMessage, { type: "noteOn", note: newState.note, velocity: newState.velocity });
                that.sendNote(noteStartMessage);
            }
        }
        else {
            if (oldState.notesHeld) {
                var noteStopMessage = fluid.extend({}, midiMessage, { type: "noteOff", note: oldState.note, velocity: 0 });
                that.sendNote(noteStopMessage);
            }

            if (newState.notesHeld) {
                var noteStartMessage = fluid.extend({}, midiMessage, { type: "noteOn", note: newState.note, velocity: newState.velocity });
                that.sendNote(noteStartMessage);
            }
        }
    };

    flock.midi.interchange.demos.consensus.calculateAverages = function (noteMap) {
        var noteSum = 0;
        var velocitySum = 0;
        var notesHeld  = 0;
        fluid.each(noteMap, function (velocity, note) {
            if (velocity) {
                noteSum += parseInt(note, 10);
                velocitySum += velocity;
                notesHeld++;
            }
        });
        var averageNote = Math.round(noteSum/notesHeld);
        var averageVelocity = Math.round(velocitySum / notesHeld);
        return { notesHeld: notesHeld, note: averageNote, velocity: averageVelocity };
    };

    // TODO: Standardise this
    flock.midi.interchange.demos.consensus.sendToOutput = function (outputComponent, message) {
        var outputConnection = fluid.get(outputComponent, "connection");
        if (outputConnection) {
            outputConnection.send(message);
        }
    };

    fluid.defaults("flock.midi.interchange.demos.consensus", {
        gradeNames: ["fluid.viewComponent"],
        selectors: {
            noteInput:  ".note-input",
            noteOutput: ".note-output",
        },
        members: {
            heldNotesByChannel: {
                0:  {},
                1:  {},
                2:  {},
                3:  {},
                4:  {},
                5:  {},
                6:  {},
                7:  {},
                8:  {},
                9:  {},
                10: {},
                11: {},
                12: {},
                13: {},
                14: {},
                15: {}
            }
        },
        invokers: {
            sendNote: {
                funcName: "flock.midi.interchange.demos.consensus.sendToOutput",
                args: ["{that}.noteOutput", "{arguments}.0"] // outputComponent, message
            }
        },
        components: {
            enviro: {
                type: "flock.enviro"
            },
            noteInput: {
                type: "flock.auto.ui.midiConnector",
                container: "{that}.dom.noteInput",
                options: {
                    preferredDevice: "{consensus}.options.preferredInputDevice",
                    portType: "input",
                    components: {
                        midiPortSelector: {
                            options: {
                                strings: {
                                    selectBoxLabel: "Note Input",
                                }
                            }
                        }
                    },
                    listeners: {
                        "note": {
                            funcName: "flock.midi.interchange.demos.consensus.handleNoteMessage",
                            args: ["{consensus}", "{arguments}.0"] // midiMessage
                        }
                    }
                }
            },
            noteOutput: {
                type: "flock.auto.ui.midiConnector",
                container: "{that}.dom.noteOutput",
                options: {
                    preferredDevice: "{consensus}.options.preferredOutputDevice",
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
            }
        }
    });

})(fluid, flock);
