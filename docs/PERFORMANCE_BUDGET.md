# PERFORMANCE BUDGET

## Core Directives
Performance is a feature, not an afterthought. The engine must maintain absolute continuity, which requires strict adherence to technical limitations. Frame drops destroy the illusion of a continuous world.

## Target Values
* **Target FPS (Desktop):** 60 FPS (V-Sync locked).
* **Target FPS (Mobile):** 60 FPS (with graceful degradation strategies triggered).
* **Draw Calls:** < 100 per frame globally. (Heavy reliance on instancing and texture atlases).
* **Triangle Count:** < 500,000 visible triangles per frame.
* **Texture Resolution:** Max 2048x2048 for hero assets. 1024x1024 for environmental assets. Heavy use of detail maps and tiling to preserve memory.
* **HDRIs:** Single global HDRI at max 1024x512 resolution, heavily compressed, used purely for lighting data (IBL). Backgrounds are obscured by fog/atmosphere, not explicit skyboxes.
* **Particle Counts:** Max 10,000 active particles globally, calculated exclusively on the GPU (Compute Shaders or custom raw ShaderMaterials).
* **Post-Processing Passes:** Max 3 passes combined into a single EffectComposer output. (e.g., SMAA, Bloom, Color Correction/LUT). Avoid chaining multiple distinct `RenderPass` operations.
* **Memory Usage (VRAM):** Keep below 500MB total at any given time.

## LOD Strategy (Level of Detail)
* Geometry must utilize discrete LOD levels. 
* Transitions between LODs must be masked by the ContinuityDirector (e.g., depth of field blur or atmospheric fog) to prevent visual "popping."
* Distant objects (beyond the fog threshold) must be culled entirely.

## Mobile Degradation Strategy
The engine must detect device capability (via Tiering/FPS monitoring) and degrade gracefully:
1. **Resolution:** Drop pixel ratio from `2.0` (Retina) to `1.0` or `0.75`.
2. **Post-Processing:** Disable Depth of Field first. Disable Bloom second. Retain only basic Color Correction (LUT).
3. **Shadows:** Switch from high-resolution PCF soft shadows to lower resolution, or disable dynamic cast shadows entirely, relying on baked AO maps.
4. **Particles:** Halve the active particle count dynamically.
5. **Materials:** Fallback to cheaper shaders (e.g., bypassing complex subsurface scattering on lower tiers).

## Shader Budget
* Custom shaders should be kept to a minimum and optimized using standard WebGL best practices (e.g., favoring vertex shaders over fragment shaders for calculations).
* Avoid expensive branching (`if` statements) inside fragment shaders. 

## Memory Management
* The AssetManager must strictly enforce garbage collection. When a region of the world is fully passed and occluded by the ContinuityDirector, its geometries and materials must be disposed of from GPU memory if they will not be reused shortly.
