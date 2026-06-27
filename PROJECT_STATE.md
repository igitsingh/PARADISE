# Paradise Experience Engine - Project State

## Architecture Overview
The engine is built on React and React Three Fiber, adhering to the principle of a singular, continuous WebGL world. It discards traditional page loads and disjointed scenes in favor of a persistent, physically-modeled environment driven by narrative intent.

## Completed Systems (Phase 2A POC)
* **WorldDirector:** Successfully rendering primitive geometry for Region 1 (Start) and Region 2 (Hidden Area) positioned far apart along the Z-axis.
* **CameraDirector:** Implemented physical weighting, smooth damped motion, inertia, camera breathing via low-frequency sine waves, and micro-parallax. The camera never snaps or spins; it traverses a logical trajectory dictated by narrative progression.
* **ContinuityDirector:** Implemented dynamic volumetric fog and physical occlusion planes to mask the transition between Region 1 and Region 2. The transition is completely seamless.
* **LightingDirector:** Configured ACES Filmic tonemapping, physically correct exposure adaptation during dark transitions, and targeted illumination per region.
* **InteractionDirector:** Hooks for mouse and scroll inputs. Scroll strictly controls the overall "Progression" timeline rather than directly rotating the camera, building momentum over time.
* **AtmosphereDirector:** Integrated `@react-three/postprocessing` with Bloom and Noise to give the scene a cinematic, optical feel while strictly budgeting performance.

## Pending Systems
* **MaterialDirector:** Awaiting real PBR assets and texture optimization strategies for the final Paradise Organics models.
* **SoundDirector:** Awaiting spatial audio hooks (Web Audio API / Howler).
* **TimelineDirector:** Awaiting GSAP integration for specific sub-animations within regions (e.g., triggering a product spin animation when progression hits a specific threshold).

## Known Limitations
* **Scroll Sensitivity:** The scroll delta varies heavily between trackpads and mechanical mice. We will eventually need a normalization library (like `lenis` or a custom virtual scroll wrapper) to ensure consistent momentum regardless of the input device.
* **Post-Processing Overhead:** Currently running Bloom, Noise, and Vignette. We must carefully monitor FPS on mobile devices and implement the degrading strategy outlined in `PERFORMANCE_BUDGET.md`.

## Next Recommended Implementation Step
1. **Input Normalization:** Implement a virtual scroll solution (e.g., `lenis`) to normalize the `targetProgression` momentum across all input devices before integrating actual complex GSAP timelines.
2. **Asset Pipeline Proofing:** Test loading a single, optimized GLTF model with high-resolution PBR textures into `WorldDirector` to stress-test the `AssetManager` preloading logic and `MaterialDirector` shader handling.
