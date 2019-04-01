/*

    "Onscreen Device Analogue" for the Novation Launchpad Pro.

 */
(function (fluid, $){
    "use strict";

    fluid.defaults("flock.midi.interchange.oda.launchpadPro", {
        gradeNames: ["flock.midi.interchange.oda"],
        svgData: flock.midi.interchange.svg.launchpadPro,
        // TODO: Transition all traditional "map" approaches to use transforms instead.
        htmlColourByVelocity: flock.midi.interchange.colours.htmlColourByVelocity.launchpadPro
    });
})(fluid, $);
