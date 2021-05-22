/* globals jqUnit */
(function (jqUnit) {
    "use strict";

    jqUnit.module("Unit tests for polar vortex.");

    jqUnit.test("Polar coordinates for cardinal points should be sane.", function () {
        jqUnit.expect(16);
        var scenarioDefs = {
            north: {
                col: 3.5,
                row: 7,
                expected: {
                    radius: 3.5,
                    azimuth: 90
                }
            },
            northeast: {
                col: 7,
                row: 7,
                expected: {
                    radius: 3.5 * Math.sqrt(2),
                    azimuth: 45
                }
            },
            east: {
                col: 7,
                row: 3.5,
                expected: {
                    radius: 3.5,
                    azimuth: 0
                }
            },
            southEast: {
                col: 7,
                row: 0,
                expected: {
                    radius: 3.5 * Math.sqrt(2),
                    azimuth: 315
                }
            },
            south: {
                col: 3.5,
                row: 0,
                expected: {
                    radius: 3.5,
                    azimuth: 270
                }
            },
            southWest: {
                col: 0,
                row: 0,
                expected: {
                    radius: 3.5 * Math.sqrt(2),
                    azimuth: 225
                }
            },
            west: {
                col: 0,
                row: 3.5,
                expected: {
                    radius: 3.5,
                    azimuth: 180
                }
            },
            northWest: {
                col: 0,
                row: 7,
                expected: {
                    radius: 3.5 * Math.sqrt(2),
                    azimuth: 135
                }
            }
        };

        fluid.each(scenarioDefs, function (singleScenario, scenarioKey) {
            var polarCoords = flock.midi.interchange.demos.polarVortex.getPolarFromXY(singleScenario.col, singleScenario.row);

            jqUnit.assertDeepEq("The radius for the '" + scenarioKey + "' direction should be as expected.", singleScenario.expected.radius, polarCoords.radius);
            jqUnit.assertDeepEq("The azimuth for the '" + scenarioKey + "' direction should be as expected.", singleScenario.expected.azimuth, polarCoords.azimuth);
        });
    });

    jqUnit.test("Polar <-> X/Y conversions should survive round tripping.", function () {
        jqUnit.expect(128);
        for (var row = 0; row < 8; row++) {
            for (var col = 0; col < 8; col++) {
                var polarCoords = flock.midi.interchange.demos.polarVortex.getPolarFromXY(col, row);
                var xYCoords = flock.midi.interchange.demos.polarVortex.getXYfromPolar(polarCoords.radius, polarCoords.azimuth);

                var xDiff = Math.abs(col - xYCoords.x);
                jqUnit.assertTrue("The round tripped x value should be very close to the original.", xDiff < 0.1);

                var yDiff = Math.abs(row - xYCoords.y);
                jqUnit.assertTrue("The round tripped y value should be very close to the original.", yDiff < 0.1);
            }
        }
    });

    jqUnit.test("'Energy grid' generation should be correct.", function () {
        var mockComponentTemplate =  {
            model: {
                colourScheme: {r: 1, g: 1, b: 1 }
            },
            untetheredChains: {},
            tetheredChains: {}
        };

        var scenarioDefs =  {
            noEnergy: {
                radius: 3.5 * Math.sqrt(2),
                azimuth: 225,
                energy: 0
            },
            southWest: {
                radius: 3.5 * Math.sqrt(2),
                azimuth: 225,
                energy: 127,
                expectedEnergy: {
                    0: { 0: 1 }
                }
            },
            south: {
                radius: 3.5,
                azimuth: 270,
                energy: 127,
                expectedEnergy: {
                    0: { 3: 0.5, 4: 0.5 }
                }
            },
            southEast: {
                radius: 3.5 * Math.sqrt(2),
                azimuth: 315,
                energy: 127,
                expectedEnergy: {
                    0: { 7: 1 }
                }
            },
            east: {
                radius: 3.5,
                azimuth: 0,
                energy: 127,
                expectedEnergy: {
                    3: { 7: 0.5 },
                    4: { 7: 0.5}
                }
            },
            northEast: {
                radius: 3.5 * Math.sqrt(2),
                azimuth: 45,
                energy: 127,
                expectedEnergy: {
                    7: { 7: 1 }
                }
            },
            north: {
                radius: 3.5,
                azimuth: 90,
                energy: 127,
                expectedEnergy: {
                    7: { 3: 0.5, 4: 0.5 }
                }
            },
            northWest: {
                radius: 3.5 * Math.sqrt(2),
                azimuth: 135,
                energy: 127,
                expectedEnergy: {
                    7: { 0: 1 }
                }
            },
            west: {
                radius: 3.5,
                azimuth: 180,
                energy: 127,
                expectedEnergy: {
                    3: { 0: 0.5 },
                    4: { 0: 0.5}
                }
            }
        };

        fluid.each(scenarioDefs, function (scenarioDef, scenarioKey) {
            var mockComponent = fluid.copy(mockComponentTemplate);
            mockComponent.tetheredChains.note = {
                cells: [{ radius: scenarioDef.radius, azimuth: scenarioDef.azimuth, energy: scenarioDef.energy}]
            };
            var energyGrid = flock.midi.interchange.demos.polarVortex.generateEnergyGrid(mockComponent);
            var errorCells = [];
            for (var row = 0; row < 8; row++) {
                for (var col = 0; col < 8; col++) {
                    var expectedCellEnergy = fluid.get(scenarioDef.expectedEnergy,  [row, col]) || 0;
                    var calculatedEnergy = energyGrid[row][col];
                    // The rounding is not always exact, so allow for 0.01% deviance from the expected value.
                    if (Math.abs(expectedCellEnergy - calculatedEnergy) > 0.0001) {
                        errorCells.push({ row: row, col: col, expected: expectedCellEnergy, actual: calculatedEnergy});
                    }
                }
            }

            if (errorCells.length) {
                var errorMessage = "There should have been no miscalculated cells for scenario '" + scenarioKey + "'.\n";
                fluid.each(errorCells, function (errorCellDef) {
                    errorMessage += "     - (" + errorCellDef.row + "," + errorCellDef.col + ") expected: " + errorCellDef.expected + ", actual: " + errorCellDef.actual + "\n";
                });
                jqUnit.fail(errorMessage);
            }
            else {
                jqUnit.assert("There were no miscalculated cells for scenario '" + scenarioKey + "'.");
            }
        });
    });

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
    // flock.midi.interchange.demos.polarVortex.polarFromMidiMessage = function (midiMessage) {

    // flock.midi.interchange.demos.polarVortex.generateEmptyGrid

    // flock.midi.interchange.demos.polarVortex.updateChain = function (that, chainRecord, isTethered)
})(jqUnit);
