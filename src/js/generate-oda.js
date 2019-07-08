/*

    Generate an ODA as JSON, and then produce an SVG file based on the same using xml-mapping.

    See https://developers.google.com/gdata/docs/json?csw=1 for examples of the format required.

    Say that we want to produce SVG output like the following:

    <?xml version="1.0" encoding="UTF-8"?>
    <svg
       xmlns="http://www.w3.org/2000/svg"
       version="1.1"
       viewBox="0 0 304 304">
      <rect
          ry="0"
          rx="0"
          y="2"
          x="2"
          height="300"
          width="300"
          class="device-note"
          id="device-note-001"
          style="fill:#64ff58;stroke:#ea0000;stroke-width:4"/>
    </svg>

    We would start with JSON like:

    {
        version: "1.0",
        encoding: "UTF-8",
        svg: {
            xmlns: "http://www.w3.org/2000/svg",
            version: "1.1",
            viewBox: "0 0 304 304",
            rect: {
                ry: "0",
                rx: "0",
                y: "2",
                x: "2",
                height: "300",
                width: "300",
                class: "device-note",
                id: "device-note-001",
                style: "fill:#64ff58;stroke:#ea0000;stroke-width:4"
            }
       }
    }

    Note that the stroke-width is evenly distributed within the object and without, such that a 300px wide square with
    a stroke of 4px is 304px wide (2 pixels of the stroke stick out on each of the left and right sides).

    As shown above, the outermost object is itself the XML tag, and each sub property name is the name of the tag that
    should contain its content.  Attributes are key: value pairs underneath each object. Here is a quick example that
    covers the syntax for repeated elements and textual content:

    {
        bookshelf: {
            shelf: [ { $t: "fiction" }, { $t: "nonfiction" } ]
        }
    }

    Put through XMLMapping.dump, the above would result in the following XML:

    <xml>
        <bookshelf>
            <shelf>fiction</shelf>
            <shelf>nonfiction</shelf>
        </bookshelf>
    </xml>
 */
"use strict";
var fluid = require("infusion");
var flock = fluid.registerNamespace("flock");

var XMLMapping = require('xml-mapping');
var fs = require("fs");

require("../../");

fluid.registerNamespace("flock.midi.interchange.svgGen");

// TODO: Make this reusable from a single common include.
flock.midi.interchange.svgGen.zeroPadNumber = function (number) {
    return (number + 1000).toString().slice(1);
};


flock.midi.interchange.svgGen.generate = function (that) {
    var xmlAsJson = that.getXmlAsJson();
    var xmlAsXml = XMLMapping.dump(xmlAsJson, that.options.xmlDumpOptions);
    var resolvedPath = fluid.module.resolvePath(that.options.outputPath);
    fs.writeFileSync(resolvedPath, xmlAsXml);
    fluid.log("Saved output to '" + resolvedPath + "'.");
};

// Base grade that just outputs a blank SVG using its boilerplate SVG content.
fluid.defaults("flock.midi.interchange.svgGen", {
    gradeNames: ["fluid.component"],
    outputPath: "%flocking-midi-interchange/dist/sample.svg",
    xmlDumpOptions: { header: true }, // Add proper xml tag at the start of the output.
    baseXmlAsJson: {
        svg: {
            xmlns: "http://www.w3.org/2000/svg",
            version: "1.1"
        }
    },
    invokers: {
        getXmlAsJson: {
            funcName: "fluid.identity",
            args:     ["{that}.options.baseXmlAsJson"]
        }
    },
    listeners: {
        "onCreate.generate": {
            funcName: "flock.midi.interchange.svgGen.generate",
            args:     ["{that}"]
        }
    }
});

// Generate a blank SVG using the base grade:
//
// flock.midi.interchange.svgGen();

// Sub grades that override `getXMlAsJson` and add graphical elements.


fluid.registerNamespace("flock.midi.interchange.svgGen.singleRow");
flock.midi.interchange.svgGen.singleRow.getXmlAsJson = function (that) {
    var svgAsJson = fluid.merge({}, that.options.baseXmlAsJson);
    // TODO: Figure out how to work this for things like the single pixel ODA that need to have a larger
    // document height.  Optional property?
    var viewBoxHeight = (that.options.cellWidth + (that.options.strokeWidth/2));
    var viewBoxWidth = 125 * ( viewBoxHeight + that.options.marginWidth);
    svgAsJson.svg.viewBox = [0, 0, viewBoxWidth, viewBoxHeight].join(" ");
    svgAsJson.svg.g = {
        class: "all-notes",
        rect: []
    };

    for (var a = 0; a < 125; a++) {
        var x = ((that.options.strokeWidth / 2) * (a + 1)) + (that.options.cellWidth * a) + (that.options.marginWidth * a);
        var y = that.options.cellHeight / 2;
        var thisRect = {
            ry: "0",
            rx: "0",
            y: y,
            x: x ,
            height: that.options.cellHeight,
            width: that.options.cellWidth,
            class: "device-note",
            id: "device-note-" + flock.midi.interchange.svgGen.zeroPadNumber(a),
            style: "fill:#000000;stroke:#000000;stroke-width:" + that.options.strokeWidth
        };
        svgAsJson.svg.g.rect.push(thisRect);
    }

    return svgAsJson;
};

fluid.defaults("flock.midi.interchange.svgGen.singleRow", {
    gradeNames: ["flock.midi.interchange.svgGen"],
    outputPath: "%flocking-midi-interchange/dist/singleRow.svg",
    cellWidth:   8,
    cellHeight:  8,
    strokeWidth: 0,
    marginWidth: 0,
    invokers: {
        getXmlAsJson: {
            funcName: "flock.midi.interchange.svgGen.singleRow.getXmlAsJson",
            args:     ["{that}"]
        }
    }
});

// Row of 128 squares.
flock.midi.interchange.svgGen.singleRow();

// Second 1-pixel version
flock.midi.interchange.svgGen.singleRow({
    outputPath: "%flocking-midi-interchange/dist/singleRowPixelHigh.svg",
    cellHeight:  1
});

/*

    Generate an SVG that represents the "common" tuning between the launchpad and launchpad pro.

    76 77 78 79 80 81 82 83
    68 69 70 71 72 73 74 75
    60 61 62 63 64 65 66 67
    52 53 54 55 56 57 58 59
    44 45 46 47 48 49 50 51
    36 37 38 39 40 41 42 43
    28 29 30 31 32 33 34 35
    20 21 22 23 24 25 26 27

 */

fluid.registerNamespace("flock.midi.interchange.svgGen.launchpadCommon");

flock.midi.interchange.svgGen.launchpadCommon.getXmlAsJson = function (that) {
    var svgAsJson = fluid.merge({}, that.options.baseXmlAsJson);
    var viewBoxHeight = (that.options.cellHeight + (that.options.strokeWidth/2)) * that.options.rows;
    var viewBoxWidth = that.options.columns * (that.options.cellWidth + that.options.marginWidth + that.options.strokeWidth);
    svgAsJson.svg.viewBox = [0, 0, viewBoxWidth, viewBoxHeight].join(" ");
    svgAsJson.svg.g = {
        class: "all-notes",
        rect: []
    };

    for (var row = 0; row < that.options.rows ; row++) {
        for (var column = 0; column < that.options.columns; column++) {
            var x = (that.options.cellWidth + that.options.marginWidth + (that.options.strokeWidth*2)) * column;
            var y = (that.options.cellHeight + (that.options.strokeWidth*2)) * row;
            var note = (76 - (8 * row)) + column;

            var thisRect = {
                ry: "0",
                rx: "0",
                y: y,
                x: x ,
                height: that.options.cellHeight,
                width: that.options.cellWidth,
                class: "device-note",
                id: "device-note-" + flock.midi.interchange.svgGen.zeroPadNumber(note),
                style: "fill:#000000;stroke:none;stroke-width:" + that.options.strokeWidth
            };
            svgAsJson.svg.g.rect.push(thisRect);
        }
    }

    return svgAsJson;
};

fluid.defaults("flock.midi.interchange.svgGen.launchpadCommon", {
    gradeNames: ["flock.midi.interchange.svgGen"],
    outputPath: "%flocking-midi-interchange/dist/launchpadCommon.svg",
    cellWidth:   70,
    cellHeight:  35,
    strokeWidth: 0,
    marginWidth: 0,
    columns: 8,
    rows: 8,
    invokers: {
        getXmlAsJson: {
            funcName: "flock.midi.interchange.svgGen.launchpadCommon.getXmlAsJson",
            args:     ["{that}"]
        }
    }
});

flock.midi.interchange.svgGen.launchpadCommon();
