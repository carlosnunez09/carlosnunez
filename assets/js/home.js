// The install step adds gentle spacing to Asciify's ocean simulation.
import { ocean } from 'asciify-engine/kit';

const oceanHost = document.getElementById('ascii-ocean');

if (oceanHost) {
    const sea = ocean(oceanHost, {
        creatures: [
            { kind: 'shark', size: 0.64 },
            { kind: 'shark', size: 0.5 },
            { kind: 'shark', size: 0.39 },
            { kind: 'hammerhead', size: 0.61 },
            { kind: 'manta', size: 0.64 },
            { kind: 'manta', size: 0.43 },
            { kind: 'jellyfish', size: 0.57, count: 2 },
            { kind: 'fish', size: 0.79, count: 4 },
            { kind: 'fish', size: 0.54, count: 5 },
            { kind: 'school', size: 0.71, count: 22 },
            { kind: 'school', size: 0.71, count: 16 },
        ],
        ink: '--secondary',
        tint: false,
        accents: false,
        speed: 0.75,
        depth: 0.3,
        interactive: false,
        ripples: false,
        edges: 'turn',
        look: {
            cellSize: 12,
            maxPixelRatio: 1.25,
            shuffle: 0,
            hover: 'none',
            clear: false,
        },
    });

    window.addEventListener('pagehide', (event) => {
        if (!event.persisted) sea.destroy();
    });
}
