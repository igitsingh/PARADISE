# LIGHTING LANGUAGE

## Light Philosophy
Lighting is a storytelling device, not just a way to make objects visible. It establishes mood, implies time, and directs the user's attention. Every light source must have a physical, narrative justification within the world.

## Physical Realism
* **PBR Workflow:** All materials and lighting must adhere strictly to Physically Based Rendering principles. 
* **Energy Conservation:** Light cannot bounce infinitely. Materials cannot reflect more light than they receive.
* **Falloff:** All point and spot lights must use physically correct inverse-square falloff.

## Color Temperature
* Lights are defined by color temperature (Kelvin), not arbitrary RGB hex codes.
* Example: Sunlight at golden hour (3500K), overcast sky (6500K), bioluminescence (8000K+).

## Contrast Rules
* Maintain cinematic contrast ratios. Avoid flat, evenly lit scenes.
* Embrace darkness. It is acceptable—and encouraged—for parts of the screen to fall into pure black if it serves the narrative.
* Highlights should roll off smoothly (via ACES filmic tonemapping) rather than clipping to harsh white.

## Shadow Philosophy
* Shadows are as important as light. They provide depth and volume.
* **Softness:** Shadows must respect the size of the light source (e.g., the sun casts relatively hard shadows; an overcast sky casts imperceptible, soft ambient occlusion).
* **Contact Shadows:** Grounded objects must exhibit accurate contact shadows (via high-quality AO or shadow mapping).

## Specific Scenarios
* **Dawn:** High contrast, long shadows, cool ambient light transitioning to warm directional light. Atmosphere catches the light heavily (volumetrics).
* **Morning:** Balanced, crisp lighting. Lower contrast than dawn.
* **Underground:** Complete absence of a global directional light. Illumination relies purely on emissive materials, bioluminescence, or tight, focused spotlights (like a flashlight or shaft of light from above).
* **Product Reveal:** The lighting shifts from environmental to focused. A "studio" setup occurs naturally—perhaps a shaft of sunlight hits the product exactly, acting as a rim light and a key light to highlight texture and form.

## Exposure Adaptation
* The camera sensor (or human eye) adapts to light changes.
* Moving from a dark cave into bright sunlight results in temporary overexposure, followed by a gradual settling of the exposure level (simulated via post-processing).

## Volumetrics
* Light interacting with the atmosphere (God rays, volumetric lighting) is essential for cinematic scale.
* It must be used deliberately and restricted to specific moments (e.g., dawn, dense forests, dusty caverns) to preserve the performance budget.

## Reflection Rules
* Reflections should rely heavily on Environment Maps (HDRI) for ambient reflections to save on real-time rendering costs.
* Screen Space Reflections (SSR) are forbidden due to performance unless critically necessary and scoped to high-end devices only. Use baked cubemaps where possible.
