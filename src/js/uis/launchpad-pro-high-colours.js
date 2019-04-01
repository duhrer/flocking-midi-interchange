(function (fluid, flock) {
    "use strict";
    fluid.registerNamespace("flock.midi.interchange.oda.launchpadPro.uis");
    // TODO: Transition all traditional "map" approaches to use transforms instead.
    flock.midi.interchange.oda.launchpadPro.uis.highColours = [
        // TODO: Figure out how to reuse this more cleanly.
        // Boilerplate sysex to set mode and layout, see:
        // https://customer.novationmusic.com/sites/customer/files/novation/downloads/10598/launchpad-pro-programmers-reference-guide_0.pdf
        // All sysex messages for the launchpad pro have the same header (framing byte removed)
        // 00h 20h 29h 02h 10h
        // Select "standalone" mode.
        { type: "sysex", data: [0, 0x20, 0x29, 0x02, 0x10, 33, 1] },
        // Select "programmer" layout
        { type: "sysex", data: [0, 0x20, 0x29, 0x02, 0x10, 44, 3]},

        { type: "control", channel: 0, number: 10, value:    80 },
        { type: "noteOn",  channel: 0, note:   11, velocity: 81 },
        { type: "noteOn",  channel: 0, note:   12, velocity: 82 },
        { type: "noteOn",  channel: 0, note:   13, velocity: 83 },
        { type: "noteOn",  channel: 0, note:   14, velocity: 84 },
        { type: "noteOn",  channel: 0, note:   15, velocity: 85 },
        { type: "noteOn",  channel: 0, note:   16, velocity: 86 },
        { type: "noteOn",  channel: 0, note:   17, velocity: 87 },
        { type: "noteOn",  channel: 0, note:   18, velocity: 88 },
        { type: "control", channel: 0, number: 19, value:    89 },
        { type: "control", channel: 0, number: 20, value:    90 },
        { type: "noteOn",  channel: 0, note:   21, velocity: 91 },
        { type: "noteOn",  channel: 0, note:   22, velocity: 92 },
        { type: "noteOn",  channel: 0, note:   23, velocity: 93 },
        { type: "noteOn",  channel: 0, note:   24, velocity: 94 },
        { type: "noteOn",  channel: 0, note:   25, velocity: 95 },
        { type: "noteOn",  channel: 0, note:   26, velocity: 96 },
        { type: "noteOn",  channel: 0, note:   27, velocity: 97 },
        { type: "noteOn",  channel: 0, note:   28, velocity: 98 },
        { type: "control", channel: 0, number: 29, value:    99 },
        { type: "control", channel: 0, number: 30, value:    100 },
        { type: "noteOn",  channel: 0, note:   31, velocity: 101 },
        { type: "noteOn",  channel: 0, note:   32, velocity: 102 },
        { type: "noteOn",  channel: 0, note:   33, velocity: 103 },
        { type: "noteOn",  channel: 0, note:   34, velocity: 104 },
        { type: "noteOn",  channel: 0, note:   35, velocity: 105 },
        { type: "noteOn",  channel: 0, note:   36, velocity: 106 },
        { type: "noteOn",  channel: 0, note:   37, velocity: 107 },
        { type: "noteOn",  channel: 0, note:   38, velocity: 108 },
        { type: "control", channel: 0, number: 39, value:    109 },
        { type: "control", channel: 0, number: 40, value:    110 },
        { type: "noteOn",  channel: 0, note:   41, velocity: 111 },
        { type: "noteOn",  channel: 0, note:   42, velocity: 112 },
        { type: "noteOn",  channel: 0, note:   43, velocity: 113 },
        { type: "noteOn",  channel: 0, note:   44, velocity: 114 },
        { type: "noteOn",  channel: 0, note:   45, velocity: 115 },
        { type: "noteOn",  channel: 0, note:   46, velocity: 116 },
        { type: "noteOn",  channel: 0, note:   47, velocity: 117 },
        { type: "noteOn",  channel: 0, note:   48, velocity: 118 },
        { type: "control", channel: 0, number: 49, value:    119 },
        { type: "control", channel: 0, number: 50, value:    120 },
        { type: "noteOn",  channel: 0, note:   51, velocity: 121 },
        { type: "noteOn",  channel: 0, note:   52, velocity: 122 },
        { type: "noteOn",  channel: 0, note:   53, velocity: 123 },
        { type: "noteOn",  channel: 0, note:   54, velocity: 124 },
        { type: "noteOn",  channel: 0, note:   55, velocity: 125 },
        { type: "noteOn",  channel: 0, note:   56, velocity: 126 },
        { type: "noteOn",  channel: 0, note:   57, velocity: 127 }
    ];
})(fluid, flock);
