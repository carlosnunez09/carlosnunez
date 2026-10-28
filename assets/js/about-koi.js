import { ocean } from 'asciify-engine/kit';

const pond = document.getElementById('about-koi');
const host = document.getElementById('koi-ocean');

if (pond && host) {
    pond.hidden = false;
    const smallScreen = window.matchMedia('(max-width: 600px)');
    const creatures = () => [{ kind: 'fish', size: smallScreen.matches ? 1.4 : 1.05, count: smallScreen.matches ? 8 : 10 }];
    // Each koi has its own markings and starts in view before swimming freely.
    const koi = ocean(host, {
        creatures: creatures(),
        koi: true,
        palette: { fish: '--koi-base' },
        tint: false,
        accents: false,
        speed: 0.7,
        depth: 0.15,
        interactive: false,
        ripples: false,
        edges: 'turn',
        look: {
            mark: 'glyph',
            cellSize: 8,
            glyphScale: 0.9,
            maxPixelRatio: 1.25,
            shuffle: 0,
            hover: 'none',
        },
    });

    const resizeKoi = () => koi.update({ creatures: creatures() });
    smallScreen.addEventListener('change', resizeKoi);
    if (!koi.supported) pond.hidden = true;
    window.addEventListener('pagehide', (event) => {
        if (!event.persisted) {
            smallScreen.removeEventListener('change', resizeKoi);
            koi.destroy();
        }
    });
}
