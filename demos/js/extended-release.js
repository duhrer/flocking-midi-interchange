/* globals fluid, flock */
(function (fluid, flock) {
    "use strict";
    fluid.registerNamespace("flock.midi.interchange.demos.extendedRelease");

    flock.midi.interchange.demos.extendedRelease.handleNoteOn = function (that, midiMessage) {
        if (midiMessage.velocity) {
            // fluid.set(model, path, newValue)
            fluid.set(that.heldNotesByChannel, [midiMessage.channel, midiMessage.note], midiMessage.velocity);
            that.sendNote(midiMessage);
        }
        else {
            flock.midi.interchange.demos.extendedRelease.handleNoteOff(that, midiMessage);
        }
    };

    flock.midi.interchange.demos.extendedRelease.handleNoteOff = function (that, midiMessage) {
        var velocity = fluid.get(that.heldNotesByChannel, [midiMessage.channel, midiMessage.note]);
        if (velocity) {
            // fluid.set(model, path, newValue)
            fluid.set(that.ghostNotesByChannel, [midiMessage.channel, midiMessage.note], velocity);
        }
    };


    flock.midi.interchange.demos.extendedRelease.decayGhostNotes = function (that) {
        fluid.each(that.ghostNotesByChannel, function (channelNotes, channelAsString) {
            var channel = parseInt(channelAsString, 10);
            var toPurge = [];
            fluid.each(channelNotes, function (velocity, noteAsString) {
                var note = parseInt(noteAsString, 10);
                //console.log(channel, note, velocity);
                if (velocity) {
                    // new = max(0, round(old - max(1, (that.options.decrement * old))))
                    var newVelocity = Math.max(0, velocity - Math.max(1, Math.round(that.options.decrement * velocity)));
                    fluid.set(that.ghostNotesByChannel, [channel, note], newVelocity);
                    //// TODO: make a "strategy" toggle and make this an optional strategy.
                    // "aftertouch" strategy
                    that.sendNote({ channel: channel, type: "aftertouch", note: note, velocity: newVelocity, pressure: newVelocity });
                    // "echo" strategy
                    //that.sendNote({ channel: channel, type: "noteOff", note: note, velocity: 0 });
                    //that.sendNote({ channel: channel, type: "noteOn", note: note, velocity: newVelocity });
                }
                else {
                    toPurge.push(note);
                }
            });
            fluid.each(toPurge, function (noteToPurge) {
                that.sendNote({ channel: channel, type: "noteOff", note: noteToPurge, velocity: 0 });
                delete channelNotes[noteToPurge];
            });
        });
    };

    // TODO: Standardise this
    flock.midi.interchange.demos.extendedRelease.sendToOutput = function (outputComponent, message) {
        var outputConnection = fluid.get(outputComponent, "connection");
        if (outputConnection) {
            outputConnection.send(message);
        }
    };

    flock.midi.interchange.demos.extendedRelease.scheduleGhostWatch = function (that) {
        that.scheduler.schedule({
            type: "repeat",
            freq: 5,
            callback: that.decayGhostNotes
        });
        that.scheduler.start();
    };

    fluid.defaults("flock.midi.interchange.demos.extendedRelease", {
        gradeNames: ["fluid.viewComponent"],
        decrement: 0.1666,
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
            },
            ghostNotesByChannel: {
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
                funcName: "flock.midi.interchange.demos.extendedRelease.sendToOutput",
                args: ["{that}.noteOutput", "{arguments}.0"] // outputComponent, message
            },
            decayGhostNotes: {
                funcName: "flock.midi.interchange.demos.extendedRelease.decayGhostNotes",
                args: ["{that}"]
            }
        },
        components: {
            noteInput: {
                type: "flock.midi.connectorView",
                container: "{that}.dom.noteInput",
                options: {
                    preferredPort: "{extendedRelease}.options.preferredInputDevice",
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
                        "noteOn": {
                            funcName: "flock.midi.interchange.demos.extendedRelease.handleNoteOn",
                            args: ["{extendedRelease}", "{arguments}.0"] // midiMessage
                        },
                        "noteOff": {
                            funcName: "flock.midi.interchange.demos.extendedRelease.handleNoteOff",
                            args: ["{extendedRelease}", "{arguments}.0"] // midiMessage
                        }
                    }
                }
            },
            noteOutput: {
                type: "flock.midi.connectorView",
                container: "{that}.dom.noteOutput",
                options: {
                    preferredPort: "{extendedRelease}.options.preferredOutputDevice",
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
            scheduler: {
                type: "berg.scheduler",
                options: {
                    components: {
                        clock: {
                            type: "berg.clock.raf",
                            options: {
                                freq: 20 // times per second
                            }
                        }
                    }
                }
            }
        },
        listeners: {
            "onCreate.scheduleGhostWatch": {
                funcName: "flock.midi.interchange.demos.extendedRelease.scheduleGhostWatch",
                args: ["{that}"]
            }
        }
    });

})(fluid, flock);
