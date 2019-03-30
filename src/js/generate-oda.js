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
