# Performance Standards: Home Screen

> STUBBORN_FACT: TV hardware has weak CPUs and constrained RAM; heavy DOM, JS frameworks, or layout thrashing will cause frame drops and remote input lag.

## Constraints
- **Zero Heavy Frameworks**: Vanilla JS only. No React/Vue/Svelte runtimes in TV home.
- **Render Budget**: First paint < 100ms; remote key navigation response < 16ms (60 FPS).
- **CSS Over JS**: Transitions and animations handled strictly via GPU-accelerated CSS (`transform`, `opacity`). Never animate `width`, `height`, `top`, or `left`.
- **Minimal DOM Depth**: Flat hierarchy. Unrendered offscreen cards must be virtualized or unmounted.
- **Asset Weight**: Zero uncompressed assets. WebP / SVGs for icons. Strict cache control.
