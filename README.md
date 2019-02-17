# Flocking MIDI Interchange

This library is designed to assist in writing "MIDI interchanges", which consume and/or produce MIDI messages.

## Transforming MIDI Router

A transforming MIDI router is a type of "interchange" that accepts MIDI messages from an input, ["transforms" the data
based on a series of rules](https://docs.fluidproject.org/infusion/development/ModelTransformationAPI.html), and the
outputs the results. This type of real time transforming router can do things like:

1. Output MIDI messages to play chords instead of individual input notes.
2. Remap inputs, for example to change the tuning of an input device.
3. Repurpose input controls, for example by making inputs that send control codes result in notes being played.
4. Split a single input among multiple MIDI channels.

Many things like this can be accomplished only by writing new rules and configuration options.  This is a by-product of
the two underlying libraries used, namely [Infusion](https://docs.fluidproject.org/infusion/development/) and
[Flocking](https://github.com/colinbdclark/Flocking).   These libraries make it possible create complex "components"
whose behaviour can change dramatically simply based on the configuration options.  New instruments are often little
more than a thin skin of key changes on top of an existing component.

## UI Router

Devices like the Novation Launchpad series, Ableton Push series, and Keith McMillan Instruments QuNeo have UI elements
(lights) that change based on received MIDI messages.  This package provides a "UI router", which is another type of
"interchange", this time between desired UI updates and MIDI outputs.  Like the Transforming MIDI router, this type
of router uses transformation rules to translate a desired UI update into the appropriate MIDI messages.  By writing
alternate rules, a wide range of devices can be easily modeled.  For more information, see the
[ui router documentation](./docs/ui-router.md).

## Onscreen Device Analogues

In addition to the above, this package provides onscreen equivalents of select devices, that can be used to operate an
interface with a mouse and keyboard, either as a sole means of input, or in combination with a connected device. For
more information, see the [onscreen device analogue documentation](./docs/onscreen-device-analogue.md).

## Try it out!

This package includes a handful of demonstrations of various routers.  To use them:

1. Check out this package.
2. Install its dependencies (i.e. run `npm install`).
3. Open the file `index.html` in this directory in a browser that supports the WebMIDI API (Opera and Chrome at time of
   writing).
