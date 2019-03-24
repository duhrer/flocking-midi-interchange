(function (flock, fluid){
    "use strict";
    fluid.defaults("flock.midi.interchange.demos.modelRelay", {
        gradeNames: ["fluid.viewComponent"],
        model: {
            channels: {}
        },
        selectors: {
            noteInput:  ".note-input",
            noteOutput: ".note-output"
        },
        components: {
            noteInput: {
                type: "flock.midi.interchange.connector.input",
                container: "{modelRelay}.dom.noteInput",
                options: {
                    model: {
                        channels: "{modelRelay}.model.channels"
                    }
                }
            },
            noteOutput: {
                type: "flock.midi.interchange.connector.output",
                container: "{modelRelay}.dom.noteOutput",
                options: {
                    model: {
                        channels: "{modelRelay}.model.channels"
                    }
                }
            }
        }
    });
})(flock, fluid);
