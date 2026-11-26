# WebGL Performance Review — 26 November 2026

## Scope and preservation
This review is advisory. The approved Three.js renderer, model builders, geometry, materials, cameras, model animation functions, canvas IDs, stage sizing, touch handling, DPR caps, and AI/CRM routes remain unchanged. Do not apply proposed renderer changes without explicit owner approval and a separate preview branch.

## Current implementation observed
- One shared Three.js WebGLRenderer with antialiasing, alpha, preserveDrawingBuffer false, and high-performance power preference.
- Shared renderer buffer is 1792 × 1344; device-aware DPR caps are applied per stage.
- A requestAnimationFrame loop renders each visible slot.
- IntersectionObserver excludes off-screen model slots; the loop sleeps when no slots are visible or the document is hidden.
- Each rendered WebGL frame is copied from the shared WebGL canvas into the slot's 2D canvas using drawImage.
- Visible model slots continue to call their orbit update; hero and other models use small continuous auto-rotation speeds.
- Touch canvases use touch-action: pan-y, allowing native vertical page scrolling while retaining pointer-based orbit interaction.
- This is not a guaranteed 60 FPS. rAF follows the browser's available display cadence, but CPU/GPU work, compositing and device thermals determine actual frame pacing.

## Likely pressure points (source-based inference; not measured profiling)
1. Per-frame WebGL-to-2D canvas copies add main-thread/compositor work for every visible stage.
2. Multiple visible slots are rendered sequentially; frame time grows with the number and complexity of visible scenes.
3. Continuous auto-rotation means scenes render even when visitors are not interacting.
4. A 1792 × 1344 shared target and antialiasing can still be costly on thermally constrained tablets and phones.
5. Scroll and touch input share the main thread with rendering. Heavy frames can delay page scroll and pointer response.

## Research-backed guidance
- Three.js recommends renderer.setAnimationLoop() as its preferred animation-loop interface for compatibility. It does not by itself reduce GPU load. https://threejs.org/docs/pages/WebGLRenderer
- Three.js responsive guidance warns that high-DPI rendering multiplies pixel work and recommends limiting drawing-buffer size for heavy scenes. Existing DPR caps are already present; do not raise them blindly. https://threejs.org/manual/pages/responsive.html
- MDN recommends avoiding synchronous GPU readback and blocking WebGL queries in production, batching draw calls, and considering smaller back buffers when appropriate. https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices
- Chrome recommends deferring heavy work that is not immediately visible and pausing off-screen canvas/WebGL work. Existing IntersectionObserver/off-screen sleep follows this pattern. https://developer.chrome.com/docs/modern-web-guidance/guides
- web.dev explains that long main-thread tasks and expensive visual layers can cause missed frames. Validate with real-device traces rather than assuming a nominal FPS target. https://web.dev/articles/smoothness

## Recommended optimisation sequence
1. Capture a baseline on the target tablet in Chrome: frame-time percentiles, long tasks, dropped frames, GPU pressure, and scroll/pointer responsiveness for hero-only, one lower stage, and two simultaneously visible stages.
2. Add a debug-only performance HUD behind a query flag; do not collect customer data or ship a permanent overlay.
3. Evaluate demand-driven rendering: render on pointer interaction, resize, visibility change and explicit scene changes; stop idle auto-rotation only with owner approval. Keep drag updates smooth with one scheduled frame per browser refresh.
4. Evaluate whether one shared WebGL canvas can be displayed directly in stage regions or whether per-stage 2D copies can be eliminated. This is an architectural refactor requiring visual regression tests for all stages, z-order, clipping, fullscreen and touch.
5. Only after measurements, tune render-target dimensions and antialiasing per device class. Do not increase DPR or promise 60 FPS without device profiling.
6. Consider OffscreenCanvas/worker rendering only as a separate compatibility-tested project. It requires transferring a canvas before creating its context, moving scene setup/input coordination into a worker, and testing Safari/iOS and Android support. It is not a drop-in switch for the current shared renderer.
7. Run all 3D visual/interaction tests plus AI image-analysis, CRM status and /api/health regression checks before production promotion.

## Do not do
- Do not add a second rAF loop or arbitrary FPS throttle.
- Do not pause the entire WebGL loop on scroll; that previously caused visible freezes.
- Do not call gl.getError(), gl.getParameter(), readPixels() or other synchronous readbacks every frame.
- Do not set preserveDrawingBuffer true as a screenshot workaround.
- Do not change Three.js versions, scene geometry, materials, textures, camera framing, touch-action or shared renderer dimensions as a quick guess.
- Do not touch AI image-analysis or CRM routes, schema, secrets or live records.

## Gemini note
No live Gemini consultation was performed. Recommendations above come from the linked Google Chrome, Three.js, MDN and web.dev documentation. Gemini should be treated as an additional opinion, not a substitute for profiling the actual target device.
