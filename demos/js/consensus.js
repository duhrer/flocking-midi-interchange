/* globals fluid, flock */
(function (fluid, flock) {
    "use strict";
    fluid.registerNamespace("flock.midi.interchange.demos.consensus");

    /*

        TODO: Gather the data we need to calculated a weighted pitch which is:

        The sum of all (velocity * pitch) values
        ----------------------------------------
        The sum of all velocity values


        The average velocity is calculated as:

        The sum of all velocity values
        -----------------------------------------
        The number of held notes


        For each update, we need to:

        1) Subtract the old (velocity * pitch) from the sum of all (velocity * pitch) values.
        2) Add the new (velocity * pitch) to the sum of all (velocity * pitch).
        3) Subtract the old velocity from the sum of all velocity values.
        4) Add the new velocity to the sum of all velocity values.
        5) Update the number of held notes.
        6) Notify the parent component if there are changes.

     */
    // TODO: Move this to the individual input components
    // TODO: track the velocity per note
    // TODO: If the velocity for any note changes, update the velocitySum
    flock.midi.interchange.demos.consensus.handleNoteMessage = function (that, midiMessage) {
        var oldVelocity = fluid.get(that.velocityByNote, midiMessage.note) || 0;
        var newVelocity = fluid.get(midiMessage, "velocity") || 0;
        if (newVelocity !== oldVelocity) {
            fluid.set(that.velocityByNote, [midiMessage.note], midiMessage.velocity);

            // Subtract the old (velocity * pitch) from the sum of all (velocity * pitch) values.
            that.pitchWeightedVelocity -= (oldVelocity * midiMessage.note);

            // Add the new (velocity * pitch) to the sum of all (velocity * pitch).
            that.pitchWeightedVelocity += (newVelocity * midiMessage.note);

            // Subtract the old velocity from the sum of all velocity values.
            that.totalVelocity -= oldVelocity;

            // Add the new velocity to the sum of all velocity values.
            that.totalVelocity += newVelocity;

            // Update the number of held notes as required.
            if (oldVelocity === 0) {
                that.heldNotes++;
            }
            else if (newVelocity ===  0) {
                that.heldNotes--;
            }

            // Notify the parent component that there are changes.
            that.events.notesUpdated.fire();
        }
    };

    fluid.defaults("flock.midi.interchange.demos.consensus.input", {
        gradeNames: ["flock.midi.connectorView"],
        portType: "input",
        boxLabel: "Input",
        events: {
            notesUpdated: null
        },
        members: {
            velocityByNote: {},
            heldNotes: 0,
            totalVelocity: 0,
            pitchWeightedVelocity: 0
        },
        components: {
            midiPortSelector: {
                options: {
                    strings: {
                        selectBoxLabel: "{flock.midi.interchange.demos.consensus.input}.options.boxLabel",
                    }
                }
            }
        },
        listeners: {
            "note": {
                funcName: "flock.midi.interchange.demos.consensus.handleNoteMessage",
                args:     ["{that}", "{arguments}.0"] // midiMessage
            }
        }
    });

    // TODO: Add a means of deleting inputs.
    // TODO: Add a means of saving the selected inputs.

    flock.midi.interchange.demos.consensus.updateTarget = function (that) {
        var totalHeldNotes = 0;
        var totalVelocity = 0;
        var totalPitchWeightedVelocity = 0;

        var inputComponents = fluid.queryIoCSelector(that, "flock.midi.interchange.demos.consensus.input");
        fluid.each(inputComponents, function (inputComponent) {
            totalHeldNotes += inputComponent.heldNotes;
            totalVelocity += inputComponent.totalVelocity;
            totalPitchWeightedVelocity += inputComponent.pitchWeightedVelocity;
        });

        var weightedPitch = totalVelocity ? Math.round(totalPitchWeightedVelocity / totalVelocity) : 0;
        var averageVelocity = totalHeldNotes ? Math.round(totalVelocity / totalHeldNotes) : 0;

        // console.log("targetPitch:", weightedPitch, "targetVelocity:", averageVelocity);
        that.targetPitch    = weightedPitch;
        that.targetVelocity = averageVelocity;
    };

    flock.midi.interchange.demos.consensus.sendToOutput = function (outputComponent, message) {
        var outputConnection = fluid.get(outputComponent, "connection");
        if (outputConnection) {
            outputConnection.send(message);
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
        // We only need to adjust course if we're not already at the desired target note and velocity.
        if ((that.currentVelocity !== that.targetVelocity) || (that.currentPitch !== that.targetPitch)) {
            // Stop playing if the new target velocity is zero.
            if (that.targetVelocity === 0) {
                that.sendToOutput({
                    channel:  that.model.outputChannel,
                    type:     "noteOff",
                    note:     that.currentPitch,
                    velocity: 0
                });
                that.currentPitch    = 0;
                that.currentVelocity = 0;
                that.targetPitch     = 0;
            }
            // Play a single note if there is no note playing at the moment.
            else if (that.currentVelocity === 0 && that.targetVelocity !== 0) {
                that.sendToOutput({
                    channel:  that.model.outputChannel,
                    type:     "noteOn",
                    note:     that.targetPitch,
                    velocity: that.targetVelocity
                });
                that.currentPitch    = that.targetPitch;
                that.currentVelocity = that.targetVelocity;
            }
            // Transition towards the target pitch if we are already playing something.
            else {
                if (that.targetPitch !== that.currentPitch) {
                    // Silence the previous note
                    that.sendToOutput({
                        channel:  that.model.outputChannel,
                        type:     "noteOff",
                        note:     that.currentPitch,
                        velocity: 0
                    });
                }

                var pitchDiff      = that.targetPitch - that.currentPitch;
                var pitchIncrement = pitchDiff ? pitchDiff/Math.abs(pitchDiff) : 0;
                var newPitch       = that.currentPitch + pitchIncrement;

                var velocityDiff      = that.targetVelocity - that.currentVelocity;
                var velocityDirection = velocityDiff ? velocityDiff/Math.abs(velocityDiff) : 0;

                // As the velocity changes involved are generally bigger, we line up the velocity offset based on
                // the number of updates we need to reach the target pitch.
                var pitchSyncedOffset = Math.round(velocityDiff/pitchDiff);

                // Make sure that we don't overshoot on the last update.
                var velocityOffset    = Math.min(Math.abs(velocityDiff), pitchSyncedOffset);
                var velocityIncrement = velocityDirection * velocityOffset;

                // Extra protection to avoid overshooting.
                var newVelocity = Math.min(127, (that.currentVelocity + velocityIncrement));

                var noteType = that.targetPitch === that.currentPitch ? "aftertouch" : "noteOn";

                // Play/update the note.
                var noteOnMessage = {
                    channel: that.model.outputChannel,
                    type:     noteType,
                    note:     newPitch,
                    velocity: newVelocity
                };

                // console.log(JSON.stringify(noteOnMessage, null, 2));
                that.sendToOutput(noteOnMessage);

                that.currentVelocity = newVelocity;
                that.currentPitch    = newPitch;
            }

            that.updateCanvas();
        }
    };

    flock.midi.interchange.demos.consensus.updateCanvas = function (that) {
        var canvas = document.getElementById("consensus-oscilloscope");
        var context = canvas.getContext("2d");
        // Clear the current contents;
        context.fillStyle = "rgba(0,0,0,1)";
        context.fillRect(0,0, canvas.width, canvas.height);

        // Draw the notes held on each controller.
        var allInputs = fluid.queryIoCSelector(that, "flock.midi.interchange.demos.consensus.input");
        fluid.each(allInputs, function (inputComponent, componentIndex) {
            var pointerColour = that.options.instrumentColours[componentIndex % 4];
            fluid.each(inputComponent.velocityByNote, function (velocity, pitch) {
                flock.midi.interchange.demos.consensus.drawPointer(context, pitch, velocity, pointerColour, componentIndex + 1);
            });
        });

        // Draw the "current" and "target" notes.
        if (that.currentPitch !== that.targetPitch) {
            flock.midi.interchange.demos.consensus.drawPointer(context, that.targetPitch, that.targetVelocity, that.options.targetNoteColour, 0);
        }

        flock.midi.interchange.demos.consensus.drawPointer(context, that.currentPitch, that.currentVelocity, that.options.currentNoteColour, 0);
    };

    flock.midi.interchange.demos.consensus.drawPointer = function (context, pitch, velocity, colour, offset) {
        var radius = Math.log2(Math.max(velocity, 1));
        var cx = ((context.canvas.width / 128) * pitch) + (radius/2);

        // Stagger instruments around the central "average" track.
        var yOffsetDir = offset % 2 ? 1 : -1;
        var cy = (context.canvas.height / 2) + (15 * Math.ceil(offset / 2) * yOffsetDir);

        context.beginPath();
        context.arc(cx, cy, radius, 0, 2 * Math.PI);
        context.fillStyle = colour;
        context.fill();
    };

    flock.midi.interchange.demos.consensus.addInput = function (that) {
        var existingInputs = fluid.queryIoCSelector(that, "flock.midi.interchange.demos.consensus.input");
        var newInputNumber = (existingInputs.length || 0) + 1;
        var newId = "input-" + newInputNumber;
        var newName = "Input " + newInputNumber;
        var newSelector = "#" + newId;

        // Render input container
        var routerContainer = that.locate("inputContainer");
        var newHtml = fluid.stringTemplate(that.options.templates.input, { id: newId });
        routerContainer.append(newHtml);

        that.dom.clear();

        // Create input component using dynamicOptions and createOnEvent.
        that.events.addInput.fire(newSelector, newName);
    };

    fluid.defaults("flock.midi.interchange.demos.consensus", {
        gradeNames: ["fluid.viewComponent"],
        instrumentColours: [
            "#00ff0099",
            "#0000ff99",
            "#ff000099",
        ],
        currentNoteColour: "#ffffff",
        targetNoteColour: "#999999",
        events: {
            addInput: null
        },
        templates: {
            input: "\n<div class=\"single-input\" id=\"%id\"></div>\n"
        },
        selectors: {
            addInputButton: ".add-input-button",
            inputContainer: ".input-container",
            noteOutput: ".note-output",
        },
        model: {
            outputChannel: 0
        },
        members: {
            currentVelocity: 0,
            currentPitch:    0,
            targetVelocity:  0,
            targetPitch:     0
        },
        invokers: {
            addInput: {
                funcName: "flock.midi.interchange.demos.consensus.addInput",
                args: ["{that}"]
            },
            adjustCourse: {
                funcName: "flock.midi.interchange.demos.consensus.adjustCourse",
                args: ["{that}"]
            },
            updateCanvas: {
                funcName: "flock.midi.interchange.demos.consensus.updateCanvas",
                args:     ["{that}"]
            },
            updateTarget: {
                funcName: "flock.midi.interchange.demos.consensus.updateTarget",
                args:     ["{that}"]
            },
            sendToOutput: {
                funcName: "flock.midi.interchange.demos.consensus.sendToOutput",
                args: ["{that}.noteOutput", "{arguments}.0"] // outputComponent, message
            }
        },
        dynamicComponents: {
            noteInput: {
                createOnEvent: "addInput",
                container: "{arguments}.0",
                type: "flock.midi.interchange.demos.consensus.input",
                options: {
                    boxLabel: "{arguments}.1",
                    listeners: {
                        "notesUpdated.updateTarget": {
                            "func": "{flock.midi.interchange.demos.consensus}.updateTarget"
                        }
                    }
                }
            }
        },
        components: {
            noteOutput: {
                type: "flock.midi.connectorView",
                container: "{that}.dom.noteOutput",
                options: {
                    preferredPort: "{consensus}.options.preferredOutputDevice",
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
                                freq: 50 // times per second
                            }
                        }
                    }
                }
            }
        },
        listeners: {
            // Start the "course correction" polling.
            "onCreate.scheduleCourseAdjustment": {
                funcName: "flock.midi.interchange.demos.consensus.scheduleCourseAdjustment",
                args: ["{that}"]
            },
            "onCreate.addInput": {
                "funcName": "{that}.addInput"
            },
            // TODO: Add keyboard input handling.
            "onCreate.wireAddButtonClick": {
                "this": "{that}.dom.addInputButton",
                method: "on",
                args:   ["click", "{that}.addInput"]
            }
        }
    });
})(fluid, flock);
