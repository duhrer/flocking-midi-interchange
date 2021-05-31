(function (flock, fluid) {
    "use strict";
    fluid.registerNamespace("flock.midi.interchange.demos.polarVortex");

    fluid.defaults("flock.midi.interchange.demos.polarVortex", {
        gradeNames: ["fluid.viewComponent"],
        preferredInputDevice: "Launchpad Pro 1 Standalone Port",
        preferredUIOutputDevice: "Launchpad Pro 1 Standalone Port",
        setupMessages: [
            // TODO: Figure out how to reuse this more cleanly.
            // Boilerplate sysex to set mode and layout, see:
            // https://customer.novationmusic.com/sites/customer/files/novation/downloads/10598/launchpad-pro-programmers-reference-guide_0.pdf
            // All sysex messages for the launchpad pro have the same header (framing byte removed)
            // 00h 20h 29h 02h 10h
            // Select "standalone" mode.
            {type: "sysex", data: [0, 0x20, 0x29, 0x02, 0x10, 33, 1]},
            // Select "programmer" layout
            {type: "sysex", data: [0, 0x20, 0x29, 0x02, 0x10, 44, 3]}
        ],
        energyFloor: 0.0075, // A little below 1/127, i.e. when the MIDI velocity is already zero.
        decayRate: 0.8, // TODO: Controls for this?
        // keyboard input
        cellClickKeys: ["Enter", " "],
        members: {
            activeNotes: {},
            currentBpm: 512,
            tetheredChains: {},
            untetheredChains: [],
            mouseOverPolarCoords: false,
            touchCoords: {}
        },
        model: {
            attraction: -0.1,
            bpm: 512,
            rotation: 30,
            centrePitch: 220,
            colourSchemeName: "white"
        },
        colourSchemes: {
            white:  {r: 1, g: 1,    b: 1, control: 1, velocity: 1},
            red:    {r: 1, g: 0,    b: 0, control: 2, velocity: 5},
            orange: {r: 1, g: 0.25, b: 0, control: 3, velocity: 9}, // In HTML the RGB values for orange would be way off, but for the Launchpad Pro it works.
            yellow: {r: 1, g: 1,    b: 0, control: 4, velocity: 13},
            green:  {r: 0, g: 1,    b: 0, control: 5, velocity: 17},
            blue:   {r: 0, g: 1,    b: 1, control: 6, velocity: 90},
            indigo: {r: 0, g: 0,    b: 1, control: 7, velocity: 79},
            violet: {r: 1, g: 0,    b: 1, control: 8, velocity: 53}
        },
        events: {
            control: "{noteInput}.events.control",
            noteOn:  "{noteInput}.events.noteOn",
            noteOff: "{noteInput}.events.noteOff"
        },
        selectors: {
            noteInput:     ".note-input",
            uiOutput:      ".ui-output",
            visualisation: ".visualisation",
            attraction: ".attraction",
            rotation: ".rotation",
            bpm: ".bpm",
            pitch: ".pitch"
        },
        components: {
            noteInput: {
                type: "flock.midi.connectorView",
                container: "{that}.dom.noteInput",
                options: {
                    preferredPort: "{polarVortex}.options.preferredInputDevice",
                    portType: "input",
                    components: {
                        midiPortSelector: {
                            options: {
                                strings: {
                                    selectBoxLabel: "Note Input",
                                }
                            }
                        }
                    }
                }
            },
            uiOutput: {
                type: "flock.midi.connectorView",
                container: "{that}.dom.uiOutput",
                options: {
                    portType: "output",
                    preferredPort: "{polarVortex}.options.preferredUIOutputDevice",
                    components: {
                        connection: {
                            options: {
                                sysex: true, // Required to configure the Launchpad Pro.
                                listeners: {
                                    "onReady.setupDevice": {
                                        funcName: "fluid.each",
                                        args:     ["{polarVortex}.options.setupMessages", "{polarVortex}.sendToUi"]
                                    },
                                    "onReady.paintDevice": {
                                        funcName: "flock.midi.interchange.demos.polarVortex.paintDevice",
                                        args: ["{polarVortex}"]
                                    }
                                }
                            }
                        },
                        midiPortSelector: {
                            options: {
                                strings: {
                                    selectBoxLabel: "UI Output",
                                }
                            }
                        }
                    }
                }
            },
            scheduler: {
                type: "berg.scheduler",
                options: {
                    components: {
                        clock: {
                            type: "berg.clock.raf",
                            options: {
                                freq: 50 // times per second
                            }
                        }
                    }
                }
            },
            attraction: {
                type: "flock.midi.interchange.demos.polarVortex.dial",
                container: "{that}.dom.attraction",
                options: {
                    label: "Attraction",
                    max: 1,
                    min: -1,
                    increment: 0.1,
                    model: {
                        value: "{flock.midi.interchange.demos.polarVortex}.model.attraction"
                    },
                    sendToUiFn: "{flock.midi.interchange.demos.polarVortex}.sendToUi"
                }
            },
            rotation: {
                type: "flock.midi.interchange.demos.polarVortex.dial",
                container:  "{that}.dom.rotation",
                options: {
                    label: "Rotation",
                    max: 45,
                    min: -45,
                    increment: 5,
                    leftNote: 93,
                    rightNote: 94,
                    model: {
                        value: "{flock.midi.interchange.demos.polarVortex}.model.rotation"
                    },
                    sendToUiFn: "{flock.midi.interchange.demos.polarVortex}.sendToUi"
                }
            },
            bpm: {
                type: "flock.midi.interchange.demos.polarVortex.dial.log2",
                container: "{that}.dom.bpm",
                options: {
                    label: "BPM",
                    max: 4096,
                    min: 32,
                    model: {
                        value: "{flock.midi.interchange.demos.polarVortex}.model.bpm"
                    },
                    sendToUiFn: "{flock.midi.interchange.demos.polarVortex}.sendToUi"
                }
            },
            pitch: {
                type: "flock.midi.interchange.demos.polarVortex.dial.log2",
                container: "{that}.dom.pitch",
                options: {
                    columnOffset: 9,
                    label: "Pitch",
                    max: 3520,
                    min: 27.5,
                    model: {
                        value: "{flock.midi.interchange.demos.polarVortex}.model.centrePitch"
                    },
                    sendToUiFn: "{flock.midi.interchange.demos.polarVortex}.sendToUi"
                }
            }
        },
        invokers: {
            handleAttractionKeydown: {
                funcName: "flock.midi.interchange.demos.polarVortex.handleAttractionKeydown",
                args: ["{that}", "{arguments}.0"] // event
            },
            handleRotationKeydown: {
                funcName: "flock.midi.interchange.demos.polarVortex.handleRotationKeydown",
                args: ["{that}", "{arguments}.0"] // event
            },
            handleVisualisationKeydown: {
                funcName: "flock.midi.interchange.demos.polarVortex.handleVisualisationKeydown",
                args: ["{that}", "{arguments}.0"] // event
            },
            handleVisualisationKeyup: {
                funcName: "flock.midi.interchange.demos.polarVortex.handleVisualisationKeyup",
                args: ["{that}", "{arguments}.0"] // event
            },
            handleVisualisationMouseover: {
                funcName: "flock.midi.interchange.demos.polarVortex.handleVisualisationMouseover",
                args: ["{that}", "{arguments}.0"] // event
            },
            handleVisualisationMouseoutOrMouseup: {
                funcName: "flock.midi.interchange.demos.polarVortex.handleVisualisationMouseoutOrMouseup",
                args: ["{that}", "{arguments}.0"] // event
            },
            handleVisualisationTouchstartOrTouchmove: {
                funcName: "flock.midi.interchange.demos.polarVortex.handleVisualisationTouchstartOrTouchmove",
                args: ["{that}", "{arguments}.0"] // event
            },
            handleVisualisationTouchendOrTouchcancel: {
                funcName: "flock.midi.interchange.demos.polarVortex.handleVisualisationTouchendOrTouchcancel",
                args: ["{that}", "{arguments}.0"] // event
            },
            sendToNoteOut: {
                funcName: "flock.midi.interchange.demos.launchpadPong.sendToOutput",
                args: ["{noteOutput}", "{arguments}.0"] // outputComponent, message
            },
            sendToUi: {
                funcName: "flock.midi.interchange.demos.launchpadPong.sendToOutput",
                args: ["{uiOutput}", "{arguments}.0"] // outputComponent, message
            },
            updateChains: {
                funcName: "flock.midi.interchange.demos.polarVortex.updateChains",
                args: ["{that}"]
            }
        },
        listeners: {
            "onCreate.startPolling": {
                funcName: "flock.midi.interchange.demos.polarVortex.startPolling",
                args: ["{that}"]
            },
            "onCreate.renderVisualisation": {
                funcName: "flock.midi.interchange.demos.polarVortex.renderVisualisation",
                args: ["{that}"]
            },
            "noteOn.handle": {
                funcName: "flock.midi.interchange.demos.polarVortex.handleNoteOn",
                args: ["{that}", "{arguments}.0"] // midiMessage
            },
            "noteOff.handle": {
                funcName: "flock.midi.interchange.demos.polarVortex.handleNoteOff",
                args: ["{that}", "{arguments}.0"] // midiMessage
            },
            "control.handle": {
                funcName: "flock.midi.interchange.demos.polarVortex.handleControl",
                args: ["{that}", "{arguments}.0"] // midiMessage
            },
            // Mouse handling for visualisation.
            "onCreate.bindVisualisationMouseover": {
                "this": "{that}.dom.visualisation",
                "method": "mouseover",
                "args": ["{that}.handleVisualisationMouseover"]
            },
            "onCreate.bindVisualisationMouseout": {
                "this": "{that}.dom.visualisation",
                "method": "mouseout",
                "args": ["{that}.handleVisualisationMouseoutOrMouseup"]
            },
            "onCreate.bindVisualisationMouseup": {
                "this": "{that}.dom.visualisation",
                "method": "mouseup",
                "args": ["{that}.handleVisualisationMouseoutOrMouseup"]
            },
            "onCreate.bindVisualisationTouchstart": {
                "this": "{that}.dom.visualisation",
                "method": "mouseup",
                "args": ["{that}.handleVisualisationTouchstart"]
            },
            "onCreate.bindVisualisationTouchsend": {
                "this": "{that}.dom.visualisation",
                "method": "mouseup",
                "args": ["{that}.handleVisualisationTouchendOrTouchcancel"]
            },
            "onCreate.bindVisualisationTouchcancel": {
                "this": "{that}.dom.visualisation",
                "method": "mouseup",
                "args": ["{that}.handleVisualisationTouchendOrTouchcancel"]
            },
            "onCreate.bindVisualisationTouchmove": {
                "this": "{that}.dom.visualisation",
                "method": "mouseup",
                "args": ["{that}.handleVisualisationTouchstartOrTouchmove"]
            }
        },
        modelListeners: {
            "colourSchemeName": {
                excludeSource: "init",
                funcName: "flock.midi.interchange.demos.polarVortex.paintDevice",
                args: ["{that}"]
            },
            "rotation": {
                excludeSource: "init",
                funcName: "flock.midi.interchange.demos.polarVortex.paintDevice",
                args: ["{that}"]
            },
            "attraction": {
                excludeSource: "init",
                funcName: "flock.midi.interchange.demos.polarVortex.paintDevice",
                args: ["{that}"]
            },
            "bpm": {
                excludeSource: "init",
                funcName: "flock.midi.interchange.demos.polarVortex.paintDevice",
                args: ["{that}"]
            },
            "pitch": {
                excludeSource: "init",
                funcName: "flock.midi.interchange.demos.polarVortex.paintDevice",
                args: ["{that}"]
            }
        }
    });

    flock.midi.interchange.demos.polarVortex.handleVisualisationMouseover = function (that, event) {
        if (event.buttons) {
            that.mouseOverPolarCoords = flock.midi.interchange.demos.polarVortex.polarFromEvent(event);
        }
        else {
            that.mouseOverPolarCoords = false;
        }
    };

    flock.midi.interchange.demos.polarVortex.handleVisualisationMouseoutOrMouseup = function (that) {
        that.mouseOverPolarCoords = false;
    };

    flock.midi.interchange.demos.polarVortex.handleVisualisationTouchstartOrTouchmove = function (that, event) {
        that.touchCoords[event.identifier] = flock.midi.interchange.demos.polarVortex.polarFromEvent(event);
    };

    flock.midi.interchange.demos.polarVortex.handleVisualisationTouchendOrTouchcancel = function (that, event) {
        delete that.touchCoords[event.identifier];
    };

    flock.midi.interchange.demos.polarVortex.polarFromEvent = function (event) {
        var bounds = event.target.getBoundingClientRect();
        var x = event.offsetX / bounds.width * 8;
        var y = 8 - (event.offsetY / bounds.height * 8);
        var coords = flock.midi.interchange.demos.polarVortex.getPolarFromXY(x, y);
        return coords;
    };

    flock.midi.interchange.demos.polarVortex.handleVisualisationKeydown = function (that, event) {
        if (that.options.cellClickKeys.indexOf(event.key) !== -1) {
            var matches = event.target.id && event.target.id.match(/vc-(.+)-(.+)/);
            if (matches) {
                event.preventDefault();
                try {
                    var row = parseInt(matches[1], 10);
                    var col = parseInt(matches[2], 10);
                    var firstCellDef = flock.midi.interchange.demos.polarVortex.getPolarFromXY(col, row);
                    firstCellDef.energy = 127;
                    var newChain = flock.midi.interchange.demos.polarVortex.createChain(that, firstCellDef);
                    that.tetheredChains["keyboard-" + row + "-" + col] = newChain;
                }
                catch (error) {
                    fluid.log("Can't determine row and column for element " + event.target.id);
                }
            }
        }
    };

    flock.midi.interchange.demos.polarVortex.handleVisualisationKeyup = function (that, event) {
        if (that.options.cellClickKeys.indexOf(event.key) !== -1) {
            var matches = event.target.id && event.target.id.match(/vc-(.+)-(.+)/);
            if (matches) {
                event.preventDefault();
                var row = parseInt(matches[1], 10);
                var col = parseInt(matches[2], 10);
                var chainKey = "keyboard-" + row + "-" + col;
                var chainToUntether = fluid.get(that, ["tetheredChains", chainKey]);
                if (chainToUntether) {
                    that.untetheredChains.push(chainToUntether);
                    delete that.tetheredChains[chainKey];
                }
            }
        }
    };

    flock.midi.interchange.demos.polarVortex.handleAttractionKeydown = function (that, event) {
        if (event.key === "ArrowUp" && that.model.attraction < that.options.maxAttraction) {
            event.preventDefault();
            var newAttraction = flock.midi.interchange.demos.polarVortex.safeAdd(that.model.attraction, that.options.attractionChangeIncrement);
            that.applier.change("attraction", newAttraction);
        }
        else if (event.key === "ArrowDown"  && that.model.attraction > that.options.minAttraction) {
            event.preventDefault();
            var newAttraction = flock.midi.interchange.demos.polarVortex.safeAdd(that.model.attraction, -1 * that.options.attractionChangeIncrement);
            that.applier.change("attraction", newAttraction);
        }
    };

    flock.midi.interchange.demos.polarVortex.handleRotationKeydown = function (that, event) {
        if (event.key === "ArrowUp" && that.model.rotation < that.options.maxRotation) {
            event.preventDefault();
            var newRotation = flock.midi.interchange.demos.polarVortex.safeAdd(that.model.rotation, that.options.rotationChangeIncrement);
            that.applier.change("rotation", newRotation);
        }
        else if (event.key === "ArrowDown" && that.model.rotation > that.options.minRotation) {
            event.preventDefault();
            var newRotation = flock.midi.interchange.demos.polarVortex.safeAdd(that.model.rotation, -1 * that.options.rotationChangeIncrement);
            that.applier.change("rotation", newRotation);
        }
    };

    flock.midi.interchange.demos.polarVortex.handleNoteOn = function (that, midiMessage) {
        // Create a new "tethered chain" for this note.
        var firstCellDef = flock.midi.interchange.demos.polarVortex.polarFromMidiMessage(midiMessage);
        var newChain = flock.midi.interchange.demos.polarVortex.createChain(that, firstCellDef);
        that.tetheredChains[midiMessage.note] = newChain;
    };

    flock.midi.interchange.demos.polarVortex.handleNoteOff = function (that, midiMessage) {
        var chainToUntether = fluid.get(that.tetheredChains, midiMessage.note);
        // Move the current "tethered chain" for this note to the "untethered" area.
        if (chainToUntether) {
            that.untetheredChains.push(chainToUntether);
            delete that.tetheredChains[midiMessage.note];
        }
    };

    /*
        Convert to rows and columns based on the "programmer mode" of the Launchpad Pro.

        81 82 83 84 85 86 87 88
        71 72 73 74 75 76 77 78
        61 62 63 64 65 66 67 68
        51 52 53 54 55 56 57 58
        41 42 43 44 45 46 47 48
        31 32 33 34 35 36 37 38
        21 22 23 24 25 26 27 28
        11 12 13 14 15 16 17 18

     */
    flock.midi.interchange.demos.polarVortex.polarFromMidiMessage = function (midiMessage) {
        var col = (midiMessage.note % 10) - 1;
        var row = ((midiMessage.note - (midiMessage.note % 10)) / 10) - 1;
        var cellDef = flock.midi.interchange.demos.polarVortex.getPolarFromXY(col, row);
        cellDef.energy = midiMessage.velocity;
        return cellDef;
    };

    flock.midi.interchange.demos.polarVortex.paintDevice = function (that) {
        var valueArray = flock.midi.interchange.demos.polarVortex.generateColourArray(that);

        // We reuse common utility functions from the launchpad pong component for lack of a better base grade.
        flock.midi.interchange.demos.polarVortex.sendValueArrayToDevice(that, valueArray);
    };

    flock.midi.interchange.demos.polarVortex.sendValueArrayToDevice = function (that, colourArray) {
        var header = [
            // common header
            0, 0x20, 0x29, 0x02, 0x10,
            // "RGB Grid Sysex" command
            0xF,
            // 0: all pads, 1: square drum pads only.
            0
        ];
        var data = header.concat(colourArray);

        try {
            that.sendToUi({
                type: "sysex",
                data: data
            });
        }
        catch (error) {
            debugger;
            console.error(error);
        }

        // Paint the "side velocity" (0x63) a colour that matches the colour scheme.
        // F0h 00h 20h 29h 02h 10h 0Ah <velocity> <Colour> F7h
        that.sendToUi({ type: "sysex", data: [0, 0x20, 0x29, 0x02, 0x10, 0xA, 0x63, that.options.colourSchemes[that.model.colourSchemeName].velocity]});
    };

    flock.midi.interchange.demos.polarVortex.updateVisualisation = function (that) {
        var visualisationContainer = that.locate("visualisation");
        var valueArray = flock.midi.interchange.demos.polarVortex.generateColourArray(that);
        for (var a = 0; a < valueArray.length; a += 3) {
            // The Launchpad supports a range of 0-64 per colour, so we scale that up to 255 with a little "gain" added.
            var r = valueArray[a] * 6;
            var g = valueArray[a + 1] * 6;
            var b = valueArray[a + 2] * 6;
            var row = Math.trunc(a / 30);
            var col = Math.trunc((a % 30) / 3);
            var id = "#vc-" + row + "-" + col;
            var cellElement = visualisationContainer.find(id);
            cellElement.attr("style", "background-color: rgb(" + r + ", " + g + ", " + b + ");");
        }
    };

    flock.midi.interchange.demos.polarVortex.renderVisualisation = function (that) {
        var visualisationContainer = that.locate("visualisation");
        var elementsAsStrings = [];
        for (var row = 9; row >= 0; row--) {
            for (var col = 0; col < 10; col++) {
                var id = "vc-" + row + "-" + col;
                var classNames = ["visualisation__cell"];
                if ((row === 0 || row === 9) && (col === 0 || col === 9)) {
                    classNames.push(".visualisation__cell--invisible");
                }
                elementsAsStrings.push("<div class=\"" + classNames.join("") + "\" tabindex=\"0\" id=\"" + id + "\" style=\"\"></div>");
            }
        }
        visualisationContainer.html(elementsAsStrings.join("\n"));
        // We could probably restructure this as dynamic components or static markup, but for now...
        var cellContainers = visualisationContainer.find(".visualisation__cell");
        cellContainers.keydown(that.handleVisualisationKeydown);
        cellContainers.keyup(that.handleVisualisationKeyup);
    };

    /**
     *
     * Calculate how to display all cells by breaking down their position relative to the centre.  Each cell has a
     * diameter equal to the width height of a grid square. Each cell contributes whatever portion of its energy lies
     * within a grid square to that square.  The grid is 8 x 8 and the first square is row 0 and column 0. The centre is
     * between rows 3 and 4 and columns 3 and 4 of the grid.  So, a cell whose x and y value are zero contributes a
     * quarter of its energy to each of the four squares surrounding the centre point. A cell that is four or more
     * rows/columns from the centre is completely out of bounds.
     *
     * @param {Object} that - The polar vortex component itself.
     * @return {Array<Number>} - An array of numbers from 0 to 1 that represent one colour channel for a single cell.
     *  To paint a 10 x 10 grid, you need 100 x 3, or 300 values.
     *
     */
    flock.midi.interchange.demos.polarVortex.generateColourArray = function (that) {
        var energyGrid = flock.midi.interchange.demos.polarVortex.generateEnergyGrid(that);

        var allCellColours = [];
        for (var row = 0; row < 10; row++) {
            // Paint the "colour bar".
            if (row === 0) {
                // Leave a space for the nonexistent leading column.
                allCellColours.push([0,0,0]);

                // Paint each of the colour controls.
                fluid.each(that.options.colourSchemes, function (colourScheme, colourSchemeName) {
                    var intensity = (colourSchemeName === that.model.colourSchemeName) ? 0x3F : 0x08;
                    allCellColours.push([colourScheme.r * intensity, colourScheme.g * intensity, colourScheme.b * intensity]);
                });

                // Leave a space for the nonexistent trailing column.
                allCellColours.push([0,0,0]);
            }
            // Paint everything else from the energy grid and match the current colour scheme.
            else {
                for (var col = 0; col < 10; col++) {
                    var cellColours = flock.midi.interchange.demos.polarVortex.generateSingleCellColours(that, Math.min(1, energyGrid[row][col]));
                    allCellColours.push(cellColours);
                }
            }
        }

        return fluid.flatten(allCellColours);
    };

    flock.midi.interchange.demos.polarVortex.generateSingleCellColours = function (that, cellOpacity) {
        var colourScheme = that.options.colourSchemes[that.model.colourSchemeName];
        var cellValues = [];
        fluid.each(["r", "g", "b"], function (colourKey, index) {
            var maxLevel        = colourScheme[colourKey] * 0x3F;
            var calculatedLevel = maxLevel * cellOpacity;

            cellValues[index] = calculatedLevel;
        });
        return cellValues;
    };

    flock.midi.interchange.demos.polarVortex.inBounds = function(...valuesToCheck) {
        for (const singleValue of valuesToCheck) {
            if (singleValue < 0 || singleValue > 7) {
                return false;
            }
        }
        return true;
    };

    // Evaluate all "cells" and add their energy to a single sliced view of all cells, keyed by [row][col]
    //
    // To quote the "Launchpad Pro Programmer's Reference Guide":
    //
    // "The grid starts at the bottom most left LED, with the following group of parameters referring to the next
    //  LED to the right."
    //
    flock.midi.interchange.demos.polarVortex.generateEnergyGrid = function (that) {
        var energyGrid = flock.midi.interchange.demos.polarVortex.generateEmptyGrid();
        fluid.each([that.tetheredChains, that.untetheredChains], function (chainHolder){
            fluid.each(chainHolder, function (singleChain) {
                fluid.each(singleChain.cells, function (singleCell) {
                    // Skip dead cells that lack energy to contribute.
                    if (singleCell.energy > 0) {
                        var cellXYCoordinates = flock.midi.interchange.demos.polarVortex.getXYfromPolar(singleCell.radius, singleCell.azimuth);
                        // Screen out out of bounds material, but include the bordering regions in case one part of the cell is in bounds.
                        if (cellXYCoordinates.x > -1 && cellXYCoordinates.x < 8 && cellXYCoordinates.y > -1 && cellXYCoordinates.y < 8) {
                            // Modulos are negative for negative numbers, which can invert later calculations when
                            // the y value of the cell is outside the bottom edge.
                            var yLeadingPercentage  = Math.abs(cellXYCoordinates.y % 1);
                            var yTrailingPercentage = 1 - yLeadingPercentage;
                            var trailingRow         = Math.trunc(cellXYCoordinates.y) + 1;
                            var leadingRow          = trailingRow + 1;

                            // Modulos are negative for negative numbers, which can invert later calculations when
                            // the x value of the cell is outside the left edge.
                            var xLeadingPercentage  = Math.abs(cellXYCoordinates.x % 1);
                            var xTrailingPercentage = 1 - xLeadingPercentage;
                            var trailingCol         = Math.trunc(cellXYCoordinates.x) + 1;
                            var leadingCol          = trailingCol + 1;

                            var energyAsOpacity     = (singleCell.energy + 1) / 128;

                            // Top Left
                            if (flock.midi.interchange.demos.polarVortex.inBounds(trailingCol, trailingRow)) {
                                energyGrid[trailingRow][trailingCol] += energyAsOpacity * xTrailingPercentage * yTrailingPercentage;
                            }
                            // Top Right
                            if (flock.midi.interchange.demos.polarVortex.inBounds(leadingCol, trailingRow)) {
                                energyGrid[trailingRow][leadingCol] += energyAsOpacity * xLeadingPercentage * yTrailingPercentage;
                            }
                            // Bottom Left
                            if (flock.midi.interchange.demos.polarVortex.inBounds(trailingCol, leadingRow)) {
                                energyGrid[leadingRow][trailingCol] += energyAsOpacity * xTrailingPercentage * yLeadingPercentage;
                            }
                            // Bottom Right
                            if (flock.midi.interchange.demos.polarVortex.inBounds(leadingCol, leadingRow)) {
                                energyGrid[leadingRow][leadingCol] += energyAsOpacity * xLeadingPercentage * yLeadingPercentage;
                            }
                        }
                    }
                });
            });
        });

        // Paint the BPM and pitch levels.
        var bpmPower = that.bpm.getPower();
        var pitchPower = that.pitch.getPower();
        for (var row = 0; row < 10; row ++) {
            if (row <= (bpmPower + 1)) {
                energyGrid[row][0] = (row / 20);
            }
            if (row <= (pitchPower + 1)) {
                energyGrid[row][9] = (row / 20);
            }
        }

        // Paint the attraction.
        var maxAttractionDeviation = (that.attraction.options.max - that.attraction.options.min) / 2;
        var attractionLevel = that.model.attraction / maxAttractionDeviation;
        if (attractionLevel < 0)  {
            energyGrid[9][2] = Math.abs(attractionLevel);
        }
        else if (attractionLevel > 0) {
            energyGrid[9][1] = attractionLevel;
        }

        // Paint the rotation.
        var maxRotationDeviation = (that.rotation.options.max - that.rotation.options.min) / 2;
        var rotationLevel = that.model.rotation / maxRotationDeviation;
        if (rotationLevel < 0) {
            energyGrid[9][4] = Math.abs(rotationLevel);
        }
        else if (rotationLevel > 0) {
            energyGrid[9][3] = rotationLevel;
        }

        return energyGrid;
    };

    // Safely create an empty grid to use for grid-ising the raw position of all cells.
    flock.midi.interchange.demos.polarVortex.generateEmptyGrid = function () {
        var singleRow = fluid.generate(10, 0);
        var grid = fluid.generate(10, function (){ return fluid.copy(singleRow); }, true);
        return grid;
    };

    // Add numbers in a way that works better for non-integers (at least the ones we use).
    //
    // https://javascript.plainenglish.io/why-0-1-0-2-0-3-in-javascript-d7e218224a72
    flock.midi.interchange.demos.polarVortex.safeAdd = function (...valuesToAdd) {
        var totalInHundreds = 0;
        fluid.each(valuesToAdd, function (valueToAdd) {
            totalInHundreds += (valueToAdd * 100);
        });
        return totalInHundreds / 100;
    };

    flock.midi.interchange.demos.polarVortex.handleControl = function (that, midiMessage) {
        if (midiMessage.value) {
            if (midiMessage.number >=1 && midiMessage.number <=8) {
                // CCs one through eight control the colour
                var colourSchemeName = fluid.find(that.options.colourSchemes, function (candidateColourScheme, colourSchemeName) {
                    return candidateColourScheme.control === midiMessage.number ? colourSchemeName : undefined;
                });
                if (colourSchemeName) {
                    that.applier.change("colourSchemeName", colourSchemeName);
                }
            }
            // Upward Arrow: Increase "attraction".
            else if (midiMessage.number === 91) {
                that.attraction.increase();
            }
            // Downward Arrow: Decrease "attraction".
            else if (midiMessage.number === 92) {
                that.attraction.decrease();
            }
            // Left Arrow: Shift rotation counterclockwise.
            else if (midiMessage.number === 93) {
                that.rotation.increase();
            }
            // Right Arrow: Shift rotation clockwise.
            else if (midiMessage.number === 94) {
                that.rotation.decrease();
            }
            // The left column is 80, 70, etc., we use that for bpm
            else if (midiMessage.number % 10 === 0) {
                var row = Math.floor(midiMessage.number / 10) - 1;
                that.bpm.setPower(row);
            }
            // The right column is 89, 79, etc, we use that to control the "base" pitch.
            else if (midiMessage.number % 10 === 9) {
                var row = Math.floor(midiMessage.number / 10) - 1;
                that.pitch.setPower(row);
            }
        }
    };

    flock.midi.interchange.demos.polarVortex.startPolling = function (that) {
        that.scheduler.schedule({
            type: "repeat",
            freq: 1,
            callback: that.updateChains
        });

        that.scheduler.setTimeScale(60 / that.model.bpm);
        that.scheduler.start();
    };

    flock.midi.interchange.demos.polarVortex.updateChains= function (that) {
        // If our speed has changed, update the scheduler and trigger the next step early to avoid a "stutter".
        if (that.currentBpm !== that.model.bpm) {
            that.currentBpm = that.model.bpm;
            that.scheduler.setTimeScale(60 / that.currentBpm);
            return;
        }

        // Update the position of all existing chain cells.
        fluid.each(that.tetheredChains, function (tetheredChainRecord) {
            flock.midi.interchange.demos.polarVortex.updateChain(that, tetheredChainRecord, true);
        });

        fluid.each(that.untetheredChains, function (untetheredChainRecord) {
            flock.midi.interchange.demos.polarVortex.updateChain(that, untetheredChainRecord, false);
        });

        // Remove any "untethered chains" that have reached the end of their life.
        that.untetheredChains = that.untetheredChains.filter(function (singleChain) {
            return singleChain.cells.length > 0;
        });

        // Generate a new "untethered chain" for each currently active mouse pointer.
        var mouseAndTouchCoords = fluid.values(that.touchCoords);
        if (that.mouseOverPolarCoords) {
            mouseAndTouchCoords.push(that.mouseOverPolarCoords);
        }

        fluid.each(mouseAndTouchCoords, function (coords) {
            var newCell = fluid.copy(coords);
            newCell.energy = 127;
            var newChain = flock.midi.interchange.demos.polarVortex.createChain(that, newCell);
            that.untetheredChains.push(newChain);
        });

        // TODO: Same for touch.

        // Update the onscreen visualisation.
        flock.midi.interchange.demos.polarVortex.updateVisualisation(that);

        // Repaint the device.
        flock.midi.interchange.demos.polarVortex.paintDevice(that);
    };

    // TODO: Add proper touch handling.
    // https://developer.mozilla.org/en-US/docs/Web/API/Touch_events
    //
    //   el.addEventListener("touchstart", handleStart, false);
    //   el.addEventListener("touchend", handleEnd, false);
    //   el.addEventListener("touchcancel", handleCancel, false);
    //   el.addEventListener("touchmove", handleMove, false);
    //
    // This is done by looking at each touch's Touch.identifier property. This property is a unique integer for each
    // touch and remains consistent for each event during the duration of each finger's contact with the surface.
    // On each updateChain cycle, spawn a note for any registered touches.

    flock.midi.interchange.demos.polarVortex.createChain = function (that, firstCellDef) {
        var startingGain = firstCellDef.energy / 127;
        var gain         = new Tone.Gain(startingGain).toDestination();

        var startingPanning = flock.midi.interchange.demos.polarVortex.getPanningFromPolar(firstCellDef.radius, firstCellDef.azimuth);
        var panner          = new Tone.Panner(startingPanning);
        panner.connect(gain);

        var startingFrequency = flock.midi.interchange.demos.polarVortex.getFrequencyFromPolar(that, firstCellDef.radius, firstCellDef.azimuth);
        const synth = new Tone.FMSynth();
        synth.connect(panner);
        synth.triggerAttack(startingFrequency);

        var newChain = {
            cells: [firstCellDef],
            gain:   gain,
            panner: panner,
            synth:  synth
        };

        return newChain;
    };

    flock.midi.interchange.demos.polarVortex.updateChain = function (that, chainRecord, isTethered) {
        if (chainRecord.cells.length) {
            var lastCell = chainRecord.cells[chainRecord.cells.length - 1];

            var newRadius  = lastCell.radius + that.model.attraction;
            var newAzimuth = (lastCell.azimuth + that.model.rotation)  % 360;
            var newEnergy  = lastCell.energy * that.options.decayRate;

            // Add a new segment after the last segment if it would not take us out of bounds, and if its energy is
            // above our cutoff (avoids "zombie" notes that hover indefinitely).
            if (newRadius > 0 && newRadius < 5 && newEnergy > that.options.energyFloor) {
                var newCell = {
                    radius:  newRadius,
                    azimuth: newAzimuth,
                    energy:  newEnergy
                };
                chainRecord.cells.push(newCell);
            }

            // If we're not connected to a held note, delete the first segment in the "chain".
            if (!isTethered) {
                chainRecord.cells.shift();
            }
        }

        // Check the length again as we may have shifted our last note away in the previous step.
        if (chainRecord.cells.length) {
            // Tone.js uses "time in seconds" for its transition functions.
            var updateTimeInSeconds = 60 / that.model.bpm;

            // Transition to the new pitch, which is based on the average position of all cells in the chain.
            var averageFrequency = flock.midi.interchange.demos.polarVortex.getChainAverageFrequency(that, chainRecord);
            chainRecord.synth.frequency.rampTo(averageFrequency, updateTimeInSeconds);

            // Transition to the new panning level, which is based on the average position of all cells in the chain.
            var averagePanning = flock.midi.interchange.demos.polarVortex.getChainAveragePanning(chainRecord);
            chainRecord.panner.pan.rampTo(averagePanning, updateTimeInSeconds);

            // Transition to the new volume level, which is based on the average energy of all cells in the chain.
            var averageEnergy = flock.midi.interchange.demos.polarVortex.getChainAverageEnergy(chainRecord);
            var newGain = Math.min(1, Math.max(0, (averageEnergy / 127)));
            chainRecord.gain.gain.rampTo(newGain, updateTimeInSeconds);
        }
        else {
            flock.midi.interchange.demos.polarVortex.deactivateChain(chainRecord);
        }
    };

    flock.midi.interchange.demos.polarVortex.deactivateChain = function (chainRecord) {
        // Stop and then destroy all Tone classes related to this "chain".
        chainRecord.gain.disconnect();
        chainRecord.panner.disconnect();
        chainRecord.synth.disconnect();
        chainRecord.synth.dispose();
        chainRecord.panner.dispose();
        chainRecord.gain.dispose();
    };

    flock.midi.interchange.demos.polarVortex.getXYfromPolar = function (radius, azimuth) {
        var radians = azimuth * Math.PI / 180;
        var x = 3.5 + (Math.cos(radians) * radius);
        var y = 3.5 + Math.sin(radians) * radius;
        return {
            x: x,
            y: y
        };
    };

    flock.midi.interchange.demos.polarVortex.getPolarFromXY = function (x, y) {
        var xOffsetFromCentre = x - 3.5;
        var yOffsetFromCentre = y - 3.5;
        var radius = Math.sqrt((xOffsetFromCentre * xOffsetFromCentre) + (yOffsetFromCentre * yOffsetFromCentre));
        var azimuthRadians = Math.atan2(yOffsetFromCentre, xOffsetFromCentre);
        var azimuthDegrees = (360 + (azimuthRadians * 180 / Math.PI)) % 360;
        return {
            radius: radius,
            azimuth: azimuthDegrees
        };
    };

    flock.midi.interchange.demos.polarVortex.getFrequencyFromPolar = function (that, radius, azimuth) {
        var xYCoords = flock.midi.interchange.demos.polarVortex.getXYfromPolar(radius, azimuth);
        var polarity  = xYCoords.y <= 3.5 ? -1 : 1;
        var pitch = that.model.centrePitch * Math.pow(2, (radius * polarity));
        return pitch;
    };

    flock.midi.interchange.demos.polarVortex.getPanningFromPolar = function (radius, azimuth) {
        var xYCoords = flock.midi.interchange.demos.polarVortex.getXYfromPolar(radius, azimuth);
        var panningLevel = Math.max(-1, Math.min(1, (xYCoords.x - 3.5) / 3.5));
        return panningLevel;
    };

    flock.midi.interchange.demos.polarVortex.getChainAverageFrequency = function (that, chain) {
        var totalFrequency = 0;
        fluid.each(chain.cells, function (cell) {
            totalFrequency += flock.midi.interchange.demos.polarVortex.getFrequencyFromPolar(that, cell.radius, cell.azimuth);
        });
        var averageFrequency = totalFrequency /  chain.cells.length;
        return averageFrequency;
    };

    flock.midi.interchange.demos.polarVortex.getChainAveragePanning = function (chain) {
        var totalPanning = 0;
        fluid.each(chain.cells, function (cell) {
            totalPanning += flock.midi.interchange.demos.polarVortex.getPanningFromPolar(cell.radius, cell.azimuth);
        });
        var averagePanning = totalPanning /  chain.cells.length;
        return averagePanning;
    };

    flock.midi.interchange.demos.polarVortex.getChainAverageEnergy = function (chain) {
        var totalEnergy = 0;
        fluid.each(chain.cells, function (cell) {
            totalEnergy += cell.energy;
        });
        var averageEnergy = totalEnergy / chain.cells.length;
        return averageEnergy;
    };
})(flock, fluid);
