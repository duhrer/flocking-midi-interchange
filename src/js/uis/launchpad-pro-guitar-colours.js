(function (fluid, flock) {
    "use strict";
    fluid.registerNamespace("flock.midi.interchange.oda.launchpadPro.uis");
    flock.midi.interchange.oda.launchpadPro.uis.guitarColours = [
        // TODO: Figure out how to reuse this more cleanly.
        // Boilerplate sysex to set mode and layout, see:
        // https://customer.novationmusic.com/sites/customer/files/novation/downloads/10598/launchpad-pro-programmers-reference-guide_0.pdf
        // All sysex messages for the launchpad pro have the same header (framing byte removed)
        // 00h 20h 29h 02h 10h
        // Select "standalone" mode.
        { type: "sysex", data: [0, 0x20, 0x29, 0x02, 0x10, 33, 1] },
        // Select "programmer" layout
        { type: "sysex", data: [0, 0x20, 0x29, 0x02, 0x10, 44, 3]},

        // Low "E"
        { type: "control", channel: 0, number: 10, value:    5 },
        { type: "noteOn",  channel: 0, note:   11, velocity: 5 },
        { type: "noteOn",  channel: 0, note:   12, velocity: 5 },
        { type: "noteOn",  channel: 0, note:   13, velocity: 5 },
        { type: "noteOn",  channel: 0, note:   14, velocity: 5 },
        { type: "noteOn",  channel: 0, note:   15, velocity: 5 },
        { type: "noteOn",  channel: 0, note:   16, velocity: 5 },
        { type: "noteOn",  channel: 0, note:   17, velocity: 5 },
        { type: "noteOn",  channel: 0, note:   18, velocity: 5 },
        { type: "control", channel: 0, number: 19, value:    5 },
        // "A"
        { type: "control", channel: 0, number: 20, value:    13 },
        { type: "noteOn",  channel: 0, note:   21, velocity: 13 },
        { type: "noteOn",  channel: 0, note:   22, velocity: 13 },
        { type: "noteOn",  channel: 0, note:   23, velocity: 13 },
        { type: "noteOn",  channel: 0, note:   24, velocity: 13 },
        { type: "noteOn",  channel: 0, note:   25, velocity: 13 },
        { type: "noteOn",  channel: 0, note:   26, velocity: 13 },
        { type: "noteOn",  channel: 0, note:   27, velocity: 13 },
        { type: "noteOn",  channel: 0, note:   28, velocity: 13 },
        { type: "control", channel: 0, number: 29, value:    13 },
        // "D"
        { type: "control", channel: 0, number: 30, value:    45 },
        { type: "noteOn",  channel: 0, note:   31, velocity: 45 },
        { type: "noteOn",  channel: 0, note:   32, velocity: 45 },
        { type: "noteOn",  channel: 0, note:   33, velocity: 45 },
        { type: "noteOn",  channel: 0, note:   34, velocity: 45 },
        { type: "noteOn",  channel: 0, note:   35, velocity: 45 },
        { type: "noteOn",  channel: 0, note:   36, velocity: 45 },
        { type: "noteOn",  channel: 0, note:   37, velocity: 45 },
        { type: "noteOn",  channel: 0, note:   38, velocity: 45 },
        { type: "control", channel: 0, number: 39, value:    45 },
        // "G"
        { type: "control", channel: 0, number: 40, value:    61 },
        { type: "noteOn",  channel: 0, note:   41, velocity: 61 },
        { type: "noteOn",  channel: 0, note:   42, velocity: 61 },
        { type: "noteOn",  channel: 0, note:   43, velocity: 61 },
        { type: "noteOn",  channel: 0, note:   44, velocity: 61 },
        { type: "noteOn",  channel: 0, note:   45, velocity: 61 },
        { type: "noteOn",  channel: 0, note:   46, velocity: 61 },
        { type: "noteOn",  channel: 0, note:   47, velocity: 61 },
        { type: "noteOn",  channel: 0, note:   48, velocity: 61 },
        { type: "control", channel: 0, number: 49, value:    61 },
        // "B"
        { type: "control", channel: 0, number: 50, value:    21 },
        { type: "noteOn",  channel: 0, note:   51, velocity: 21 },
        { type: "noteOn",  channel: 0, note:   52, velocity: 21 },
        { type: "noteOn",  channel: 0, note:   53, velocity: 21 },
        { type: "noteOn",  channel: 0, note:   54, velocity: 21 },
        { type: "noteOn",  channel: 0, note:   55, velocity: 21 },
        { type: "noteOn",  channel: 0, note:   56, velocity: 21 },
        { type: "noteOn",  channel: 0, note:   57, velocity: 21 },
        { type: "noteOn",  channel: 0, note:   58, velocity: 21 },
        { type: "control", channel: 0, number: 59, value:    21 },
        // "High E"
        { type: "control", channel: 0, number: 60, value:    53 },
        { type: "noteOn",  channel: 0, note:   61, velocity: 53 },
        { type: "noteOn",  channel: 0, note:   62, velocity: 53 },
        { type: "noteOn",  channel: 0, note:   63, velocity: 53 },
        { type: "noteOn",  channel: 0, note:   64, velocity: 53 },
        { type: "noteOn",  channel: 0, note:   65, velocity: 53 },
        { type: "noteOn",  channel: 0, note:   66, velocity: 53 },
        { type: "noteOn",  channel: 0, note:   67, velocity: 53 },
        { type: "noteOn",  channel: 0, note:   68, velocity: 53 },
        { type: "control", channel: 0, number: 69, value:    53 }

    ];
})(fluid, flock);
