# CONTINUITY LANGUAGE

## Definition of Continuity
Continuity is the absolute preservation of a single, uninterrupted spatial and temporal reality. The visitor must never consciously realize that they have moved between logical "sections" of the experience. There are no wipes, fades to black (unless narratively justified as sleep/darkness), morphs, or loading screens.

## Environmental Masking
Transitions occur naturally within the 3D space by passing through environmental boundaries that obscure the background. This allows the WorldDirector to cull behind the camera and instance new assets ahead without the user noticing.

## Occlusion Rules
If a major structural change in the scene must occur (e.g., moving from a dense forest to a barren desert):
* The camera must pass completely behind a physical object (e.g., tracking closely behind a massive tree trunk).
* The transition happens while the view is physically occluded by the foreground element.

## Atmospheric Continuity & Fog Rules
* **Fog:** Volumetric fog is the primary tool for distance masking. It defines the edge of the world dynamically.
* **Cloud Banks:** Moving through a thick bank of clouds or mist allows the environment to reset entirely.
* **Particle Fields:** Dense rain, snow, or floating organic matter can be leveraged to reduce visibility naturally.

## Exposure Rules
Transitions can occur through lighting.
* Moving from intense brightness (overexposure/bloom) to balanced lighting.
* Plunging into absolute darkness and slowly adapting exposure to reveal a new environment.
* The exposure adaptation must mimic the human eye (or a camera sensor).

## Visibility & Camera Cover
* The engine must always maintain "cover" for the camera. 
* If assets are streaming in, the ContinuityDirector must intensify fog or adjust camera angles to ensure geometry never "pops" into existence within the frustum.

## Transition Timing
* Transitions must feel organic to the physical speed of the camera.
* A cloud transition should take the exact amount of time it takes to fly through a physically scaled cloud (e.g., 3-5 seconds), not a rushed 0.5-second animation.

## What is Forbidden
* **Fading UI/Canvases:** Fading the entire WebGL canvas opacity.
* **Geometry Popping:** Any mesh appearing instantly in the camera's view.
* **Unjustified Color Shifts:** Instantly changing the ambient light or fog color without a physical light source or atmospheric change driving it.
* **Warping/Morphing:** Distorting the screen or morphing models to simulate travel.

## Examples
1. **The Canopy Transition:** The camera flies upward into a thick canopy of leaves. The screen is momentarily filled with dark green geometry (occlusion). When the camera emerges above the leaves, it is sunset and the biome has changed.
2. **The Mist Transition:** The camera descends into a valley. Ground fog thickens volumetrically until it completely engulfs the lens. As the camera pushes through, the fog thins, revealing an underground cavern.
