/*

    "Onscreen Device Analogue", an in-browser representation of a note-receiving device such as a Novation Launchpad or
    Ableton Push.

 */
(function (fluid, $) {
    "use strict";
    var flock = fluid.registerNamespace("flock");

    fluid.registerNamespace("flock.midi.interchange.oda");

    // Parse an ID like #device-note-001 and return an object with properties.
    flock.midi.interchange.oda.parseId = function (element) {
        var idString  = element.getAttribute("id");
        var idSegments = idString.split("-");
        return {
            type: idSegments[1],
            number: parseInt(idSegments[2], 10)
        };
    };

    flock.midi.interchange.oda.handleMouseInput = function (that, eventType, event) {
        event.preventDefault();
        var targetDetails = flock.midi.interchange.oda.parseId(event.target);
        flock.midi.interchange.oda.sendInput(that, eventType, targetDetails);
    };

    flock.midi.interchange.oda.handleKeyInput = function (that, eventType, event) {
        if (that.options.actionKeys.indexOf(event.which) !== -1) {
            event.preventDefault();
            var targetDetails = flock.midi.interchange.oda.parseId(event.target);
            flock.midi.interchange.oda.sendInput(that, eventType, targetDetails);
        }
    };

    flock.midi.interchange.oda.sendInput = function (that, eventType, targetDetails) {
        // TODO: Make this a transform, or possibly transforms based on event type.
        var message = {
            channel: 0
        };
        if (targetDetails.type === "cc") {
            message.type   = "control";
            message.number = targetDetails.number;
            message.value  = eventType === "down" ? 127 : 0;
        }
        else {
            message.type     = eventType === "down" ? "noteOn" : "noteOff";
            message.note     = targetDetails.number;
            message.velocity = eventType === "down" ? 127 : 0;
        }
        that.events.outputMessage.fire(message);
    };

    flock.midi.interchange.oda.renderSvg = function (that) {
        that.container.html(that.options.svgData);
        that.events.onSvgRendered.fire();
    };

    flock.midi.interchange.oda.paintFromMessage = function (that, message) {
        var transform = that.options.transforms[message.type];
        // Ignore any kind of message we don't know how to handle.
        if (transform) {
            var paintPayload = fluid.model.transformWithRules(message, transform);
            that.paintFromObject(paintPayload);
        }
    };

    flock.midi.interchange.oda.paintFromObject = function (that, paintObject) {
        // Construct a raw selector and find the associated element
        var selector = "#device-" + paintObject.type + "-" + flock.midi.interchange.oda.zeroPadNumber(paintObject.id);
        var elementToPaint = $(that.container).find(selector);

        if (elementToPaint) {
            var htmlColour = paintObject.htmlColour || that.options.htmlColourByVelocity[paintObject.colourIndex];
            elementToPaint.css("fill", htmlColour);
        }
    };

    // TODO: Make this reusable from a single common include.
    flock.midi.interchange.oda.zeroPadNumber = function (number) {
        return (number + 1000).toString().slice(1);
    };

    fluid.defaults("flock.midi.interchange.oda", {
        gradeNames: ["flock.midi.receiver", "fluid.viewComponent"],
        actionKeys: [32, 13], // space, enter
        svgData: flock.midi.interchange.svg.oda,
        events: {
            onSvgRendered: null,
            outputMessage: null
        },
        // TODO: Transition all traditional "map" approaches to use transforms instead.
        htmlColourByVelocity: flock.midi.interchange.colours.htmlColourByVelocity.redshift,
        // TODO: Update the code that relies on this to use an inverse transform.
        velocityByHtmlColour: "@expand:flock.midi.interchange.colours.invertMap({that}.options.htmlColourByVelocity)",
        transforms: {
            noteOn: {
                "type":        { literalValue: "note" },
                "id":          "note",
                "colourIndex": "velocity"
            },
            noteOff: {
                "type":        { literalValue: "note" },
                "id":          "note",
                "colourIndex": { literalValue: 0 }
            },
            control: {
                "type":        { literalValue: "cc" },
                "id":          "number",
                "colourIndex": "value"
            }
        },
        selectors: {
            control: ".device-control",
            frame:   "#device-frame",
            note:    ".device-note"
        },
        invokers: {
            "handleMouseDown": {
                funcName: "flock.midi.interchange.oda.handleMouseInput",
                args:     ["{that}", "down", "{arguments}.0"]
            },
            "handleMouseUp": {
                funcName: "flock.midi.interchange.oda.handleMouseInput",
                args:     ["{that}", "up", "{arguments}.0"]
            },
            "handleKeyDown": {
                funcName: "flock.midi.interchange.oda.handleKeyInput",
                args:     ["{that}", "down", "{arguments}.0"] // eventType, event
            },
            "handleKeyUp": {
                funcName: "flock.midi.interchange.oda.handleKeyInput",
                args:     ["{that}", "up", "{arguments}.0"] // eventType, event
            },
            "paintFromObject": {
                funcName: "flock.midi.interchange.oda.paintFromObject",
                args:     ["{that}", "{arguments}.0"] // paintObject
            }
        },
        listeners: {
            "onCreate.renderSvg": {
                funcName: "flock.midi.interchange.oda.renderSvg",
                args:     ["{that}"]
            },
            "onSvgRendered.bindControlMouseDown": {
                "this":   "{that}.dom.control",
                "method": "mousedown",
                "args":   ["{that}.handleMouseDown"]
            },
            "onSvgRendered.bindControlMouseUp": {
                "this":   "{that}.dom.control",
                "method": "mouseup",
                "args":   ["{that}.handleMouseUp"]
            },
            "onSvgRendered.bindControlKeyDown": {
                "this":   "{that}.dom.control",
                "method": "keydown",
                "args":   ["{that}.handleKeyDown"]
            },
            "onSvgRendered.bindControlKeyUp": {
                "this":   "{that}.dom.control",
                "method": "keyup",
                "args":   ["{that}.handleKeyUp"]
            },
            "onSvgRendered.bindNoteMouseDown": {
                "this":   "{that}.dom.note",
                "method": "mousedown",
                "args":   ["{that}.handleMouseDown"]
            },
            "onSvgRendered.bindNoteMouseUp": {
                "this":   "{that}.dom.note",
                "method": "mouseup",
                "args":   ["{that}.handleMouseUp"]
            },
            "onSvgRendered.bindNoteKeyDown": {
                "this":   "{that}.dom.note",
                "method": "keydown",
                "args":   ["{that}.handleKeyDown"]
            },
            "onSvgRendered.bindNoteKeyUp": {
                "this":   "{that}.dom.note",
                "method": "keyup",
                "args":   ["{that}.handleKeyUp"]
            },
            note: {
                funcName: "flock.midi.interchange.oda.paintFromMessage",
                args:     ["{that}", "{arguments}.0"] // message
            },
            control: {
                funcName: "flock.midi.interchange.oda.paintFromMessage",
                args:     ["{that}", "{arguments}.0"] // message
            },
            "outputMessage.paintFromMessage": {
                funcName: "flock.midi.interchange.oda.paintFromMessage",
                args:     ["{that}", "{arguments}.0"] // message
            }
        }
    });
})(fluid, $);
