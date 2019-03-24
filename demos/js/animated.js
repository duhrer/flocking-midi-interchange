/* globals flock, fluid */
(function (flock, fluid) {
    "use strict";

    fluid.registerNamespace("flock.midi.interchange.demos.animated");
    // TODO: Do this repeatedly using setInterval

    flock.midi.interchange.demos.animated.startAnimation = function (that) {
        that.interval = setInterval(that.clone, 100);
    };

    flock.midi.interchange.demos.animated.stopAnimation = function (that) {
        if (that.interval) {
            clearInterval(that.interval);
        }
    };

    // TODO: Convert to using Bergson
    flock.midi.interchange.demos.animated.clone = function (that) {
        var odaNode = that.locate("originalOda");
        var clonedNode = odaNode.clone();
        // There can be only one.
        clonedNode.removeAttr("id");
        clonedNode.addClass("downwardlyMobile");
        //clonedNode.addClass("fading"); // TODO: Fix
        odaNode.before(clonedNode);
        // "cull" older frames after 5s.
        setTimeout(clonedNode.remove, 5000);
    };

    fluid.defaults("flock.midi.interchange.demos.animated.oda", {
        gradeNames: ["flock.midi.interchange.oda"],
        svgData: flock.midi.interchange.svg.singleRow
    });

    fluid.defaults("flock.midi.interchange.demos.animated.loom", {
        gradeNames: ["flock.midi.interchange.oda.loom"],
        members: {
            interval: false
        },
        invokers: {
            clone: {
                funcName: "flock.midi.interchange.demos.animated.clone",
                args:     ["{that}"]
            },
            startAnimation: {
                funcName: "flock.midi.interchange.demos.animated.startAnimation",
                args:     ["{that}"]
            },
            stopAnimation: {
                funcName: "flock.midi.interchange.demos.animated.stopAnimation",
                args:     ["{that}"]
            }
        },
        selectors: {
            originalOda: "#oda-prime"
        },
        components: {
            oda: {
                type: "flock.midi.interchange.demos.animated.oda"
            }
        }
    });
})(flock, fluid);
