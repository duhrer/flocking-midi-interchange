var fluid = require("infusion");

invertMap = function (originalMap) {
    var flippedMap = {};
    fluid.each(originalMap, function (value, key) {
        flippedMap[value] = key;
    });
    return flippedMap;
};

colourByVelocity = {
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

var velocityByColour = invertMap(colourByVelocity);

var keys = Object.keys(velocityByColour);

keys.sort(function (a, b) {
    var intA = parseInt(a.substring(1),16);
    var intB = parseInt(b.substring(1),16);
    return intA - intB;
});

console.log("{");
fluid.each(keys, function (colour) {
    var velocity = velocityByColour[colour]
    console.log(velocity + ": \"" + colour + "\",")
});
console.log("}");

var foo = {
    0: "#000000",
    87: "#00FF00",
    122: "#00ff00",
    45: "#0101FF",
    23: "#16A20A",
    26: "#19AC1E",
    35: "#19B295",
    64: "#1ABB10",
    22: "#1BC208",
    101: "#1CC998",
    37: "#1DAECF",
    123: "#1DC60D",
    38: "#1DC9EF",
    34: "#1DD0C8",
    31: "#20DFAA",
    33: "#21E9CB",
    88: "#21F906",
    21: "#21FA04",
    39: "#22D6F5",
    65: "#23F0A5",
    24: "#23F9BE",
    25: "#24FFAE",
    77: "#25FAB4",
    76: "#25FE13",
    79: "#26DCFD",
    78: "#26DEFA",
    27: "#26FDB5",
    68: "#29FFFD",
    29: "#2BFFFF",
    43: "#2EB8FD",
    30: "#30FCDE",
    28: "#32F97D",
    41: "#36DBFD",
    42: "#37AAF4",
    102: "#4CFFD1",
    47: "#4F3BC1",
    66: "#5962EB",
    90: "#5AFFFC",
    46: "#5B40ED",
    18: "#66cc66",
    80: "#717AFD",
    67: "#737EFB",
    51: "#7D3CB5",
    63: "#83CD3C",
    86: "#83F62C",
    112: "#94919D",
    15: "#999900",
    19: "#99ff99",
    20: "#99ffcc",
    104: "#A4BCFD",
    125: "#A79E0C",
    7: "#aa0000",
    71: "#AAA8BB",
    69: "#AB94FD",
    103: "#ABACBE",
    44: "#AEAFFD",
    50: "#B65DED",
    98: "#B6FF29",
    55: "#B824BC",
    92: "#BAFEFD",
    114: "#BAFFF2",
    40: "#BBF3FB",
    121: "#BD0610",
    36: "#BFFBFB",
    83: "#C08650",
    93: "#C0D5FE",
    89: "#C2FFEF",
    117: "#C3E1F2",
    91: "#C4FFFE",
    32: "#C6FCF9",
    100: "#C9A00E",
    111: "#C9FF50",
    85: "#CAFF58",
    6: "#cc0000",
    11: "#cc9900",
    14: "#cccc00",
    1: "#CCCCCC",
    16: "#ccffcc",
    48: "#D1C2FD",
    110: "#D1F380",
    74: "#D3F846",
    127: "#D8680C",
    97: "#D8E014",
    81: "#DB5FFC",
    62: "#DBCA12",
    59: "#DC00B8",
    60: "#DD7D35",
    49: "#DDA1FC",
    75: "#E1FFDB",
    106: "#E20011",
    58: "#E229B3",
    99: "#E6DB0F",
    120: "#E7000C",
    113: "#E7FAD9",
    2: "#EEEEEE",
    115: "#efefFf",
    73: "#EFFFDE",
    116: "#EFFFEF",
    70: "#F1F4FE",
    108: "#F28E75",
    118: "#F2F2F2",
    56: "#F69FE1",
    61: "#F6BB28",
    72: "#F72C4E",
    54: "#F735F8",
    126: "#F8A80E",
    109: "#F8E376",
    57: "#F954FB",
    52: "#F9C8F9",
    95: "#FC5DFD",
    96: "#FC7E09",
    84: "#FC8F0D",
    82: "#FCA9FE",
    94: "#FCB2FD",
    105: "#FCE6BB",
    10: "#fdaa84",
    4: "#FDB1CF",
    107: "#FDB699",
    8: "#FDFBF2",
    13: "#fdfc8f",
    119: "#FEFEFF",
    124: "#FEFF33",
    5: "#FF0000",
    12: "#ffdd66",
    3: "#FFFFFF",
};
