/* A harness to tune a Launchpad Pro like a guitar, including capo controls */
// TODO: Figure out a way to support multiple instances with a single loom, perhaps with dynamic components.
(function (fluid, flock) {
    "use strict";

    fluid.registerNamespace("flock.midi.interchange.demos.lpg");

    flock.midi.interchange.demos.lpg.sendPitchAdjustedMessage = function (that, noteOutput, originalMessage) {
        // Adjust all outgoing note messages by our "capo" pitch offset.
        if (originalMessage.note) {
            var modifiedMessage = fluid.copy(originalMessage);
            modifiedMessage.note = modifiedMessage.note + that.pitchOffset;
            flock.midi.interchange.transformingRouterHarness.sendTransformedMessage(noteOutput, modifiedMessage);
        }
        // Nothing to change, this is a control message or something else we should pass through unaltered.
        else {
            flock.midi.interchange.transformingRouterHarness.sendTransformedMessage(noteOutput, originalMessage);
        }
    };

    flock.midi.interchange.demos.lpg.adjustPitch = function (that, controlMessage) {
        // If the value is zero, the control is being released.  We act on "button down" instead.
        if (controlMessage.value) {
            var newPitchOffset = that.pitchOffset;
            // UP = 91
            if (controlMessage.number === 91) {
                newPitchOffset += 12;
            }
            // DOWN = 92
            else if (controlMessage.number === 92) {
                newPitchOffset -= 12;
            }
            // LEFT = 93
            else if (controlMessage.number === 93) {
                newPitchOffset--;
            }
            // RIGHT = 94
            else if (controlMessage.number === 94) {
                newPitchOffset++;
            }

            // The base tuning has a range from 52-95.  MIDI only supports 0-127, so we have to make sure
            // that we don't end up with "out of bounds" notes.  Our pitch offset can only go from -52 to +32

            // Limit the lower end of the range
            newPitchOffset = Math.max(-52, newPitchOffset);

            // Limit the upper end of the range
            newPitchOffset = Math.min(32, newPitchOffset);

            that.pitchOffset = newPitchOffset;
        }
    };

    fluid.defaults("flock.midi.interchange.demos.lpg.loom", {
        gradeNames: ["flock.midi.interchange.oda.launchpadPro.loom"],
        components: {
            router: {
                type: "flock.midi.interchange.transformingRouter",
                options: {
                    // TODO: Wire up capo controls to change this
                    members: {
                        pitchOffset: 0
                    },
                    listeners: {
                        "onTransformedMessage.sendMessage": {
                            funcName: "flock.midi.interchange.demos.lpg.sendPitchAdjustedMessage",
                            args:     ["{that}", "{noteOutput}", "{arguments}.0"] // outputComponent, transformedMessage
                        },
                        "control.adjustPitch": {
                            funcName: "flock.midi.interchange.demos.lpg.adjustPitch",
                            args:     ["{that}", "{arguments}.0"] // controlMessage
                        }
                    }
                }
            }
        }
    });
})(fluid, flock);
