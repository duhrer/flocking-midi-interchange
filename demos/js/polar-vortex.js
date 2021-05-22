(function (flock, fluid) {
    "use strict";
    fluid.registerNamespace("flock.midi.interchange.demos.polarVortex");

    // TODO: Initialise our Tone setup, ideally based on a UI input.

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
        minAttraction: -1,
        maxAttraction: 1,
        attractionChangeIncrement: 0.1,
        minRotation: -45,
        maxRotation: 45,
        rotationChangeIncrement: 5,
        bpm: 512, // TODO: Consider adding controls for this.
        decayRate: 0.8, // TODO: Controls for this?
        // keyboard input
        cellClickKeys: ["Enter", " "],
        members: {
            activeNotes: {},
            tetheredChains: {},
            untetheredChains: [],
        },
        model: {
            attraction: -0.1,
            rotation: 30,
            colourScheme: "{that}.options.colourSchemes.white"
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
            attractionContainer: ".attraction__container",
            attractionValue: ".attraction__value",
            noteInput:  ".note-input",
            rotationContainer: ".rotation__container",
            rotationValue: ".rotation__value",
            uiOutput:   ".ui-output",
            visualisation: ".visualisation"
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
            handleVisualisationMousedown: {
                funcName: "flock.midi.interchange.demos.polarVortex.handleVisualisationMousedown",
                args: ["{that}", "{arguments}.0"] // event
            },
            handleVisualisationMouseup: {
                funcName: "flock.midi.interchange.demos.polarVortex.handleVisualisationMouseup",
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
            // keyboard handling for attraction/rotation controls.
            "onCreate.bindAttractionKeyDown": {
                "this": "{that}.dom.attractionContainer",
                "method": "keydown",
                "args": ["{that}.handleAttractionKeydown"]
            },
            "onCreate.bindRotationKeyDown": {
                "this": "{that}.dom.rotationContainer",
                "method": "keydown",
                "args": ["{that}.handleRotationKeydown"]
            }
        },
        modelListeners: {
            "colourScheme": {
                excludeSource: "init",
                funcName: "flock.midi.interchange.demos.polarVortex.paintDevice",
                args: ["{that}"]
            },
            "rotation": {
                funcName: "flock.midi.interchange.demos.polarVortex.displayRotation",
                args: ["{that}"]
            },
            "attraction": {
                funcName: "flock.midi.interchange.demos.polarVortex.displayAttraction",
                args: ["{that}"]
            }
        }
    });

    flock.midi.interchange.demos.polarVortex.displayRotation = function (that) {
        var rotationValueElement = that.locate("rotationValue");
        rotationValueElement.text(that.model.rotation);
    };

    flock.midi.interchange.demos.polarVortex.displayAttraction = function (that) {
        var attractionValueElement = that.locate("attractionValue");
        attractionValueElement.text(that.model.attraction);
    };

    flock.midi.interchange.demos.polarVortex.handleVisualisationMousedown = function (that, event) {
        // Create a new "untethered chain" for this note.
        // vc-" + row + "-" + col;
        var matches = event.target.id && event.target.id.match(/vc-(.+)-(.+)/);
        if (matches) {
            try {
                var row = parseInt(matches[1], 10);
                var col = parseInt(matches[2], 10);
                var firstCellDef = flock.midi.interchange.demos.polarVortex.getPolarFromXY(col, row);
                firstCellDef.energy = 127;
                var newChain = flock.midi.interchange.demos.polarVortex.createChain(firstCellDef);
                that.tetheredChains["mouse"] = newChain;
            }
            catch (error) {
                fluid.log("Can't determine row and column for element " + event.target.id);
            }
        }
    };

    flock.midi.interchange.demos.polarVortex.handleVisualisationMouseup = function (that) {
        var chainToUntether = fluid.get(that, "tetheredChains.mouse");
        if (chainToUntether) {
            that.untetheredChains.push(chainToUntether);
            delete that.tetheredChains.mouse;
        }
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
                    var newChain = flock.midi.interchange.demos.polarVortex.createChain(firstCellDef);
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
        var newChain = flock.midi.interchange.demos.polarVortex.createChain(firstCellDef);
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
        flock.midi.interchange.demos.launchpadPong.sendValueArrayToDevice(that, valueArray);
    };

    flock.midi.interchange.demos.polarVortex.updateVisualisation = function (that) {
        var visualisationContainer = that.locate("visualisation");
        var valueArray = flock.midi.interchange.demos.polarVortex.generateColourArray(that);
        for (var a = 0; a < valueArray.length; a += 3) {
            // The Launchpad supports a range of 0-64 per colour, so we scale that up to 255 with a little "gain" added.
            var r = valueArray[a] * 6;
            var g = valueArray[a + 1] * 6;
            var b = valueArray[a + 2] * 6;
            var row = Math.trunc(a / 24);
            var col = Math.trunc((a % 24) / 3);
            var id = "#vc-" + row + "-" + col;
            var cellElement = visualisationContainer.find(id);
            cellElement.attr("style", "background-color: rgb(" + r + ", " + g + ", " + b + ");");
        }
    };

    flock.midi.interchange.demos.polarVortex.renderVisualisation = function (that) {
        var visualisationContainer = that.locate("visualisation");
        var elementsAsStrings = [];
        for (var row = 7; row >= 0; row--) {
            for (var col = 0; col < 8; col++) {
                var id = "vc-" + row + "-" + col;
                elementsAsStrings.push("<div class=\"visualisation__cell\" tabindex=\"0\" id=\"" + id + "\" style=\"\"></div>");
            }
        }
        visualisationContainer.html(elementsAsStrings.join("\n"));
        // We could probably restructure this as dynamic components or static markup, but for now...
        var cellContainers = visualisationContainer.find(".visualisation__cell");
        cellContainers.mousedown(that.handleVisualisationMousedown);
        cellContainers.mouseup(that.handleVisualisationMouseup);
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
     *  To paint an 8 x 8 grid, you need 64 x 3, or 192 values.
     *
     */
    flock.midi.interchange.demos.polarVortex.generateColourArray = function (that) {
        var energyGrid = flock.midi.interchange.demos.polarVortex.generateEnergyGrid(that);

        var allCellColours = [];
        for (var row = 0; row < 8; row++) {
            for (var col = 0; col < 8; col++) {
                var cellColours = flock.midi.interchange.demos.launchpadPong.generateSingleCellColours(that, Math.min(1, energyGrid[row][col]));
                allCellColours.push(cellColours);
            }
        }
        return fluid.flatten(allCellColours);
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
                            var trailingRow         = Math.trunc(cellXYCoordinates.y);
                            var leadingRow          = trailingRow + 1;

                            // Modulos are negative for negative numbers, which can invert later calculations when
                            // the x value of the cell is outside the left edge.
                            var xLeadingPercentage  = Math.abs(cellXYCoordinates.x % 1);
                            var xTrailingPercentage = 1 - xLeadingPercentage;
                            var trailingCol         = Math.trunc(cellXYCoordinates.x);
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
        return energyGrid;
    };

    // TODO: Safely create an empty grid to use for grid-ising the raw position of all cells.
    flock.midi.interchange.demos.polarVortex.generateEmptyGrid = function () {
        var singleRow = fluid.generate(8, 0);
        var grid = fluid.generate(8, function (){ return fluid.copy(singleRow); }, true);
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
                var colourScheme = fluid.find(that.options.colourSchemes, function (candidateColourScheme) {
                    return candidateColourScheme.control === midiMessage.number ? candidateColourScheme : undefined;
                });
                // TODO: Toggle between positive and negative variations on the same colour theme if they hit the color twice.
                if (colourScheme) {
                    that.applier.change("colourScheme", colourScheme);
                }
            }
            // Upward Arrow: Increase "attraction".
            else if (midiMessage.number === 91) {
                if (that.model.attraction > that.options.minAttraction) {
                    var newAttraction = flock.midi.interchange.demos.polarVortex.safeAdd(that.model.attraction, that.options.attractionChangeIncrement);
                    that.applier.change("attraction", newAttraction);
                }
            }
            // Downward Arrow: Decrease "attraction".
            else if (midiMessage.number === 92) {
                if (that.model.attraction < that.options.maxAttraction) {
                    var newAttraction = flock.midi.interchange.demos.polarVortex.safeAdd(that.model.attraction, -1 * that.options.attractionChangeIncrement);
                    that.applier.change("attraction", newAttraction);
                }
            }
            // Left Arrow: Shift rotation counterclockwise.
            else if (midiMessage.number === 93) {
                if (that.model.rotation > that.options.minRotation) {
                    that.applier.change("rotation",  that.model.rotation - that.options.rotationChangeIncrement);
                }
            }
            // Right Arrow: Shift rotation clockwise.
            else if (midiMessage.number === 94) {
                if (that.model.rotation < that.options.maxRotation) {
                    that.applier.change("rotation", that.model.rotation + that.options.rotationChangeIncrement);
                }
            }
        }
    };

    flock.midi.interchange.demos.polarVortex.startPolling = function (that) {
        that.scheduler.schedule({
            type: "repeat",
            freq: 1,
            callback: that.updateChains
        });

        that.scheduler.setTimeScale(60 / that.options.bpm);
        that.scheduler.start();
    };

    flock.midi.interchange.demos.polarVortex.updateChains= function (that) {
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

        // Update the onscreen visualisation.
        flock.midi.interchange.demos.polarVortex.updateVisualisation(that);

        // Repaint the device.
        flock.midi.interchange.demos.polarVortex.paintDevice(that);
    };

    flock.midi.interchange.demos.polarVortex.createChain = function (firstCellDef) {
        var newChain = {
            cells: [firstCellDef]
        };

        // TODO: Initialise Tone class and set starting parameters.
        // 1. Left/Right offset tied to panning.
        // 2. Up/Down offset tied to pitch.
        // 3. Distance from centre controls ??? modulation? distortion?
        // 4. Rotation around centre controls phase or other repeating setting.
        // 5. All updates are tied to the polling frequency, so that they complete just before the next cycle.

        return newChain;
    };

    flock.midi.interchange.demos.polarVortex.updateChain = function (that, chainRecord, isTethered) {
        if (chainRecord.cells.length) {
            var lastCell = chainRecord.cells[chainRecord.cells.length - 1];

            var newRadius  = lastCell.radius + that.model.attraction;
            var newAzimuth = (lastCell.azimuth + that.model.rotation)  % 360;
            var newEnergy  = lastCell.energy * that.options.decayRate;

            // Add a new segment after the last segment if it would not take us out of bounds.
            if (newRadius > 0 && newRadius < 5) {
                var newCell = {
                    radius:  newRadius,
                    azimuth: newAzimuth,
                    energy:  newEnergy
                };
                chainRecord.cells.push(newCell);

                // TODO: Calculate new average Tone parameters and rampTo the new values.
                // 1. Average Left/Right offset tied to panning.
                // 2. Average Up/Down offset tied to pitch.
                // 3. Average radius centre controls ??? modulation? distortion?
                // 4. Average azimuth controls phase or other repeating setting.
                // 5. All updates are tied to the polling frequency, so that they complete just before the next cycle.
            }

            // If we're not connected to a held note, delete the first segment in the "chain".
            if (!isTethered) {
                chainRecord.cells.shift();
            }
        }
        else {
            flock.midi.interchange.demos.polarVortex.deactivateChain(chainRecord);
        }
    };

    flock.midi.interchange.demos.polarVortex.deactivateChain = function (chainRecord) {
        // TODO: Stop and then destroy all Tone classes related to this "chain".
        // 1. Left/Right offset tied to panning.
        // 2. Up/Down offset tied to pitch.
        // 3. Distance from centre controls ??? modulation? distortion?
        // 4. Rotation around centre controls phase or other repeating setting.
        // 5. All updates are tied to the polling frequency, so that they complete just before the next cycle.
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
})(flock, fluid);
