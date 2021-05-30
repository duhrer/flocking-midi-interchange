(function (flock, fluid) {
    "use strict";

    fluid.defaults("flock.midi.interchange.demos.polarVortex.dial", {
        gradeNames: ["fluid.viewComponent"],
        label: "Dial",
        max: 10,
        min: -10,
        increment: 1,
        markupTemplate:
            "<div class=\"dial\" tabindex=\"0\">\n" +
            "    <h4>%label</h4>\n" +
            "    <div class=\"dial__value\">%value</div>\n" +
            "</div>",
        events: {
            onInitialRender: null
        },
        model: {
            value: 0
        },
        selectors: {
            dial: ".dial",
            value: ".dial__value"
        },
        invokers: {
            decrease: {
                funcName: "flock.midi.interchange.demos.polarVortex.dial.increment",
                args: ["{that}", true] // that, invert
            },
            increase: {
                funcName: "flock.midi.interchange.demos.polarVortex.dial.increment",
                args: ["{that}"] // that, invert
            },
            handleKeydown: {
                funcName: "flock.midi.interchange.demos.polarVortex.dial.handleKeydown",
                args: ["{that}", "{arguments}.0"] // event
            }
        },
        listeners: {
            // render our initial markup.
            "onCreate.render": {
                funcName: "flock.midi.interchange.demos.polarVortex.dial.renderMarkup"
            },
            "onInitialRender.bindKeyDown": {
                "this": "{that}.dom.dial",
                "method": "keydown",
                "args": ["{that}.handleKeydown"]
            }
        },
        modelListeners: {
            "value": {
                funcName: "flock.midi.interchange.demos.polarVortex.dial.displayValue",
                args: ["{that}"]
            }
        }
    });

    flock.midi.interchange.demos.polarVortex.dial.renderMarkup = function (that) {
        var markup = fluid.stringTemplate(that.options.markupTemplate, { label: that.options.label, value: that.model.value });
        that.container.html(markup);
        that.events.onInitialRender.fire();
    };

    flock.midi.interchange.demos.polarVortex.dial.displayValue = function (that) {
        var valueElement = that.locate("value");
        valueElement.text(that.model.value);
    };

    flock.midi.interchange.demos.polarVortex.dial.handleKeydown = function (that, event) {
        if (event.key === "ArrowUp" || event.key === "ArrowRight") {
            event.preventDefault();
            that.increase();
        }
        else if (event.key === "ArrowDown" || event.key === "ArrowLeft") {
            event.preventDefault();
            that.decrease();
        }
    };

    flock.midi.interchange.demos.polarVortex.dial.increment = function (that, invert) {
        var increment = that.options.increment;
        if (invert) { increment *= -1; }
        var newValue = flock.midi.interchange.demos.polarVortex.safeAdd(that.model.value, increment);
        if (newValue >= that.options.min && newValue <= that.options.max) {
            that.applier.change("value", newValue);
        }
    };
})(flock, fluid);
