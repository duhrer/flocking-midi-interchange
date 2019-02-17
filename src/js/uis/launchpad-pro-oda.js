/*

    "Onscreen Device Analogue" for the Novation Launchpad Pro.

 */
(function (fluid, $){
    "use strict";

    fluid.defaults("flock.midi.interchange.oda.launchpadPro", {
        gradeNames: ["flock.midi.interchange.oda"],
        svgData: flock.midi.interchange.svg.launchpadPro,
        htmlColourByVelocity: flock.midi.interchange.colours.htmlColourByVelocity.launchpadPro
        // TODO: This is only accurate for the programmer mode, consider forcing that on connect in our "loom".
    });
})(fluid, $);
