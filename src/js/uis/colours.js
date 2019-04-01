(function (flock, fluid) {
    // TODO: Transition all traditional "map" approaches to use transforms instead.
    "use strict";

    fluid.registerNamespace("flock.midi.interchange.colours.htmlColourByVelocity");

    // An expander to automatically invert the schemes below to be a map of velocities by colour to support painting by colour.
    flock.midi.interchange.colours.invertMap = function (originalMap) {
        var flippedMap = {};
        fluid.each(originalMap, function (value, key) {
            flippedMap[value] = key;
        });
        return flippedMap;
    };

    // TODO: Write a "nearest colour" algorithm based on a given html colour, where the nearest colour is the one
    // the nearest has the lowest distance from the given colour, i.e. (abs(r1-r2)+ abs(g1-g2) + abs(b1-b2))/3

    // Generic 128-value rainbow colour scheme with black on one end and white on the other
    flock.midi.interchange.colours.htmlColourByVelocity.rainbow = {
        0: "#000000",
        1: "#100000",
        2: "#200000",
        3: "#300000",
        4: "#400000",
        5: "#500000",
        6: "#600000",
        7: "#700000",
        8: "#800000",
        9: "#900000",
        10: "#a00000",
        11: "#b00000",
        12: "#c00000",
        13: "#d00000",
        14: "#e00000",
        15: "#f00000",
        16: "#ff0000",
        17: "#ff0a00",
        18: "#ff1400",
        19: "#ff1e00",
        20: "#ff2900",
        21: "#ff3400",
        22: "#ff4e00",
        23: "#ff5900",
        24: "#ff6400",
        25: "#ff6e00",
        26: "#ff7900",
        27: "#ff8400",
        28: "#ff8e00",
        29: "#ff9900",
        30: "#ffa400",
        31: "#ffae00",
        32: "#ffaf00",
        33: "#ffb500",
        34: "#ffba00",
        35: "#ffbf00",
        36: "#ffc500",
        37: "#ffca00",
        38: "#ffcf00",
        39: "#ffd500",
        40: "#ffda00",
        41: "#ffdf00",
        42: "#ffe500",
        43: "#ffea00",
        44: "#ffef00",
        45: "#fff500",
        46: "#fffa00",
        47: "#ffff00",
        48: "#ffff00",
        49: "#f0ff00",
        50: "#e0ff00",
        51: "#d0ff00",
        52: "#c0ff00",
        53: "#b0ff00",
        54: "#a0ff00",
        55: "#90ff00",
        56: "#80ff00",
        57: "#70ff00",
        58: "#60ff00",
        59: "#50ff00",
        60: "#40ff00",
        61: "#30ff00",
        62: "#20ff00",
        63: "#10ff00",
        64: "#00ff00",
        65: "#00f010",
        66: "#00e020",
        67: "#00d030",
        68: "#00c040",
        69: "#00b050",
        70: "#00a060",
        71: "#009070",
        72: "#008080",
        73: "#007090",
        74: "#0060a0",
        75: "#0050b0",
        76: "#0040c0",
        77: "#0030d0",
        78: "#0020e0",
        79: "#0010f0",
        80: "#0000ff",
        81: "#0400f5",
        82: "#0800ea",
        83: "#0c00e5",
        84: "#1000da",
        85: "#1400d5",
        86: "#1800ca",
        87: "#1c00c5",
        88: "#2000ba",
        89: "#2400b5",
        90: "#2800aa",
        91: "#2c00a5",
        92: "#300095",
        93: "#34008a",
        94: "#380085",
        95: "#3c0083",
        96: "#4b0082",
        97: "#5f055f",
        98: "#6f106f",
        99: "#6f106f",
        100: "#7f207f",
        101: "#7f207f",
        102: "#8f308f",
        103: "#8f308f",
        104: "#9c409c",
        105: "#9f409f",
        106: "#af50af",
        107: "#af50af",
        108: "#bf60bf",
        109: "#bf60bf",
        110: "#cf70cf",
        111: "#df70df",
        112: "#ee82ee",
        113: "#ef00ef",
        114: "#f090f0",
        115: "#f199f1",
        116: "#f2a0f2",
        117: "#f3a9f3",
        118: "#f4b0f4",
        119: "#f5b9f5",
        120: "#f6c0f6",
        121: "#f7c9f7",
        122: "#f8d0f8",
        123: "#f9e0f9",
        124: "#faeffa",
        125: "#fcfcfc",
        126: "#fdfdfd",
        127: "#ffffff",
    };

    // "red shift" colour scheme where 0 is black, low (slow) frequencies are red, white is dead centre, and high (fast) frequencies are blue.
    flock.midi.interchange.colours.htmlColourByVelocity.redshift = {
        0: "#000000",
        1: "#100000",
        2: "#200000",
        3: "#300000",
        4: "#400000",
        5: "#500000",
        6: "#600000",
        7: "#700000",
        8: "#800000",
        9: "#900000",
        10: "#a00000",
        11: "#b00000",
        12: "#c00000",
        13: "#d00000",
        14: "#e00000",
        15: "#f00000",
        16: "#ff0000",
        17: "#ff0000",
        18: "#ff0000",
        19: "#ff0000",
        20: "#ff0000",
        21: "#ff0000",
        22: "#ff0000",
        23: "#ff0000",
        24: "#ff0000",
        25: "#ff0000",
        26: "#ff0303",
        27: "#ff0909",
        28: "#ff1010",
        29: "#ff1616",
        30: "#ff1c1c",
        31: "#ff2323",
        32: "#ff2929",
        33: "#ff3030",
        34: "#ff3636",
        35: "#ff3c3c",
        36: "#ff4343",
        37: "#ff4949",
        38: "#ff5050",
        39: "#ff5656",
        40: "#ff5c5c",
        41: "#ff6363",
        42: "#ff6969",
        43: "#ff7070",
        44: "#ff7676",
        45: "#ff7c7c",
        46: "#ff8383",
        47: "#ff8989",
        48: "#ff9090",
        49: "#ff9696",
        50: "#ff9c9c",
        51: "#ffa3a3",
        52: "#ffa9a9",
        53: "#ffb0b0",
        54: "#ffb6b6",
        55: "#ffbcbc",
        56: "#ffc3c3",
        57: "#ffc9c9",
        58: "#ffd0d0",
        59: "#ffd6d6",
        60: "#ffecec",
        61: "#fff3f3",
        62: "#fff9f9",
        63: "#ffffff",
        64: "#fcfcff",
        65: "#f8f8ff",
        66: "#f4f4ff",
        67: "#f0f0ff",
        68: "#ececff",
        69: "#e8e8ff",
        70: "#e4e4ff",
        71: "#e0e0ff",
        72: "#dcdcff",
        73: "#d8d8ff",
        74: "#d4d4ff",
        75: "#d0d0ff",
        76: "#ccccff",
        77: "#c8c8ff",
        78: "#c4c4ff",
        79: "#c0c0ff",
        80: "#bcbcff",
        81: "#b8b8ff",
        82: "#b4b4ff",
        83: "#b0b0ff",
        84: "#acacff",
        85: "#a8a8ff",
        86: "#a4a4ff",
        87: "#a0a0ff",
        88: "#9c9cff",
        89: "#9898ff",
        90: "#9494ff",
        91: "#9090ff",
        92: "#8c8cff",
        93: "#8888ff",
        94: "#8484ff",
        95: "#8080ff",
        96: "#7c7cff",
        97: "#7878ff",
        98: "#7474ff",
        99: "#7070ff",
        100: "#6c6cff",
        101: "#6868ff",
        102: "#6464ff",
        103: "#6060ff",
        104: "#5c5cff",
        105: "#5858ff",
        106: "#5454ff",
        107: "#5050ff",
        108: "#4c4cff",
        109: "#4848ff",
        110: "#4444ff",
        111: "#4040ff",
        112: "#3c3cff",
        113: "#3838ff",
        114: "#3434ff",
        115: "#3030ff",
        116: "#2c2cff",
        117: "#2828ff",
        118: "#2424ff",
        119: "#2020ff",
        120: "#1c1cff",
        121: "#1818ff",
        122: "#1414ff",
        123: "#1010ff",
        124: "#0c0cff",
        125: "#0808ff",
        126: "#0404ff",
        127: "#0000ff",
    };

    // Sampled from illustrations in the Launchpad Pro Programmer's Guide and device photos.
    flock.midi.interchange.colours.htmlColourByVelocity.launchpadPro = {
        0: "#000000",
        1: "#CCCCCC",
        2: "#EEEEEE",
        3: "#FFFFFF",
        4: "#FDB1CF",
        5: "#FF0000",
        6: "#cc0000",
        7: "#aa0000",
        8: "#FDFBF2",
        9: "#fdaa84",
        10: "#fdaa84",
        11: "#cc9900",
        12: "#ffdd66",
        13: "#fdfc8f",
        14: "#cccc00",
        15: "#999900",
        16: "#ccffcc",
        17: "#99ff99",
        18: "#66cc66",
        19: "#99ff99",
        20: "#99ffcc",
        21: "#21FA04",
        22: "#1BC208",
        23: "#16A20A",
        24: "#23F9BE",
        25: "#24FFAE",
        26: "#19AC1E",
        27: "#26FDB5",
        28: "#32F97D",
        29: "#2BFFFF",
        30: "#30FCDE",
        31: "#20DFAA",
        32: "#C6FCF9",
        33: "#21E9CB",
        34: "#1DD0C8",
        35: "#19B295",
        36: "#BFFBFB",
        37: "#1DAECF",
        38: "#1DC9EF",
        39: "#22D6F5",
        40: "#BBF3FB",
        41: "#36DBFD",
        42: "#37AAF4",
        43: "#2EB8FD",
        44: "#AEAFFD",
        45: "#0101FF",
        46: "#5B40ED",
        47: "#4F3BC1",
        48: "#D1C2FD",
        49: "#DDA1FC",
        50: "#B65DED",
        51: "#7D3CB5",
        52: "#F9C8F9",
        53: "#F735F8",
        54: "#F735F8",
        55: "#B824BC",
        56: "#F69FE1",
        57: "#F954FB",
        58: "#E229B3",
        59: "#DC00B8",
        60: "#DD7D35",
        61: "#F6BB28",
        62: "#DBCA12",
        63: "#83CD3C",
        64: "#1ABB10",
        65: "#23F0A5",
        66: "#5962EB",
        67: "#737EFB",
        68: "#29FFFD",
        69: "#AB94FD",
        70: "#F1F4FE",
        71: "#AAA8BB",
        72: "#F72C4E",
        73: "#EFFFDE",
        74: "#D3F846",
        75: "#E1FFDB",
        76: "#25FE13",
        77: "#25FAB4",
        78: "#26DEFA",
        79: "#26DCFD",
        80: "#717AFD",
        81: "#DB5FFC",
        82: "#FCA9FE",
        83: "#C08650",
        84: "#FC8F0D",
        85: "#CAFF58",
        86: "#83F62C",
        87: "#00FF00",
        88: "#21F906",
        89: "#C2FFEF",
        90: "#5AFFFC",
        91: "#C4FFFE",
        92: "#BAFEFD",
        93: "#C0D5FE",
        94: "#FCB2FD",
        95: "#FC5DFD",
        96: "#FC7E09",
        97: "#D8E014",
        98: "#B6FF29",
        99: "#E6DB0F",
        100: "#C9A00E",
        101: "#1CC998",
        102: "#4CFFD1",
        103: "#ABACBE",
        104: "#A4BCFD",
        105: "#FCE6BB",
        106: "#E20011",
        107: "#FDB699",
        108: "#F28E75",
        109: "#F8E376",
        110: "#D1F380",
        111: "#C9FF50",
        112: "#94919D",
        113: "#E7FAD9",
        114: "#BAFFF2",
        115: "#efefFf",
        116: "#EFFFEF",
        117: "#C3E1F2",
        118: "#F2F2F2",
        119: "#FEFEFF",
        120: "#E7000C",
        121: "#BD0610",
        122: "#00ff00",
        123: "#1DC60D",
        124: "#FEFF33",
        125: "#A79E0C",
        126: "#F8A80E",
        127: "#D8680C"
    };
})(flock, fluid);
