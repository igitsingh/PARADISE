# INTERACTION LANGUAGE

## Interaction Philosophy
The environment is alive before the user interacts. Interaction does not drive the core narrative progression; it enhances the connection to the world. Interaction is a whisper, not a shout. It is premium, restrained, and deeply physical.

## Mouse Behaviour
* **Role:** The mouse is a probe into the environment, not a steering wheel.
* **Response:** Mouse movement gently shifts the perspective (parallax) or interacts with materials, but never overrides the primary camera trajectory.

## Scroll Behaviour
* **Role:** Scroll acts as the temporal/narrative driver. 
* **Response:** Scrolling pushes the timeline forward (or backward). It dictates the progression along the camera spline and the evolution of the ContinuityDirector.
* **Momentum:** Scrolling must build momentum. A flick of the scroll wheel imparts velocity that gracefully decays.

## Parallax Limits
* Mouse-driven parallax is strictly limited to micro-movements. 
* The maximum camera displacement from mouse movement should not exceed a fraction of a unit.
* It must feel like moving your head slightly while looking through a lens, not shifting your entire body.

## Hover Behaviour
* Hover states do not exist as traditional web UI (no instant color changes, no cursors turning into pointers instantly).
* Hovering over a significant element (e.g., an artifact) causes a localized physical reaction:
  * A subtle change in the object's micro-roughness.
  * A gentle displacement of nearby particles.
  * A slow, eased shift in the camera's depth of field to bring the object into sharper focus.

## World Responsiveness
* The environment reacts to the pointer as a physical force.
* Passing the mouse over vegetation causes a slight, delayed ripple (wind).
* Passing over water creates microscopic surface tension changes.
* These effects are driven by shaders (e.g., reading a global pointer uniform) and must remain incredibly subtle.

## Interaction Latency & Smoothing
* All interactions (pointer position, scroll velocity) must be passed through a smoothing function (e.g., linear interpolation / LERP or spring physics).
* Raw input values are NEVER applied directly to the camera or materials.
* There is intentional, cinematic latency. The world feels heavy and takes a fraction of a second to react to user input.

## Forbidden Interactions
* **Click-and-Drag Rotation:** The user cannot grab and spin the world.
* **Instant Hover States:** No 0ms transitions.
* **Game-like Cursors:** Custom crosshairs or heavy UI cursors are forbidden. The default cursor should remain minimal or be hidden if the interaction is purely environmental.
* **Exaggerated Physics:** No bouncy, playful physics that break the cinematic tone.
