/* A demonstration of the isomorphic tonnetz tunings for the Launchpad Pro (and Launchpad) */
(function (fluid, flock) {
    "use strict";


    // TODO: Force "programmer mode" on startup.

    fluid.defaults("flock.midi.interchange.demos.laserScrewdriver", {
        gradeNames: ["flock.midi.interchange.transformingRouterHarness"],
        preferredInputDevice: "Launchpad Pro Standalone Port",
        preferredOutputDevice: "sforzando",
        components: {
            router: {
                options: {
                    rules: {
                        note: flock.midi.interchange.tunings.launchpadPro.tonnetz
                    }
                }
            },
            // TODO: Add a more interesting UI
            //noteInput: {
            //    options: {
            //        components: {
            //            connection: {
            //                options: {
            //                    listeners: {
            //                        "message.sendToDevice": {
            //                            funcName: "flock.midi.interchange.transformingRouterHarness.sendTransformedMessage",
            //                            args: ["{noteOutput}", "{arguments}.0"] //  outputComponent, message
            //                        }
            //                    }
            //                }
            //            }
            //        }
            //    }
            //}
        }
    });
})(fluid, flock);
