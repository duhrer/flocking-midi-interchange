/*

    A "loom" to weave together a MIDI input and an Onscreen Device Analogue (by default, the reference ODA).

*/
(function (fluid, flock) {
    "use strict";

    fluid.registerNamespace("flock.midi.interchange.oda");

    flock.midi.interchange.oda.relayMessage = function (output, message) {
        var connection = fluid.get(output, "connection");
        if (connection) {
            connection.send(message);
        }
    };

    fluid.defaults("flock.midi.interchange.oda.loom", {
        gradeNames: ["fluid.viewComponent"],
        selectors: {
            input: ".midi-input-container",
            output: ".midi-output-container",
            oda: ".oda-container"
        },
        components: {
            enviro: {
                type: "flock.enviro"
            },
            input: {
                type: "flock.auto.ui.midiConnector",
                container: "{that}.dom.input",
                options: {
                    portType: "input",
                    listeners: {
                        "control.display": {
                            func: "{oda}.events.control.fire",
                            args: ["{arguments}.0"]
                        },
                        "note.display": {
                            func: "{oda}.events.note.fire",
                            args: ["{arguments}.0"]
                        },
                        "message.relayToOutput": {
                            funcName: "flock.midi.interchange.oda.relayMessage",
                            args: ["{output}", "{arguments}.0"] // message
                        }
                    }
                }
            },
            output: {
                type: "flock.auto.ui.midiConnector",
                container: "{that}.dom.output",
                options: {
                    portType: "output"
                }
            },
            oda: {
                type: "flock.midi.interchange.oda",
                container: "{that}.dom.oda",
                options: {
                    listeners: {
                        "outputMessage.sendToOutput": {
                            funcName: "flock.midi.interchange.oda.relayMessage",
                            args: ["{output}", "{arguments}.0"]
                        },
                        "outputMessage.loopback": {
                            funcName: "flock.midi.interchange.oda.relayMessage",
                            args: ["{output}", "{arguments}.0"]
                        }
                    }
                }
            }
        }
    })
})(fluid, flock);
