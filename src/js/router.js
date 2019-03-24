/* globals fluid, flock */
(function (fluid, flock) {
    "use strict";
    fluid.registerNamespace("flock.midi.interchange");

    flock.midi.interchange.transformAndRelayMessage = function (that, eventName, message) {
        var rules = fluid.get(that, ["options", "rules", eventName]);
        if (!rules) {
            fluid.log("No rules for for event '" + eventName + "', passing through original message.");
        }

        var transformedMessage = rules ? fluid.model.transformWithRules(message, rules) : message;
        that.events.onTransformedMessage.fire(transformedMessage);
    };

    fluid.defaults("flock.midi.interchange.transformingRouter", {
        gradeNames: ["flock.midi.receiver"],
        events: {
            onTransformedMessage: null
        },
        rules: {
            passthrough: { "": "" },
            note: "{that}.options.rules.passthrough",
            control: "{that}.options.rules.passthrough",
            program: "{that}.options.rules.passthrough",
            aftertouch: "{that}.options.rules.passthrough",
            pitchbend: "{that}.options.rules.passthrough",
            sysex: "{that}.options.rules.passthrough",
            songPointer: "{that}.options.rules.passthrough",
            songSelect: "{that}.options.rules.passthrough",
            tuneRequest: "{that}.options.rules.passthrough",
            clock: "{that}.options.rules.passthrough",
            start: "{that}.options.rules.passthrough",
            continue: "{that}.options.rules.passthrough",
            stop: "{that}.options.rules.passthrough",
            activeSense: "{that}.options.rules.passthrough",
            reset: "{that}.options.rules.passthrough"
        },
        invokers: {
            transformAndRelayMessage: {
                funcName: "flock.midi.interchange.transformAndRelayMessage",
                args: ["{that}", "{arguments}.0", "{arguments}.1"] // eventName, message
            }
        },
        listeners: {
            note: {
                func: "{that}.transformAndRelayMessage",
                args: ["note", "{arguments}.0"]
            },
            control: {
                func: "{that}.transformAndRelayMessage",
                args: ["control", "{arguments}.0"]
            },
            program: {
                func: "{that}.transformAndRelayMessage",
                args: ["program", "{arguments}.0"]
            },
            aftertouch: {
                func: "{that}.transformAndRelayMessage",
                args: ["aftertouch", "{arguments}.0"]
            },
            pitchbend: {
                func: "{that}.transformAndRelayMessage",
                args: ["pitchbend", "{arguments}.0"]
            },
            sysex: {
                func: "{that}.transformAndRelayMessage",
                args: ["sysex", "{arguments}.0"]
            },
            songPointer: {
                func: "{that}.transformAndRelayMessage",
                args: ["songPointer", "{arguments}.0"]
            },
            songSelect: {
                func: "{that}.transformAndRelayMessage",
                args: ["songSelect", "{arguments}.0"]
            },
            tuneRequest: {
                func: "{that}.transformAndRelayMessage",
                args: ["tuneRequest", "{arguments}.0"]
            },
            clock: {
                func: "{that}.transformAndRelayMessage",
                args: ["clock", "{arguments}.0"]
            },
            start: {
                func: "{that}.transformAndRelayMessage",
                args: ["start", "{arguments}.0"]
            },
            continue: {
                func: "{that}.transformAndRelayMessage",
                args: ["continue", "{arguments}.0"]
            },
            stop: {
                func: "{that}.transformAndRelayMessage",
                args: ["stop", "{arguments}.0"]
            },
            activeSense: {
                func: "{that}.transformAndRelayMessage",
                args: ["activeSense", "{arguments}.0"]
            },
            reset: {
                func: "{that}.transformAndRelayMessage",
                args: ["reset", "{arguments}.0"]
            }
        },
        mergePolicy: {
            "rules.note": "nomerge",
            "rules.control": "nomerge",
            "rules.program": "nomerge",
            "rules.aftertouch": "nomerge",
            "rules.pitchbend": "nomerge",
            "rules.sysex": "nomerge",
            "rules.songPointer": "nomerge",
            "rules.songSelect": "nomerge",
            "rules.tuneRequest": "nomerge",
            "rules.clock": "nomerge",
            "rules.start": "nomerge",
            "rules.continue": "nomerge",
            "rules.stop": "nomerge",
            "rules.activeSense": "nomerge",
            "rules.reset": "nomerge"
        }
    });

    fluid.registerNamespace("flock.midi.interchange.transformingRouterHarness");

    flock.midi.interchange.transformingRouterHarness.sendTransformedMessage = function (outputComponent, transformedMessage) {
        var outputConnection = fluid.get(outputComponent, "connection");
        if (outputConnection) {
            outputConnection.send(transformedMessage);
        }
    };

    fluid.defaults("flock.midi.interchange.transformingRouterHarness", {
        gradeNames: ["fluid.viewComponent"],
        selectors: {
            noteInput:  ".note-input",
            noteOutput: ".note-output"
        },
        sysex: true,
        distributeOptions: [
            {
                source: "{that}.options.sysex",
                target: "{that flock.auto.midi.system}.options.sysex"
            },
            {
                source: "{that}.options.sysex",
                target: "{that flock.midi.connection}.options.sysex"
            }
        ],
        components: {
            enviro: {
                type: "flock.enviro"
            },
            router: {
                type: "flock.midi.interchange.transformingRouter",
                options: {
                    events: {
                        note:       "{noteInput}.events.note",
                        control:    "{noteInput}.events.control",
                        program:    "{noteInput}.events.program",
                        aftertouch: "{noteInput}.events.aftertouch",
                        pitchbend:  "{noteInput}.events.pitchbend"
                    },
                    listeners: {
                        "onTransformedMessage.sendMessage": {
                            funcName: "flock.midi.interchange.transformingRouterHarness.sendTransformedMessage",
                            args:     ["{noteOutput}", "{arguments}.0"] // outputComponent, transformedMessage
                        }
                    }
                }
            },
            noteInput: {
                type: "flock.auto.ui.midiConnector",
                container: "{that}.dom.noteInput",
                options: {
                    preferredDevice: "{transformingRouterHarness}.options.preferredInputDevice",
                    portType: "input"
                }
            },
            noteOutput: {
                type: "flock.auto.ui.midiConnector",
                container: "{that}.dom.noteOutput",
                options: {
                    preferredDevice: "{transformingRouterHarness}.options.preferredOutputDevice",
                    portType: "output"
                }
            }
        }
    });
})(fluid, flock);
