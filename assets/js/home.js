import { background, swell } from 'asciify-engine/kit';

const field = document.getElementById('ascii-bg');
const profile = document.querySelector('.profile_inner');

if (field && profile) {
    const scene = background(field, {
        preset: swell,
        mark: 'glyph',
        charset: ' .,:;irsXA253hMHGS#9B&@',
        ink: '--ascii-ink',
        clear: profile,
        cursor: false,
        speed: 0.45,
        cellSize: 11,
    });

    // A page restored from the back-forward cache still owns its field.
    window.addEventListener('pagehide', (event) => {
        if (!event.persisted) scene.destroy();
    });
}
