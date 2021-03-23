(function (flock, fluid) {
    "use strict";
    fluid.registerNamespace("flock.midi.interchange.demos.launchpadPong");

    fluid.defaults("flock.midi.interchange.demos.launchpadPong", {
        gradeNames: ["fluid.viewComponent"],
        preferredInputDevice:    "Launchpad Pro 7 Standalone Port",
        preferredUIOutputDevice: "Launchpad Pro 7 Standalone Port",
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
        model: {
            colourScheme: "{that}.options.colourSchemes.white"
        },
        colourSchemes: {
            // TODO: Add "inverse" colour options if needed.
            white:  { r: 1, g: 1,    b: 1, control: 1, velocity: 1  },
            red:    { r: 1, g: 0,    b: 0, control: 2, velocity: 5  },
            orange: { r: 1, g: 0.25, b: 0, control: 3, velocity: 9  }, // In HTML the RGB values for orange would be way off, but for the Launchpad Pro it works.
            yellow: { r: 1, g: 1,    b: 0, control: 4, velocity: 13 },
            green:  { r: 0, g: 1,    b: 0, control: 5, velocity: 17 },
            blue:   { r: 0, g: 1,    b: 1, control: 6, velocity: 90 },
            indigo: { r: 0, g: 0,    b: 1, control: 7, velocity: 79 },
            violet: { r: 1, g: 0,    b: 1, control: 8, velocity: 53 }
        },
        members: {
            bpm: 256,
            currentBpm: 256,
            impactNotes: {},
            activeNotes: {},
            ball: {
                col: 1,
                row: 6,
                vx: 1,
                vy: 1
            }
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
                    preferredPort: "{launchpadPong}.options.preferredInputDevice",
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
                    preferredPort: "{launchpadPong}.options.preferredOutputDevice",
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
                    preferredPort: "{launchpadPong}.options.preferredUIOutputDevice",
                    components: {
                        connection: {
                            options: {
                                sysex: true, // Required to configure the Launchpad Pro.
                                listeners: {
                                    "onReady.setupDevice": {
                                        funcName: "fluid.each",
                                        args:     ["{launchpadPong}.options.setupMessages", "{launchpadPong}.sendToUi"]
                                    },
                                    "onReady.paintDevice": {
                                        funcName: "flock.midi.interchange.demos.launchpadPong.paintDevice",
                                        args: ["{launchpadPong}"]
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
            sendToNoteOut: {
                funcName: "flock.midi.interchange.demos.launchpadPong.sendToOutput",
                args: ["{noteOutput}", "{arguments}.0"] // outputComponent, message
            },
            sendToUi: {
                funcName: "flock.midi.interchange.demos.launchpadPong.sendToOutput",
                args: ["{uiOutput}", "{arguments}.0"] // outputComponent, message
            },
            updateBall: {
                funcName: "flock.midi.interchange.demos.launchpadPong.updateBall",
                args: ["{that}"]
            }
        },
        listeners: {
            "onCreate.startPolling": {
                funcName: "flock.midi.interchange.demos.launchpadPong.startPolling",
                args: ["{that}"]
            },
            "noteOn.handle": {
                funcName: "flock.midi.interchange.demos.launchpadPong.handleNoteOn",
                args: ["{that}", "{arguments}.0"] // midiMessage
            },
            "noteOff.handle": {
                funcName: "flock.midi.interchange.demos.launchpadPong.handleNoteOff",
                args: ["{that}", "{arguments}.0"] // midiMessage
            },
            "control.handle": {
                funcName: "flock.midi.interchange.demos.launchpadPong.handleControl",
                args: ["{that}", "{arguments}.0"] // midiMessage
            }
        },
        modelListeners: {
            "bpm": {
                excludeSource: "init",
                funcName: "flock.midi.interchange.demos.launchpadPong.updateBpm",
                args: ["{that}"]
            },
            "colourScheme": {
                excludeSource: "init",
                funcName: "flock.midi.interchange.demos.launchpadPong.paintDevice",
                args: ["{that}"]
            }
        }
    });

    /**
     *
     * "Paint" the launchpad pro using its sysex message support.
     *
     * @param that
     */
    flock.midi.interchange.demos.launchpadPong.paintDevice = function (that) {
        var valueArray = flock.midi.interchange.demos.launchpadPong.generateColourArray(that);
        flock.midi.interchange.demos.launchpadPong.sendValueArrayToDevice(that, valueArray);
    };

    /**
     *
     * @param {Object} that - The launchpadPong component itself.
     * @param {Array<Number>} colourArray -
     *  An array of numbers from 0 to 1 that represent one colour channel for a single cell.
     *  To paint an 8 x 8 grid, you need 64 x 3, or 192 values.
     *
     */
    flock.midi.interchange.demos.launchpadPong.sendValueArrayToDevice = function (that, colourArray) {
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

        // Paint each of the colour controls.
        fluid.each(that.options.colourSchemes, function (colourScheme) {
            if (colourScheme.control) {
                that.sendToUi({ type: "control", channel: 0, number: colourScheme.control, value: colourScheme.velocity});
            }
        })
    };


    /**
     *
     * @param {Object} that - The launchpad pong component itself.
     * @return {Array<Number>} - An array of numbers from 0 to 1 that represent one colour channel for a single cell.
     *  To paint an 8 x 8 grid, you need 64 x 3, or 192 values.
     *
     */
    flock.midi.interchange.demos.launchpadPong.generateColourArray = function (that) {
        var allNotes = [];

        /*
                Look at the active notes in programmer mode, which are:

                81 82 83 84 85 86 87 88
                71 72 73 74 75 76 77 78
                61 62 63 64 65 66 67 68
                51 52 53 54 55 56 57 58
                41 42 43 44 45 46 47 48
                31 32 33 34 35 36 37 38
                21 22 23 24 25 26 27 28
                11 12 13 14 15 16 17 18

         */

        for (var row = 0; row < 8; row++)  {
            for (var col = 0; col < 8; col++) {
                var noteForPosition = flock.midi.interchange.demos.launchpadPong.noteFromPosition(row, col);

                // Display "ball" if this is its position
                if (col === that.ball.col && row === that.ball.row) {
                    // Play updated note if it hasn't already been played as an "impact".
                    var ballNote = flock.midi.interchange.demos.launchpadPong.noteFromPosition(that.ball.row, that.ball.col);
                    var ballOpacity = that.impactNotes[ballNote] ? 1 : 0.25;
                    var ballColours = flock.midi.interchange.demos.launchpadPong.generateSingleCellColours(that, ballOpacity);
                    allNotes.push(ballColours);
                }
                // Otherwise, display any held notes.
                else {
                    var isHeld = fluid.get(that.activeNotes, noteForPosition);
                    var cellOpacity = isHeld ? 0.125 : 0;
                    var singleCellColours = flock.midi.interchange.demos.launchpadPong.generateSingleCellColours(that, cellOpacity);
                    allNotes.push(singleCellColours);
                }
            }
        }

        return fluid.flatten(allNotes);
    };

    /**
     *
     * @param {Object} that - The launchpadPong component itself.
     * @param {Number} cellOpacity - The base opacity for this cell from 0 (black) to 1 (full intensity)
     * @returns {Array<Number>} - An array of RGB values for this cell.
     *
     */
    flock.midi.interchange.demos.launchpadPong.generateSingleCellColours = function (that, cellOpacity) {
        var cellValues = [];
        fluid.each(["r", "g", "b"], function (colourKey, index) {
            var maxLevel        = that.model.colourScheme[colourKey] * 0x3F;
            var calculatedLevel = maxLevel * cellOpacity;

            cellValues[index] = calculatedLevel;
        });
        return cellValues;
    };

    flock.midi.interchange.demos.launchpadPong.handleControl = function (that, midiMessage) {
        // TODO: Add support for raising/lowering pitch
        if (midiMessage.value) {
            if (midiMessage.number >=1 && midiMessage.number <=8) {
                // CCs one through eight control the colour
                var colourScheme = fluid.find(that.options.colourSchemes, function (candidateColourScheme) {
                    return candidateColourScheme.control === midiMessage.number ? candidateColourScheme : undefined;
                });
                // TODO: Toggle between positive and negative variations on the same colour theme if they hit the color twice.
                if (colourScheme) {
                    that.applier.change("colourScheme", colourScheme);
                }
            }
            // TODO: We can only implement this if we figure out how to handle the notes that are already playing.  Silence all?
            // Probably needs to be a model variable, then.
            // // Increase pitch shift on upward arrow.
            // else if (midiMessage.number === 91) {
            //     if (that.pitchShift < 44) {
            //         that.pitchShift++;
            //     }
            // }
            // else if (midiMessage.number === 92) {
            //     if (that.pitchShift > -20) {
            //         that.pitchShift--;
            //     }
            // }
            // Decrease BPM on left arrow.
            else if (midiMessage.number === 93) {
                if (that.bpm > 16) {
                    that.bpm /= Math.sqrt(2);
                }
            }
            // Increase BPM on right arrow.
            else if (midiMessage.number === 94) {
                if (that.bpm < 2400) {
                    that.bpm *= Math.sqrt(2);
                }
            }
        }
    };

    flock.midi.interchange.demos.launchpadPong.handleNoteOn = function (that, originalMessage) {
        var transformedMessage = fluid.model.transformWithRules(originalMessage, flock.midi.interchange.tunings.launchpadPro.common);

        // Add the note to the list of "held" notes (actual MIDI input value).
        // We use the original note because we are going to have to paint it on the raw device.
        that.activeNotes[originalMessage.note] = true;

        flock.midi.interchange.demos.launchpadPong.paintDevice(that);

        that.sendToNoteOut(transformedMessage);
    };

    flock.midi.interchange.demos.launchpadPong.handleNoteOff = function (that, originalMessage) {
        var transformedMessage = fluid.model.transformWithRules(originalMessage, flock.midi.interchange.tunings.launchpadPro.common);

        // Remove the note from the list of "held" notes (actual MIDI input value) if it's there.
        // We use the original note because we are going to have to paint it on the raw device.
        that.activeNotes[originalMessage.note] = false;

        flock.midi.interchange.demos.launchpadPong.paintDevice(that);

        // Pass the note along to the output device (we could make this conditional, but it's harmless).
        that.sendToNoteOut(transformedMessage);
    };

    // TODO: Make a generalised pattern for this, we use it so so often.
    flock.midi.interchange.demos.launchpadPong.sendToOutput = function (outputComponent, message) {
        var outputConnection = fluid.get(outputComponent, "connection");
        if (outputConnection) {
            outputConnection.send(message);
        }
    };

    flock.midi.interchange.demos.launchpadPong.startPolling = function (that) {
        that.scheduler.schedule({
            type: "repeat",
            freq: 1,
            callback: that.updateBall
        });

        that.scheduler.setTimeScale(60 / that.currentBpm);
        that.scheduler.start();
    };

    flock.midi.interchange.demos.launchpadPong.noteFromPosition = function (row, col) {
        return (10 * (row + 1)) + ((col + 1));
    };

    flock.midi.interchange.demos.launchpadPong.updateBall = function (that) {
        // If our speed has changed, update the scheduler and trigger the next step early to avoid a "stutter".
        if (that.currentBpm !== that.bpm) {
            that.currentBpm = that.bpm;
            that.scheduler.setTimeScale(60 / that.currentBpm);
            return;
        }

        // Stop playing note for current position.
        var oldNote = flock.midi.interchange.demos.launchpadPong.noteFromPosition(that.ball.row, that.ball.col);
        var oldLaunchpadRelativeMessage = {
            channel: 0,
            type: "noteOff",
            note: oldNote,
            velocity: 0
        };
        var oldCommonRelativeMessage = fluid.model.transformWithRules(oldLaunchpadRelativeMessage, flock.midi.interchange.tunings.launchpadPro.common);
        that.sendToNoteOut(oldCommonRelativeMessage);

        var nextSpace = flock.midi.interchange.demos.launchpadPong.calculateNextSpace(that);
        var nextSpaceWithBlockers = flock.midi.interchange.demos.launchpadPong.calculateBlockers(that, nextSpace);

        /*

            Impact with a blocker changes the ball's direction before the next "movement" phase, as follows:

            1. Regardless of the blockers around the ball, if the square in front of the ball is a non-blocker, it moves forward.
            2. If the blocker is a single square in front of the ball (or if all three squares are filled), the ball rebounds (180 degree turn).
            3. If the blocker is more than one square, the "shape" of the blocker relative to the ball determines the change in angle.  The three squares in front of the ball are evaluated.

               ? ? ?  ? ?
                 |    ? \

            4. If two out of three blocks are filled, movement continues into the empty square.

            5. If one of the side squares is filled, the ball deflects 45 degrees away from it.

         */

        var willCollide = false;
        var angleChange = 0;

        // The square dead in front of us is blocked.
        if (nextSpaceWithBlockers.center.isBlocked) {
            willCollide = true;

            var isDiagonal = (Math.abs(that.ball.vx) + Math.abs(that.ball.vy)) === 2;
            if (isDiagonal && nextSpaceWithBlockers.center.isWall) {
                if (nextSpaceWithBlockers.center.col < 0 || nextSpaceWithBlockers.center.col > 7) {
                    that.ball.vx *= -1;
                }
                if (nextSpaceWithBlockers.center.row < 0 || nextSpaceWithBlockers.center.row > 7) {
                    that.ball.vy *= -1;
                }
            }
            else {
                that.ball.vx *= -1;
                that.ball.vy *= -1;
            }
        }
        else if (nextSpaceWithBlockers.left.isBlocked && !nextSpaceWithBlockers.right.isBlocked) {
            willCollide = true;

            // Nudge right by 45 degrees.
            angleChange = 45;
        }
        else if (nextSpaceWithBlockers.right.isBlocked && !nextSpaceWithBlockers.left.isBlocked) {
            willCollide = true;

            // Nudge left by 45 degrees.
            angleChange = -45;
        }

        if (willCollide) {
            if (angleChange) {
                var currentAngle = flock.midi.interchange.demos.launchpadPong.angleFromVelocities(that.ball.vx, that.ball.vy);
                var newAngle = currentAngle + angleChange;
                var newRadians = newAngle * Math.PI / 180;
                that.ball.vx = Math.round(Math.cos(newRadians));
                that.ball.vy = Math.round(Math.sin(newRadians));
            }

            // Play a note for the ball.
            var ballNote = flock.midi.interchange.demos.launchpadPong.noteFromPosition(that.ball.row, that.ball.col);
            var impactLaunchpadRelativeMessage = {
                channel: 0,
                type: "noteOn",
                note: ballNote,
                velocity: that.model.colourScheme.velocity
            };

            that.sendToUi(impactLaunchpadRelativeMessage);

            var impactCommonRelativedMessage = fluid.model.transformWithRules(impactLaunchpadRelativeMessage, flock.midi.interchange.tunings.launchpadPro.common);
            impactCommonRelativedMessage.velocity = 127;
            that.sendToNoteOut(impactCommonRelativedMessage);

            that.impactNotes[ballNote] = that.impactNotes[ballNote] ? that.impactNotes[ballNote]++ : 1;
        }
        else {
            var nextRow = that.ball.row + that.ball.vy;
            var nextCol = that.ball.col + that.ball.vx;

            // Clear out any notes previously triggered by an impact.
            fluid.each(that.impactNotes, function (timesToPlay, impactNote) {
                // Anything > 0, keep the note playing.
                if (timesToPlay) {
                    that.impactNotes[impactNote]--;
                }
                // On zero, stop the note and then stop tracking this as an impact note.
                else {
                    var impactLaunchpadRelativeMessage = {
                        channel: 0,
                        type: "noteOff",
                        note: impactNote,
                        velocity: 0
                    };
                    var impactCommonRelativeMessage = fluid.model.transformWithRules(impactLaunchpadRelativeMessage, flock.midi.interchange.tunings.launchpadPro.common);
                    that.sendToNoteOut(impactCommonRelativeMessage);
                    delete that.impactNotes[impactNote]
                }
            });

            var newNote = flock.midi.interchange.demos.launchpadPong.noteFromPosition(nextRow, nextCol);
            var newLaunchpadRelativeMessage = {
                channel: 0,
                type: "noteOn",
                note: newNote,
                velocity: 16
            };

            var newCommonRelativedMessage = fluid.model.transformWithRules(newLaunchpadRelativeMessage, flock.midi.interchange.tunings.launchpadPro.common);
            that.sendToNoteOut(newCommonRelativedMessage);

            that.ball.row = nextRow;
            that.ball.col = nextCol;

            flock.midi.interchange.demos.launchpadPong.paintDevice(that);
        }
    };

    // Calculate the "left", "center" and "right" squares that are right in "front" of us.
    flock.midi.interchange.demos.launchpadPong.calculateNextSpace = function (that) {
        var centerRow = that.ball.row + that.ball.vy;
        var centerCol = that.ball.col + that.ball.vx;
        var isDiagonal = (Math.abs(that.ball.vx) + Math.abs(that.ball.vy)) === 2;
        if (isDiagonal) {
            // Heading towards upper right or lower left.
            if (that.ball.vx === that.ball.vy) {
                return ({
                    left: {
                        col: centerCol,
                        row: centerRow - that.ball.vy
                    },
                    center: {
                        col: centerCol,
                        row: centerRow
                    },
                    right: {
                        col: centerCol - that.ball.vx,
                        row: centerRow
                    }
                });
            }
            // Heading towards lower right or upper left.
            else {
                return ({
                    left: {
                        col: centerCol - that.ball.vx,
                        row: centerRow
                    },
                    center: {
                        col: centerCol,
                        row: centerRow
                    },
                    right: {
                        col: centerCol,
                        row: centerRow - that.ball.vy
                    }
                });
            }
        }
        else {
            var polarity = that.ball.vx + that.ball.vy;
            // Horizontal movement
            if (that.ball.vx !== 0) {
                return({
                    left: {
                        col: centerCol,
                        row: centerRow - polarity
                    },
                    center: {
                        col: centerCol,
                        row: centerRow
                    },
                    right: {
                        col: centerCol,
                        row: centerRow + polarity
                    }
                });
            }
            // Vertical movement
            else {
                return({
                    left: {
                        col: centerCol + polarity,
                        row: centerRow
                    },
                    center: {
                        col: centerCol,
                        row: centerRow
                    },
                    right: {
                        col: centerCol - polarity,
                        row: centerRow
                    }
                });
            }
        }
    };

    flock.midi.interchange.demos.launchpadPong.calculateBlockers = function (that, spaceScan) {
        var spaceScanWithBlockers = fluid.copy(spaceScan);
        fluid.each(spaceScan, function (position, key) {
            // Is it out of bounds (i.e. a wall)?
            if (position.row < 0 || position.col < 0 || position.row > 7 || position.col > 7) {
                spaceScanWithBlockers[key].isBlocked = true;
                spaceScanWithBlockers[key].isWall = true;
            }
            else {
                // Is it a held note?
                var noteForPosition = flock.midi.interchange.demos.launchpadPong.noteFromPosition(position.row, position.col);
                var isHeld = fluid.get(that.activeNotes, noteForPosition);
                if (isHeld) {
                    spaceScanWithBlockers[key].isBlocked = true;
                    spaceScanWithBlockers[key].isNote = true;
                }
            }
        });

        return spaceScanWithBlockers;
    };

    flock.midi.interchange.demos.launchpadPong.angleFromVelocities = function (vx, vy) {
        // Need to come up with a mathier way to do this.
        if (vx === -1) {
            if (vy === 1) {
                return 135;
            }
            if (vy === 0) {
                return 180;
            }
            if (vy === -1) {
                return 225;
            }
        }
        if (vx === 0) {
            if (vy === -1) {
                return 270;
            }
            if (vy === 1) {
                return 90;
            }

        }
        if (vx === 1) {
            if (vy === 1) {
                return 45;
            }
            if (vy === 0) {
                return 0;
            }
            if (vy === -1) {
                return 315;
            }
        }
    };
})(flock, fluid);
