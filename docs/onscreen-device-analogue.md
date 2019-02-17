# Onscreen Device Analogue (ODA)

This package provides "onscreen device analogues" for select devices.  These are intended to:

1. Provide onscreen feedback regarding user interactions with a physical device.
2. Provide a means of operating the same interface either with a physical device, or with a mouse and keyboard.
3. Provide a means of testing an interface when no physical device is present.

This setup is made possible by a core component (documented below) common to all onscreen analogues.  To add support
for a specific device:

1. Create an SVG file with properly tagged UI elements for each button, pad, et cetera that can receive MIDI input (see
   below).
2. (Optional) Create a device-specific component that extends the core component, and which describes the supported
   htmlColourByVelocity that correspond to input velocities.`

## SVG Files

SVG files that correspond to devices should be added to the `src/images` directory in this package.  Each file in this
directory will be added to a generated javascript source file as part of the build process run when the `npm install`
command is run from the root of the repository.  This javascript source file exposes the SVG content as a namespaced
global variable.  So, for example, the file `./src/images/foo.svg` will be exposed as the file `./dist/svg-foo.js`.
Including this javascript file from your HTML page will make the global variable `flocking.midi.interchange.svg.foo`
available.  The `flocking.midi.interchange.oda` grade (see below) expects you to refer to its corresponding svg file
using this global variable name.  Please note, when adding new files, you must rerun `npm install` (or `npm run
postinstall`) before the new SVG will be available.

## flocking.midi.interchange.oda

The base grade for all onscreen device analogues.

## flocking.midi.interchange.oda.launchpad

A device-specific implementation for the original Novation Launchpad.  This should also work with the Launchpad MK2,
Launchpad S, and Launchpad Mini, but has not been tested with these.

## flocking.midi.interchange.oda.launchpadPro

A device-specific implementation for the Novation Launchpad Pro.
