/*

    A "loom" to weave together a Launchpad Pro and its ODA.

*/
(function (fluid, flock) {
    "use strict";

    fluid.defaults("flock.midi.interchange.oda.launchpadPro.loom", {
        gradeNames: ["flock.midi.interchange.oda.loom"],
        // preferredUiOutput: "Launchpad Pro Standalone Port",
        // preferredInput: "Launchpad Pro Standalone Port",
        uiPaintMessages: {
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
                type: "flock.midi.interchange.oda.launchpadPro"
            }
        }
    });
})(fluid, flock);
