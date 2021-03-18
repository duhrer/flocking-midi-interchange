/* eslint-env node */
"use strict";
var fluid = require("infusion");

var my = fluid.registerNamespace("my");

fluid.registerNamespace("my.component");

my.component.addModelListener = function (that) {
    that.applier.modelChanged.addListener({ segs: ["very", "deep"] }, that.logModelChange, "nu-haim-space");
};

// that, value, oldValue, pathSegs, changeRequest, transaction
my.component.logModelChange = function (that, value, oldValue, pathSegs) {
    fluid.log("value:", value, "pathSegs:", pathSegs);
};

fluid.defaults("my.component", {
    gradeNames: ["fluid.modelComponent"],
    invokers: {
        logModelChange: {
            funcName: "my.component.logModelChange",
            args: ["{that}", "{arguments}.0", "{arguments}.1", "{arguments}.2", "{arguments}.3", "{arguments}.4"] // value, oldValue, pathSegs, changeRequest, transaction
        }
    },
    listeners: {
        "onCreate.addModelListener": {
            funcName: "my.component.addModelListener",
            args:     ["{that}"]
        }
    }
});

var component = my.component();

component.applier.change("very.deep.path.0", "value");
