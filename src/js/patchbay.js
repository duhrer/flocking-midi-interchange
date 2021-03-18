// A simple "patchbay" to connect one MIDI device to another.
(function (fluid, flock) {
    "use strict";
    fluid.registerNamespace("flock.midi.interchange.patchbay");

    flock.midi.interchange.patchbay.addRouter = function (that) {
        var existingRouters = fluid.queryIoCSelector(that, "flock.midi.interchange.patchbay.router");
        var newRouterNumber = (existingRouters.length || 0) + 1;
        var newId = "router-" + newRouterNumber;
        var newSelector = "#" + newId;

        // Render router container
        var routerContainer = that.locate("routerContainer");
        var newHtml = fluid.stringTemplate(that.options.templates.router, { id: newId });
        routerContainer.append(newHtml);

        that.dom.clear();

        // Spawn router using dynamicOptions and createOnEvent.
        that.events.addRouter.fire(newSelector);
    };

    // TODO: Button to delete a particular router, should be part of a custom router grade and trigger the destruction of the markup as well.

    // Our router instance
    fluid.defaults("flock.midi.interchange.patchbay.router", {
        gradeNames: ["flock.midi.interchange.transformingRouterHarness"],
        components: {
            noteInput: {
                options: {
                    components: {
                        midiPortSelector: {
                            options: {
                                strings: {
                                    selectBoxLabel: "Input"
                                }
                            }
                        }
                    }
                }
            },
            noteOutput: {
                options: {
                    components: {
                        midiPortSelector: {
                            options: {
                                strings: {
                                    selectBoxLabel: "Output"
                                }
                            }
                        }
                    }
                }
            }
        }
    });

    // Outer component that spawns router instances.
    fluid.defaults("flock.midi.interchange.patchbay", {
        gradeNames: ["fluid.viewComponent"],
        selectors: {
            routerContainer: ".router-container",
            addRouterButton: ".add-router-button"
        },
        templates: {
            router: "\n<div class=\"single-router\" id=\"%id\">\n\t<div class=\"note-input\"></div>\n\t<div class=\"note-output\"></div></div>\n"
        },
        events: {
            addRouter: null
        },
        // Dynamic component created from an event:
        // https://docs.fluidproject.org/infusion/development/SubcomponentDeclaration.html#dynamic-subcomponents-with-a-source-event
        dynamicComponents: {
            // TODO: router grade with common defaults if needed.
            router: {
                createOnEvent: "addRouter",
                type: "flock.midi.interchange.patchbay.router",
                // Container as argument
                container: "{arguments}.0"
            }
        },
        invokers: {
            addRouter: {
                funcName: "flock.midi.interchange.patchbay.addRouter",
                args: ["{that}"]
            }
        },
        listeners: {
            "onCreate.addRouter": {
                func: "{that}.addRouter"
            },
            // TODO: Add keyboard input handling.
            "onCreate.wireAddButtonClick": {
                "this": "{that}.dom.addRouterButton",
                method: "on",
                args:   ["click", "{that}.addRouter"]
            }
        }
    });
})(fluid, flock);
