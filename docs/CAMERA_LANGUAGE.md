# CAMERA LANGUAGE

## Camera Philosophy
The camera behaves exactly like a physical cinema camera mounted on an advanced, stabilized rig (e.g., Steadicam, Technocrane, or fluid head). It possesses mass, inertia, and a tangible presence within the virtual space. It is never a disembodied eye or an abstract computational viewport. Its movements are driven strictly by **narrative intent**.

## Allowed Behaviors
* **Glide:** Smooth, heavily damped translations through space.
* **Pan & Tilt:** Restrained rotations with easing applied to both ends of the movement.
* **Track:** Following a physical or narrative subject with slight latency to simulate a human operator.
* **Focus Pulls:** Adjusting depth of field smoothly to direct audience attention.
* **Focal Length Adjustments:** Subtle zooming (changes in FOV) strictly emulating physical lens characteristics (e.g., moving from a 35mm to a 50mm equivalent).

## Forbidden Behaviors
* **Orbiting:** The camera must NEVER be placed on an orbit rig around an object (no `OrbitControls`).
* **Teleporting:** The camera must NEVER snap to a new position.
* **Spinning:** Rapid, disorienting rotations are strictly forbidden.
* **Instant Stops:** The camera must NEVER stop moving abruptly without deceleration.
* **Game-like WASD / Free Look:** The user does not drive the camera freely.

## Lens Behaviour
* **FOV:** Fixed at a cinematic baseline (e.g., equivalent to a 35mm lens) unless intentionally adjusted.
* **Depth of Field:** Realistic physical aperture simulation. Focus pulls happen naturally. Bokeh must feel optical, not computationally generated.
* **Distortion:** Barely perceptible chromatic aberration and edge distortion mimicking real glass, applied globally via post-processing but restrained.

## Weight & Inertia
The camera possesses mass. 
* **Acceleration:** Always uses an ease-in curve. The camera takes physical effort to get moving.
* **Deceleration:** Always uses a long ease-out curve. Momentum carries the camera slightly past the input release point.

## Camera Breathing
When the camera is "static", it is never mathematically frozen.
* It must exhibit micro-movements (breathing).
* This movement uses low-frequency, complex noise (e.g., Simplex noise applied to position and rotation) to simulate a breathing human operator or gentle atmospheric suspension.

## Input Relationship
* **Scroll Relationship:** Scroll input translates to narrative progression along a predefined spline or logic path, NOT direct pixel-for-pixel translation. Scrolling builds momentum, releasing scroll allows momentum to dissipate.
* **Mouse Relationship:** Mouse movement does NOT rotate the camera natively. It induces subtle parallax (see INTERACTION_LANGUAGE.md).

## Speed, Acceleration, & Deceleration Curves
* **Speed:** Governed by the narrative pacing. Slower during exposition, slightly faster during transitions, but never exceeding a realistic physical rig speed.
* **Acceleration Curves:** `Power3.easeIn` equivalent.
* **Deceleration Curves:** `Power4.easeOut` equivalent.
* **Rules for Stopping:** The camera never reaches velocity 0 abruptly. It asymptotically approaches 0.

## Framing & Revealing Information
* **Framing:** Adheres to classical cinematic composition (Rule of Thirds, Golden Ratio). Subjects are framed deliberately.
* **Revealing:** Information is revealed through physical camera movement (tracking out from behind an object, rising above a horizon) rather than popping into existence.

## Narrative Intent Examples
* *Intent: "Discover the underground."* -> Camera slowly tilts down, tracking vertically into a cavernous space, ISO adjusts to lower light, FOV subtly widens to emphasize scale.
* *Intent: "Examine the artifact."* -> Camera slowly pushes in, depth of field becomes incredibly shallow, locking focus exclusively on the object's surface details.
