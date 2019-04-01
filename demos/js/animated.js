/* globals flock, fluid */
(function (flock, fluid) {
    "use strict";

    fluid.registerNamespace("flock.midi.interchange.demos.animated");

    // Respond to each noteOn and:
    //
    //   1. Clone the associated pitch from the template.
    //   2. Fill that with the colour associated with the pitch.
    //   3. Add the "growing" class to the clone.
    flock.midi.interchange.demos.animated.handleNoteOn = function (that, noteMessage) {
        if (noteMessage.velocity === 0) {
            flock.midi.interchange.demos.animated.handleNoteOff(that, noteMessage);
        }
        else {
            var selector = "#device-note-" + flock.midi.interchange.oda.zeroPadNumber(noteMessage.note);
            var elementToClone = $(that.container).find(selector);
            if (elementToClone) {
                var clonedNode = elementToClone.clone();
                clonedNode.removeAttr("id");
                var htmlColour = fluid.model.transformWithRules(noteMessage.velocity, that.options.rules.colourByVelocity);
                clonedNode.css("fill", htmlColour);

                clonedNode.addClass(selector.substring(1));
                clonedNode.addClass("growing");
                elementToClone.before(clonedNode);
            }
        }
    };

    // Respond to each noteOff and:
    //
    //   1. Find the "growing" note for this pitch.
    //   2. Remove the "growing" class.
    //   3. Add the "moving" class.
    //   4. Add an individual timeout to cull the note once it's moved far enough.
    flock.midi.interchange.demos.animated.handleNoteOff = function (that, noteMessage) {
        var selector = ".growing.device-note-" + flock.midi.interchange.oda.zeroPadNumber(noteMessage.note);
        var cloneToChange = $(that.container).find(selector);
        if (cloneToChange) {
            // "pin" the height before stopping the "growing" animation.
            var currentHeight = cloneToChange.height();
            cloneToChange.css("height", currentHeight);
            cloneToChange.removeClass("growing");
            cloneToChange.addClass("moving");
            setTimeout(function () {
                cloneToChange.remove();
            }, that.options.removeTimeout);
        }
    };

    flock.midi.interchange.demos.animated.renderSvg = function (that) {
        var svgContainer = that.locate("svgContainer");
        if (svgContainer) {
            svgContainer.html(that.options.svgData);
        }
    };

    fluid.defaults("flock.midi.interchange.demos.animated.loom", {
        gradeNames: ["fluid.viewComponent"],
        svgData: flock.midi.interchange.svg.singleRowPixelHigh,
        rules: {
            colourByVelocity: flock.midi.interchange.colourTransforms.sixteenBlues
        },
        removeTimeout: 5000,
        events: {
            noteOn:  "{noteInput}.events.noteOn",
            noteOff: "{noteInput}.events.noteOff"
        },
        selectors: {
            noteInput:    ".note-input",
            svgContainer: ".svg-container",
            growing:      ".growing",
            moving:       ".moving"
        },
        listeners: {
            noteOn: {
                funcName: "flock.midi.interchange.demos.animated.handleNoteOn",
                args:     ["{that}", "{arguments}.0"] // noteMessage
            },
            noteOff: {
                funcName: "flock.midi.interchange.demos.animated.handleNoteOff",
                args:     ["{that}", "{arguments}.0"] // noteMessage
            },
            "onCreate.renderSvg": {
                funcName: "flock.midi.interchange.demos.animated.renderSvg",
                args: ["{that}"]
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
                    preferredDevice: "{loom}.options.preferredInputDevice",
                    portType: "input"
                }
            }
        }
    });
})(flock, fluid);
