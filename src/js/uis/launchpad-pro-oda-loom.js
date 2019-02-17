/*

    A "loom" to weave together a Launchpad Pro and its ODA.

*/
(function (fluid, flock) {
    "use strict";

    // TODO: Bring in tuning from previous router or integrate with base ODA loom.
    fluid.defaults("flock.midi.interchange.oda.launchpadPro.loom", {
        gradeNames: ["flock.midi.interchange.oda.loom"],
        components: {
            oda: {
                type: "flock.midi.interchange.oda.launchpadPro"
            }
        }
    })
})(fluid, flock);
