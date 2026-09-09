(() => {
    'use strict';

    const field = document.getElementById('ascii-bg');
    if (!field) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const palette = ' .,:;irsXA253hMHGS#9B&@';
    const frameDuration = 1000 / 18;
    const measurement = document.createElement('canvas').getContext('2d');
    let columns = 0;
    let rows = 0;
    let aspect = 1;
    let frame = 0;
    let lastTime = 0;
    let elapsed = 0;

    function draw() {
        const phase = elapsed * 0.00018;
        const lines = [];
        for (let y = 0; y < rows; y++) {
            let line = '';
            for (let x = 0; x < columns; x++) {
                // Rotate the sampling plane so the folds travel diagonally across the viewport.
                const px = (x / columns - 0.5) * aspect * 3.4;
                const py = (y / rows - 0.5) * 3.4;
                const u = px * 0.82 + py * 0.57;
                const v = py * 0.82 - px * 0.57;
                const bend = Math.sin(u * 1.15 + phase) * 0.65
                    + Math.sin(u * 0.52 - phase * 0.7) * 0.32;
                const cross = (v - bend) * 2.2;

                // Parallel folded ribbons: space between them keeps the composition open.
                const fold = Math.cos(cross);
                if (fold < -0.1) {
                    line += ' ';
                    continue;
                }
                const slope = Math.sin(cross);
                const tangent = Math.cos(u * 1.15 + phase) * 0.75
                    + Math.cos(u * 0.52 - phase * 0.7) * 0.17;
                const normalX = slope * tangent;
                const normalY = -slope;
                const light = Math.max(0, (normalX * -0.35 + normalY * -0.55 + 0.72)
                    / Math.hypot(normalX, normalY, 1));
                const edge = Math.min(1, Math.max(0, (fold + 0.1) * 2.5));
                const grain = 0.88 + Math.sin(u * 4 - phase * 0.9) * 0.12;
                const shade = Math.pow(light, 1.5) * edge * grain;
                const index = Math.min(palette.length - 1, Math.floor(shade * palette.length));
                line += palette[index];
            }
            lines.push(line);
        }
        field.textContent = lines.join('\n');
    }

    function resize() {
        const style = getComputedStyle(field);
        const fontSize = parseFloat(style.fontSize);
        if (measurement) measurement.font = `${style.fontWeight} ${fontSize}px ${style.fontFamily}`;
        const glyphWidth = measurement ? measurement.measureText('M').width : fontSize * 0.6;
        const pitch = glyphWidth + (parseFloat(style.letterSpacing) || 0);
        columns = Math.ceil(field.clientWidth / pitch);
        rows = Math.ceil(field.clientHeight / parseFloat(style.lineHeight));
        aspect = field.clientWidth / field.clientHeight;
        draw();
    }

    function animate(now) {
        if (now - lastTime >= frameDuration) {
            // Cap elapsed time so resuming a background tab never jumps the pattern.
            elapsed += Math.min(now - lastTime, 150);
            lastTime = now;
            draw();
        }
        frame = requestAnimationFrame(animate);
    }

    function syncMotion() {
        cancelAnimationFrame(frame);
        if (!reducedMotion.matches && !document.hidden) {
            lastTime = performance.now();
            frame = requestAnimationFrame(animate);
        }
    }

    reducedMotion.addEventListener('change', syncMotion);
    document.addEventListener('visibilitychange', syncMotion);
    window.addEventListener('resize', resize, { passive: true });
    resize();
    syncMotion();
})();
