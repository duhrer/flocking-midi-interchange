/*

    A "loom" to weave together a Launchpad Pro and its ODA.

*/
(function (fluid, flock) {
    "use strict";

    // TODO: Bring in tuning from previous router or integrate with base ODA loom.
    fluid.defaults("flock.midi.interchange.oda.launchpadPro.loom", {
        gradeNames: ["flock.midi.interchange.oda.loom"],
        preferredDevice: "Launchpad Pro Standalone Port",
        uiPaintMessages: {
            // TODO: Test and add "set to programmer mode" message to all Launchpad Pro UIs.
            startup: flock.midi.interchange.oda.launchpadPro.uis.guitarColours
        },
        invokers: {
            noteToOda: {
                // TODO: Write "inverse" relay to "black out" notes on play and redraw colour on release.
                funcName: "fluid.identity",
                args: ["{arguments}.0"]
            }
        },
        components: {
            router: {
                options: {
                    rules: flock.midi.interchange.tunings.launchpadPro.guitarE
                }
            },
            oda: {
                type: "flock.midi.interchange.oda.launchpadPro",
                options: {
                    listeners: {
                        // TODO: Write "inverse" relay to "black out" notes on play and redraw colour on release.
                        "outputMessage.loopback": {
                            funcName: "fluid.identity"
                        },
                        // TODO: Write "inverse" relay to "black out" notes on play and redraw colour on release.
                        "outputMessage.paintFromMessage": {
                            funcName: "fluid.identity"
                        }
                    }
                }
            },
            input: {
                options: {
                    listeners: {
                        "note.display": {
                            // TODO: Write "inverse" relay to "black out" notes on play and redraw colour on release.
                            func: "{loom}.noteToOda",
                            args: ["{arguments}.0"]
                        }
                    }
                }
            }
        }
    });
})(fluid, flock);
