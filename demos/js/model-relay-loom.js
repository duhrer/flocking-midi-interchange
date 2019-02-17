(function (flock, fluid){
    "use strict";
    fluid.defaults("flock.midi.interchange.demos.modelRelay", {
        gradeNames: ["fluid.viewComponent"],
        model: {
            channels: {}
        },
        selectors: {
            input: ".midi-input",
            output: ".midi-output"
        },
        components: {
            input: {
                type: "flock.midi.interchange.connector.input",
                container: "{modelRelay}.dom.input",
                options: {
                    model: {
                        channels: "{modelRelay}.model.channels"
                    }
                }
            },
            output: {
                type: "flock.midi.interchange.connector.output",
                container: "{modelRelay}.dom.output",
                options: {
                    model: {
                        channels: "{modelRelay}.model.channels"
                    }
                }
            }
        }
    });
})(flock, fluid);
