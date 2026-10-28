import assert from 'node:assert/strict';
import { createWorld, spawn, stepWorld } from '../node_modules/asciify-engine/dist/kit/chunk-62PNV6TX.js';

function worldWithNeighbor(distance) {
    const world = createWorld(800, 600, 4, 'turn');
    spawn(world, 'fish', 2, 1);
    const [fish, neighbor] = world.bodies;
    Object.assign(fish, { x: 400, y: 300, heading: 0, seed: 0, z: 0 });
    Object.assign(neighbor, { x: 400, y: 300 + distance, heading: 0, seed: 0, z: 0 });
    return world;
}

const nearby = worldWithNeighbor(10);
const distant = worldWithNeighbor(300);
for (let frame = 0; frame < 30; frame++) {
    const settings = { speed: 1, depth: 0, interactive: false };
    stepWorld(nearby, 1 / 60, settings);
    stepWorld(distant, 1 / 60, settings);
}
assert.ok(nearby.bodies[0].heading < distant.bodies[0].heading - 0.05,
    'a nearby fish below should gently turn the fish away');
console.log('Ocean spacing steering check passed.');
