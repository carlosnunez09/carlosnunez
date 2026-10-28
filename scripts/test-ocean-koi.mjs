import assert from 'node:assert/strict';
import { createWorld, spawn, drawWorld, createSpine } from '../node_modules/asciify-engine/dist/kit/chunk-62PNV6TX.js';

const world = createWorld(800, 300, 1, 'turn');
spawn(world, 'fish', 10, 3);
function colorsFor(koi, fish) {
    const colors = [];
    const pen = new Proxy({}, {
        get: () => () => {},
        set: (target, key, value) => {
            if (key === 'fillStyle') colors.push(value);
            target[key] = value;
            return true;
        },
    });
    const scene = fish ? { ...world, bodies: [fish], order: [0] } : world;
    drawWorld(pen, scene, createSpine(), 0.15, [], [5, 8], koi);
    return colors;
}
const colored = colorsFor(true);
const patternColors = ['#c96850', '#535c65', '#d0a557', '#74a8c0', '#d4d1c9',
    '#b98942', '#4d809a', '#92a7aa', '#ad745a', '#588cab'];
for (const color of patternColors) {
    assert.ok(colored.includes(color), `koi scene should include ${color} markings`);
    assert.ok(!colorsFor(false).includes(color), 'regular ocean should not gain koi markings');
}
const signatures = world.bodies.map((fish) => colorsFor(true, fish)
    .filter((color) => patternColors.includes(color)).join(','));
assert.equal(new Set(signatures).size, 10, 'each fish should have a different pattern');
const asagi = colorsFor(true, world.bodies[4]);
assert.ok(asagi.includes('#74a8c0') && asagi.includes('#c96850'), 'Asagi has a blue back and red markings');
const tancho = colorsFor(true, world.bodies[5]);
assert.equal(tancho.filter(color => color === '#c96850').length, 1, 'Tancho has one red marking');
const bekko = colorsFor(true, world.bodies[6]);
assert.ok(bekko.includes('#535c65') && !bekko.includes('#c96850'), 'Bekko has black markings and no red');
console.log('Koi variety and regular-ocean isolation checks passed.');
