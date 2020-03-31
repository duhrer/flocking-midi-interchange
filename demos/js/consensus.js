/* globals fluid, flock */
(function (fluid, flock) {
    "use strict";
    fluid.registerNamespace("flock.midi.interchange.demos.consensus");

    flock.midi.interchange.demos.consensus.handleNoteMessage = function (that, midiMessage) {
        // TODO: Transform the input to standardise the tuning.
        var isHeld = (midiMessage.type === "noteOn" && midiMessage.velocity) ? true : false;
        if (isHeld) {
            that.heldVelocities[midiMessage.note] = midiMessage.velocity;
        }
        else {
            delete that.heldVelocities[midiMessage.note];
        }

        that.targetState = flock.midi.interchange.demos.consensus.calculateAverages(that.heldVelocities);
    };

    flock.midi.interchange.demos.consensus.calculateAverages = function (noteMap) {
        var noteSum     = 0;
        var velocitySum = 0;
        var activeNotes = 0;
        fluid.each(noteMap, function (velocity, noteAsString) {
            if (velocity) {
                noteSum += parseInt(noteAsString, 10);
                velocitySum += velocity;
                activeNotes++;
            }
        });
        var averageNote = noteSum/activeNotes;
        var averageVelocity = Math.round(velocitySum / activeNotes);
        return { activeNotes: activeNotes, averageNote: averageNote, averageVelocity: averageVelocity };
    };

    flock.midi.interchange.demos.consensus.sendToOutput = function (outputComponent, uiOutputComponent, message) {
        var outputConnection = fluid.get(outputComponent, "connection");
        if (outputConnection) {
            outputConnection.send(message);
        }

        // TODO: Transform the output to reverse the input tuning and use the selected colour scheme.
        var uiOutputConnection = fluid.get(uiOutputComponent, "connection");
        if (uiOutputConnection) {
            uiOutputConnection.send(message);
        }
    };

    flock.midi.interchange.demos.consensus.scheduleCourseAdjustment = function (that) {
        that.scheduler.schedule({
            type: "repeat",
            freq: 5,
            callback: that.adjustCourse
        });
        that.scheduler.start();
    };

    flock.midi.interchange.demos.consensus.adjustCourse = function (that) {
        // Check the current set of playing notes against the target and adjust course.
        if (that.targetState.activeNotes) {
            // Find the current "state of play" and adjust course.
            var playingState = flock.midi.interchange.demos.consensus.calculateAverages(that.playingVelocities);
            // { activeNotes: activeNotes, averageNote: averageNote, averageVelocity: averageVelocity }

            if (playingState.activeNotes) {
                var velocityPolarity = playingState.averageVelocity === that.targetState.averageVelocity ? 0 : that.targetState.averageVelocity > playingState.averageVelocity ? 1 : -1;
                var adjustedVelocity = Math.min(127, Math.max(0, playingState.averageVelocity + (velocityPolarity * that.options.velocityDelta)));
                var notePolarity = playingState.averageNote === that.targetState.averageNote ? 0 : that.targetState.averageNote > playingState.averageNote ? 1 : -1;
                var adjustedNote = Math.min(127, Math.max(0, playingState.averageNote + (notePolarity * that.options.noteDelta)));
                that.playAverageNote(adjustedNote, adjustedVelocity);
            }
            // Start playing the average note directly.
            else {
                that.playAverageNote(that.targetState.averageNote, that.targetState.averageVelocity);
            }
        }
        // No notes are held.  Fade any remaining playing notes.
        else {
            fluid.each(that.playingVelocities, function (velocity, noteAsString) {
                if (velocity) {
                    var note = parseInt(noteAsString, 10);
                    var newVelocity = Math.max(0, velocity - that.options.velocityDelta);
                    var noteType = newVelocity ? "aftertouch" : "noteOff";
                    that.sendToOutput({
                        channel: that.model.outputChannel,
                        type: noteType,
                        note: note,
                        velocity: newVelocity
                    });

                    // Save the value if there is one, delete the entry if it's been silenced.
                    if (newVelocity) {
                        that.playingVelocities[noteAsString] = newVelocity;
                    }
                    else {
                        delete that.playingVelocities[noteAsString];
                    }
                }
            });
        }
    };

    flock.midi.interchange.demos.consensus.playAverageNote = function (that, averageNote, averageVelocity) {
        console.log("average note", averageNote);
        var trailingNote         = Math.floor(averageNote);
        var leadingNote          = trailingNote + 1;
        var leadingNoteFraction  = averageNote % 1;
        var trailingNoteFraction = 1 - leadingNoteFraction;
        var trailingNoteVelocity = Math.round(averageVelocity * trailingNoteFraction);
        var leadingNoteVelocity  = Math.round(averageVelocity * leadingNoteFraction);

        // Play and/or adjust our "trailing" note.
        var trailingNoteType = fluid.get(that.playingVelocities, trailingNote) ? "aftertouch" : "noteOn";
        that.sendToOutput({
            channel: that.model.outputChannel,
            type: trailingNoteType,
            note: trailingNote,
            velocity: trailingNoteVelocity,
            pressure: trailingNoteVelocity
        });
        that.playingVelocities[trailingNote] = trailingNoteVelocity;

        // We have a fractional "leading" note to play and/or adjust.
        if (leadingNoteFraction) {
            var leadingNoteType = fluid.get(that.playingVelocities, leadingNote) ? "aftertouch" : "noteOn";
            that.sendToOutput({
                channel: that.model.outputChannel,
                type: leadingNoteType,
                note: leadingNote,
                velocity: leadingNoteVelocity,
                pressure: leadingNoteVelocity
            });
            that.playingVelocities[leadingNote] = leadingNoteVelocity;
        }
        // The "leading" note was previously active and needs to be cleared.
        else if (fluid.get(that.playingVelocities, leadingNote)) {
            that.sendToOutput({
                channel: that.model.outputChannel,
                type: "noteOff",
                note: leadingNote,
                velocity: 0
            });
            delete that.playingVelocities[leadingNote];
        }

        // Silence anything else that shouldn't be playing.
        fluid.each(that.playingVelocities, function (velocity, noteAsString) {
            var playingNote = parseInt(noteAsString, 10);
            if (playingNote !== trailingNote && playingNote !== leadingNote) {
                if (velocity) {
                    that.sendToOutput({
                        channel: that.model.outputChannel,
                        type: "noteOff",
                        note: playingNote,
                        velocity: 0
                    });
                    that.playingVelocities[playingNote] = 0;
                }
            }
        });

        // Purge any values zeroed above.
        that.playingVelocities = fluid.transform(that.playingVelocities, function (velocity) {
            return velocity || undefined;
        });
    };

    fluid.defaults("flock.midi.interchange.demos.consensus", {
        gradeNames: ["fluid.viewComponent"],
        selectors: {
            noteInput:  ".note-input",
            noteOutput: ".note-output",
            uiOutput:   ".ui-output",
        },
        velocityDelta: 16,
        noteDelta: 1,
        preferredInputDevice:    "Launchpad Pro Standalone Port",
        preferredOutputDevice:   "EIE", // Only thing I have with polyphonic aftertouch.
        preferredUiOutputDevice: "Launchpad Pro Standalone Port",
        model: {
            outputChannel: 0
        },
        members: {
            heldVelocities:    {},
            playingVelocities: {},
            targetState: {
                heldNotes: 0
            }
        },
        invokers: {
            sendToOutput: {
                funcName: "flock.midi.interchange.demos.consensus.sendToOutput",
                args: ["{that}.noteOutput", "{that}.uiOutput", "{arguments}.0"] // outputComponent, uiOutputComponent, message
            },
            adjustCourse: {
                funcName: "flock.midi.interchange.demos.consensus.adjustCourse",
                args: ["{that}"]
            },
            playAverageNote: {
                funcName: "flock.midi.interchange.demos.consensus.playAverageNote",
                args: ["{that}", "{arguments}.0", "{arguments}.1"] // that, averageNote, averageVelocity
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
            },
            // TODO: Configure the Launchpad Pro on startup.
            uiOutput: {
                type: "flock.auto.ui.midiConnector",
                container: "{that}.dom.uiOutput",
                options: {
                    preferredDevice: "{consensus}.options.preferredUiOutputDevice",
                    portType: "output",
                    components: {
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
        listeners: {
            "onCreate.scheduleCourseAdjustment": {
                funcName: "flock.midi.interchange.demos.consensus.scheduleCourseAdjustment",
                args: ["{that}"]
            }
        }
    });
})(fluid, flock);
