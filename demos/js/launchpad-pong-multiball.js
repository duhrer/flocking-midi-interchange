(function (flock, fluid) {
    "use strict";
    fluid.registerNamespace("flock.midi.interchange.demos.launchpadPong");

    fluid.defaults("flock.midi.interchange.demos.launchpadPong.multiball", {
        gradeNames: ["flock.midi.interchange.demos.launchpadPong"],
        startingHitPoints: 8, // Two bounces around diagonally.
        // vxMap[row][col]
        vxMap: [
            [ -1, -1,  0,  0,  0,  0,  1,  1 ],
            [ -1, -1, -1,  0,  0,  1,  1,  1 ],
            [ -1, -1, -1,  0,  0,  1,  1,  1 ],
            [ -1, -1, -1, -1,  1,  1,  1,  1 ],
            [ -1, -1, -1, -1,  1,  1,  1,  1 ],
            [ -1, -1, -1,  0,  0,  1,  1,  1 ],
            [ -1, -1, -1,  0,  0,  1,  1,  1 ],
            [ -1, -1,  0,  0,  0,  0,  1,  1 ]
        ],
        // vyMap[row][col]
        vyMap: [
            [ -1, -1, -1, -1, -1, -1, -1, -1 ],
            [ -1, -1, -1, -1, -1, -1, -1, -1 ],
            [  0, -1, -1, -1, -1, -1, -1,  0 ],
            [  0,  0,  0, -1, -1,  0,  0,  0 ],
            [  0,  0,  0,  1,  1,  0,  0,  0 ],
            [  0,  1,  1,  1,  1,  1,  1,  0 ],
            [  1,  1,  1,  1,  1,  1,  1,  1 ],
            [  1,  1,  1,  1,  1,  1,  1,  1 ]
        ],
        members: {
            /*
                ball: {
                    col: 1,
                    row: 6,
                    vx: 1,
                    vy: 1,
                    hp: 8 // How many more bounces this note can survive
                }
             */
            // Starburst formation on startup.
            balls: []
        },
        starburstBalls: [
            // Bottom:  / | | \

            {
                col: 2,
                row: 2,
                vx: -1,
                vy: -1,
                hp:  1
            },
            {
                col: 3,
                row: 2,
                vx:  0,
                vy: -1,
                hp: "{that}.options.startingHitPoints"
            },
            {
                col: 4,
                row: 2,
                vx:  0,
                vy: -1,
                hp: "{that}.options.startingHitPoints"
            },
            {
                col: 5,
                row: 2,
                vx:  1,
                vy: -1,
                hp:  1
            },
            // First from bottom:  - / \ -
            {
                col: 2,
                row: 3,
                vx: -1,
                vy:  0,
                hp: "{that}.options.startingHitPoints"
            },
            {
                col: 3,
                row: 3,
                vx: -1,
                vy: -1,
                hp:  1
            },
            {
                col: 4,
                row: 3,
                vx:  1,
                vy:  -1,
                hp:  1
            },
            {
                col: 5,
                row: 3,
                vx:  1,
                vy:  0,
                hp: "{that}.options.startingHitPoints"
            },
            // First from top:  - \ / -
            {
                col: 2,
                row: 4,
                vx: -1,
                vy:  0,
                hp: "{that}.options.startingHitPoints"
            },
            {
                col:  3,
                row:  4,
                vx:  -1,
                vy:   1,
                hp:   1
            },
            {
                col: 4,
                row: 4,
                vx:  1,
                vy:  1,
                hp:  1
            },
            {
                col: 5,
                row: 4,
                vx:  1,
                vy:  0,
                hp: "{that}.options.startingHitPoints"
            },
            // Top: \ | | /
            {
                col: 2,
                row: 5,
                vx: -1,
                vy:  1,
                hp: 1
            },
            {
                col: 3,
                row: 5,
                vx:  0,
                vy:  1,
                hp: "{that}.options.startingHitPoints"
            },
            {
                col: 4,
                row: 5,
                vx:  0,
                vy:  1,
                hp: "{that}.options.startingHitPoints"
            },
            {
                col: 5,
                row: 5,
                vx:  1,
                vy:  1,
                hp:  1
            }
        ],
        components: {
            uiOutput: {
                type: "flock.midi.connectorView",
                container: "{that}.dom.uiOutput",
                options: {
                    portType: "output",
                    preferredPort: "{multiball}.options.preferredUIOutputDevice",
                    components: {
                        connection: {
                            options: {
                                sysex: true, // Required to configure the Launchpad Pro.
                                listeners: {
                                    "onReady.setupDevice": {
                                        funcName: "fluid.each",
                                        args:     ["{multiball}.options.setupMessages", "{multiball}.sendToUi"]
                                    },
                                    "onReady.fireStarburst": {
                                        funcName: "flock.midi.interchange.demos.launchpadPong.multiball.fireStarburst",
                                        args: ["{multiball}"]
                                    },
                                    "onReady.paintDevice": {
                                        funcName: "flock.midi.interchange.demos.launchpadPong.multiball.paintDevice",
                                        args: ["{multiball}"]
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
            updateBall: {
                funcName: "fluid.identity"
            },
            updateBalls: {
                funcName: "flock.midi.interchange.demos.launchpadPong.multiball.updateBalls",
                args: ["{that}"]
            }
        },
        listeners: {
            "onCreate.startPolling": {
                funcName: "flock.midi.interchange.demos.launchpadPong.multiball.startPolling",
                args: ["{that}"]
            },
            "noteOn.handle": {
                funcName: "flock.midi.interchange.demos.launchpadPong.multiball.handleNoteOn",
                args: ["{that}", "{arguments}.0"] // midiMessage
            },
            "noteOff.handle": {
                funcName: "flock.midi.interchange.demos.launchpadPong.multiball.handleNoteOff",
                args: ["{that}", "{arguments}.0"] // midiMessage
            }
        },
        modelListeners: {
            "colourScheme.paintDevice": {
                excludeSource: "init",
                funcName: "flock.midi.interchange.demos.launchpadPong.multiball.paintDevice",
                args: ["{that}"]
            }
        }
    });

    flock.midi.interchange.demos.launchpadPong.multiball.fireStarburst = function (that) {
        that.balls = that.balls.concat(that.options.starburstBalls);
    };

    flock.midi.interchange.demos.launchpadPong.multiball.startPolling = function (that) {
        that.scheduler.schedule({
            type: "repeat",
            freq: 1,
            callback: that.updateBalls
        });

        that.scheduler.setTimeScale(60 / that.currentBpm);
        that.scheduler.start();
    };

    /**
     *
     * "Paint" the launchpad pro using its sysex message support.
     *
     * @param that
     */
    flock.midi.interchange.demos.launchpadPong.multiball.paintDevice = function (that) {
        var valueArray = flock.midi.interchange.demos.launchpadPong.multiball.generateColourArray(that);
        flock.midi.interchange.demos.launchpadPong.sendValueArrayToDevice(that, valueArray);
    };

    /**
     *
     * @param {Object} that - The launchpad pong component itself.
     * @return {Array<Number>} - An array of numbers from 0 to 1 that represent one colour channel for a single cell.
     *  To paint an 8 x 8 grid, you need 64 x 3, or 192 values.
     *
     */
    flock.midi.interchange.demos.launchpadPong.multiball.generateColourArray = function (that) {
        var allNotes = [];

        // First, generate a map of all the balls.
        var ballPositions = {};
        fluid.each(that.balls, function (singleBall) {
            fluid.set(ballPositions, [singleBall.row, singleBall.col], singleBall);
        });
        for (var row = 0; row < 8; row++)  {
            for (var col = 0; col < 8; col++) {
                var noteForPosition = flock.midi.interchange.demos.launchpadPong.noteFromPosition(row, col);

                var isHeld = fluid.get(that.activeNotes, noteForPosition);
                var ballAtPosition = fluid.get(ballPositions, [row, col]);

                // Display as a "held" note if this note is being pressed.
                if (isHeld) {
                    var cellOpacity = isHeld ? 0.125 : 0;
                    var singleCellColours = flock.midi.interchange.demos.launchpadPong.generateSingleCellColours(that, cellOpacity);
                    allNotes.push(singleCellColours);
                }
                // Display "ball" if on is at this position.
                else if ( ballAtPosition !== undefined) {
                    // Play updated note if it hasn't already been played as an "impact".
                    var ballNote = flock.midi.interchange.demos.launchpadPong.noteFromPosition(row, col);
                    var hitPointOpacity = ballAtPosition.hp / 4;
                    var ballOpacity = hitPointOpacity * (that.impactNotes[ballNote] ? 1 : 0.25);
                    var ballColours = flock.midi.interchange.demos.launchpadPong.generateSingleCellColours(that, ballOpacity);
                    allNotes.push(ballColours);
                }
                else {
                    var emptyCellColours = flock.midi.interchange.demos.launchpadPong.generateSingleCellColours(that, 0);
                    allNotes.push(emptyCellColours);
                }
            }
        }

        return fluid.flatten(allNotes);
    };

    flock.midi.interchange.demos.launchpadPong.multiball.handleNoteOn = function (that, originalMessage) {
        var transformedMessage = fluid.model.transformWithRules(originalMessage, flock.midi.interchange.tunings.launchpadPro.common);

        // TODO: Add logic to handle hitting an existing ball with a new played note.

        // Add the note to the list of "held" notes (actual MIDI input value).
        // We use the original note because we are going to have to paint it on the raw device.
        that.activeNotes[originalMessage.note] = true;

        flock.midi.interchange.demos.launchpadPong.multiball.paintDevice(that);

        that.sendToNoteOut(transformedMessage);
    };

    flock.midi.interchange.demos.launchpadPong.multiball.handleNoteOff = function (that, originalMessage) {
        var transformedMessage = fluid.model.transformWithRules(originalMessage, flock.midi.interchange.tunings.launchpadPro.common);

        // Remove the note from the list of "held" notes (actual MIDI input value) if it's there.
        // We use the original note because we are going to have to paint it on the raw device.
        that.activeNotes[originalMessage.note] = false;

        // Add the note to the list of balls
        var newBall = flock.midi.interchange.demos.launchpadPong.multiball.newBallFromReleasedNoteMessage(that, originalMessage);
        that.balls.push(newBall);

        flock.midi.interchange.demos.launchpadPong.multiball.paintDevice(that);

        // Pass the note along to the output device (we could make this conditional, but it's harmless).
        that.sendToNoteOut(transformedMessage);
    };

    flock.midi.interchange.demos.launchpadPong.multiball.newBallFromReleasedNoteMessage = function (that, message) {
        var ballDef = flock.midi.interchange.demos.launchpadPong.positionFromNote(message.note);
        ballDef.hp = that.options.startingHitPoints;

        ballDef.vx = that.options.vxMap[ballDef.row][ballDef.col];
        ballDef.vy = that.options.vyMap[ballDef.row][ballDef.col];

        return ballDef;

    };

    flock.midi.interchange.demos.launchpadPong.multiball.updateBalls = function (that) {
        // If our speed has changed, update the scheduler and trigger the next step early to avoid a "stutter".
        if (that.currentBpm !== that.bpm) {
            that.currentBpm = that.bpm;
            that.scheduler.setTimeScale(60 / that.currentBpm);
            return;
        }

        var newImpactNotes = {};

        var emptyCol = fluid.generate(8, []);
        var ballsAtNextPosition = fluid.generate(8, function () { return fluid.copy(emptyCol); }, true);

        fluid.each(that.balls, function (ball) {
            // Stop playing note for current position.
            var oldNote = flock.midi.interchange.demos.launchpadPong.noteFromPosition(ball.row, ball.col);
            var oldLaunchpadRelativeMessage = {
                channel: 0,
                type: "noteOff",
                note: oldNote,
                velocity: 0
            };
            var oldCommonRelativeMessage = fluid.model.transformWithRules(oldLaunchpadRelativeMessage, flock.midi.interchange.tunings.launchpadPro.common);
            that.sendToNoteOut(oldCommonRelativeMessage);

            var newRow = ball.row + ball.vy;
            var newCol = ball.col + ball.vx;

            var rowOutOfBounds = newRow < 0 || newRow > 7;
            var colOutOfBonds = newCol < 0 || newCol > 7;

            if (rowOutOfBounds || colOutOfBonds) {
                ball.hp--;
                if (rowOutOfBounds) {
                    ball.vy *= -1;
                }

                if (colOutOfBonds) {
                    ball.vx *= -1;
                }
                var impactRow = rowOutOfBounds ? ball.row : newRow;
                var impactCol = colOutOfBonds ? ball.col : newCol;

                var impactNote = flock.midi.interchange.demos.launchpadPong.noteFromPosition(impactRow, impactCol);
                newImpactNotes[impactNote] = true;
                that.impactNotes[impactNote] = that.impactNotes[impactNote] ? that.impactNotes[impactNote]++ : 1;
            }
            // Build map of collisions.
            else {
                ballsAtNextPosition[newRow][newCol].push(ball);
            }
        });

        // Process collision map, add to impact list, adjust angles and hp.
        fluid.each(ballsAtNextPosition, function (ballsInRow, row) {
            fluid.each(ballsInRow, function (ballsInCell, col) {
                // Process collisions with held notes first.
                var noteForPosition = flock.midi.interchange.demos.launchpadPong.noteFromPosition(row, col);
                var isHeld = fluid.get(that.activeNotes, noteForPosition);

                if (isHeld) {
                    fluid.each(ballsInCell, function (ballHittingHeldNote) {
                        // TODO: Consider reimplementing "glancing" deflections.
                        ballHittingHeldNote.vx *= -1;
                        ballHittingHeldNote.vy *= -1;
                        ballHittingHeldNote.hp--;
                    });
                }
                else if (ballsInCell.length > 1) {
                    var firstCollidingBall = ballsInCell[0];
                    firstCollidingBall.hp--;

                    var remainingBalls = ballsInCell.slice(1);
                    fluid.each(remainingBalls, function (nextCollidingBall) {
                        var vxDiff = firstCollidingBall.vx - nextCollidingBall.vx;
                        firstCollidingBall.vx -= vxDiff;
                        nextCollidingBall.vx  += vxDiff;

                        var vyDiff = firstCollidingBall.vy - nextCollidingBall.vy;
                        firstCollidingBall.vy -= vyDiff;
                        nextCollidingBall.vy  += vyDiff;

                        nextCollidingBall.hp--;
                        firstCollidingBall = nextCollidingBall;
                    });

                    var impactNote = flock.midi.interchange.demos.launchpadPong.noteFromPosition(row, col);
                    newImpactNotes[impactNote] = true;
                    that.impactNotes[impactNote] = that.impactNotes[impactNote] ? that.impactNotes[impactNote]++ : 1;
                }
            });
        });

        // Remove any balls whose hp is now zero.
        that.balls = that.balls.filter(function (singleBall) {
            return singleBall.hp > 0;
        });

        // Start playing any new impact notes.
        fluid.each(newImpactNotes, function (playNote, noteNumber) {
            var impactLaunchpadRelativeMessage = {
                channel: 0,
                type: "noteOn",
                note: noteNumber,
                velocity: 127
            };
            var impactCommonRelativeMessage = fluid.model.transformWithRules(impactLaunchpadRelativeMessage, flock.midi.interchange.tunings.launchpadPro.common);
            that.sendToNoteOut(impactCommonRelativeMessage);
        });

        // Update the rest of the notes now.
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

        fluid.each(that.balls, function (singleBall) {
            singleBall.col += singleBall.vx;
            singleBall.row += singleBall.vy;

            // Start playing note for current position.
            var newNote = flock.midi.interchange.demos.launchpadPong.noteFromPosition(singleBall.row, singleBall.col);
            var velocity = Math.round((128 / that.options.startingHitPoints) * singleBall.hp) - 1;

            var newLaunchpadRelativeMessage = {
                channel: 0,
                type: "noteOn",
                note: newNote,
                velocity: velocity
            };
            var newCommonRelativeMessage = fluid.model.transformWithRules(newLaunchpadRelativeMessage, flock.midi.interchange.tunings.launchpadPro.common);
            that.sendToNoteOut(newCommonRelativeMessage);
        });

        // Repaint the device.
        flock.midi.interchange.demos.launchpadPong.multiball.paintDevice(that);
    }
})(flock, fluid);
