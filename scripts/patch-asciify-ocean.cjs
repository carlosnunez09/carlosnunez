// Extend the pinned Asciify ocean with gentle spacing and optional koi markings.
const fs = require('node:fs');
const path = require('node:path');

const root = path.dirname(path.dirname(require.resolve('asciify-engine/kit')));
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
if (pkg.version !== '4.32.8') {
    throw new Error(`The ocean separation patch requires asciify-engine 4.32.8; found ${pkg.version}.`);
}
const file = path.join(root, 'dist/kit/chunk-62PNV6TX.js');
let source = fs.readFileSync(file, 'utf8');
const marker = '/* local-ocean-separation-v1 */';
if (!source.includes(marker)) {
const step = 'function z(e,n,o){const{bodies:a,pointer:r,burst:i}=e';
const steer = 'if(p.prey){if(u){';
if (source.split(step).length !== 2 || source.split(steer).length !== 2) {
    throw new Error('The Asciify ocean code changed; review the separation patch before building.');
}
const separation = `${marker}
function localOceanSeparation(world, body, depth) {
    const bodyLength = k(world, body, depth);
    const center = (fish, length) => {
        const offset = fish.kind === 'manta' || fish.kind === 'jellyfish' ? 0 : length * 0.4;
        return [fish.x - Math.cos(fish.heading) * offset, fish.y - Math.sin(fish.heading) * offset];
    };
    const [x, y] = center(body, bodyLength);
    let dx = 0, dy = 0;
    for (const other of world.bodies) {
        if (other === body || (body.group >= 0 && body.group === other.group)) continue;
        const otherLength = k(world, other, depth);
        const [ox, oy] = center(other, otherLength);
        const xDiff = x - ox, yDiff = y - oy;
        const distance = Math.hypot(xDiff, yDiff);
        const radius = Math.min((bodyLength + otherLength) * 0.32, Math.min(world.w, world.h) * 0.14);
        if (distance < 0.001 || distance >= radius) continue;
        const strength = (1 - distance / radius) ** 2;
        dx += xDiff / distance * strength;
        dy += yDiff / distance * strength;
    }
    const total = Math.hypot(dx, dy);
    const scale = total > 0.8 ? 0.8 / total : 1;
    return [dx * scale, dy * scale];
}
`;
source = source.replace(step, separation + step);
source = source.replace(steer, 'const[avoidX,avoidY]=localOceanSeparation(e,y,d);v+=avoidX,b+=avoidY;' + steer);
}

// Patterns are drawn onto the existing animated fish body before Asciify
// converts the scene to colored characters. Other oceans are unchanged.
const koiMarker = '/* local-ocean-koi-v4 */';
const koiDrawing = `${koiMarker}
function localDrawKoi(pen, spine, fish, length) {
    const variety = (fish.id - 1) % 10;
    const red = '#c96850';
    const black = '#535c65';
    const gold = '#d0a557';
    const blue = '#74a8c0';
    pen.save();
    // Clip markings to the animated body so they follow the tail beat.
    pen.beginPath();
    for (let i = 1; i <= 14; i++) {
        const width = d('fish', i / 16) * length * 0.8;
        const x = spine.x[i] + spine.nx[i] * width;
        const y = spine.y[i] + spine.ny[i] * width;
        if (i === 1) pen.moveTo(x, y); else pen.lineTo(x, y);
    }
    for (let i = 14; i >= 1; i--) {
        const width = d('fish', i / 16) * length * 0.8;
        pen.lineTo(spine.x[i] - spine.nx[i] * width, spine.y[i] - spine.ny[i] * width);
    }
    pen.closePath();
    pen.clip();
    const spot = (index, color, along, across, offset = 0) => {
        pen.fillStyle = color;
        pen.beginPath();
        pen.ellipse(spine.x[index] + spine.nx[index] * length * offset,
            spine.y[index] + spine.ny[index] * length * offset,
            length * along, length * across, fish.heading, 0, Math.PI * 2);
        pen.fill();
    };
    const spots = (indices, color, along = 0.075, across = 0.065) => {
        for (const index of indices) spot(index, color, along, across);
    };
    const body = (color) => { pen.fillStyle = color; pen.fill(); };
    const flanks = (indices, color) => {
        for (const index of indices) {
            spot(index, color, 0.07, 0.045, 0.07);
            spot(index, color, 0.07, 0.045, -0.07);
        }
    };

    // Ten fish, ten silhouettes of markings; all follow the moving spine.
    switch (variety) {
        case 0: // Kohaku: three red islands on white.
            spots([2, 6, 11], red, 0.085, 0.075);
            break;
        case 1: // Sanke: two red islands with small black accents.
            spots([3, 9], red, 0.09, 0.075);
            spots([5, 12], black, 0.045, 0.045);
            break;
        case 2: // Showa: a dark body with white and red patches.
            body(black);
            spots([3, 10], '#d4d1c9', 0.09, 0.075);
            spots([5, 12], red, 0.075, 0.07);
            break;
        case 3: // Yamabuki Ogon: a gold body with subtle scales.
            body(gold);
            spots([3, 5, 7, 9, 11], '#b98942', 0.025, 0.045);
            break;
        case 4: // Asagi: blue scales and warm flanks.
            body(blue);
            spots([3, 5, 7, 9, 11], '#4d809a', 0.035, 0.045);
            flanks([4, 8, 11], red);
            break;
        case 5: // Tancho: one red circle on the head.
            spot(2, red, 0.07, 0.065);
            break;
        case 6: // Shiro Bekko: black islands on a pale body.
            spots([3, 6, 10, 13], black, 0.07, 0.065);
            break;
        case 7: // Ki Utsuri: broad black bands on gold.
            body(gold);
            spots([3, 7, 11], black, 0.07, 0.09);
            break;
        case 8: // Ochiba: copper leaf shapes over a blue-grey body.
            body('#92a7aa');
            spots([3, 8, 12], '#ad745a', 0.1, 0.065);
            break;
        case 9: // Shusui: a blue dorsal stripe and red flanks on white.
            spots([3, 6, 9, 12], '#588cab', 0.075, 0.04);
            flanks([5, 10], red);
            break;
    }
    pen.restore();
}
function localArrangeKoi(world) {
    // Begin with the fish in view, while retaining the larger free-swimming world.
    const lanes = [
        [0.22, 0.30], [0.79, 0.33], [0.19, 0.43], [0.80, 0.47], [0.23, 0.57],
        [0.78, 0.62], [0.20, 0.69], [0.81, 0.73], [0.22, 0.78], [0.79, 0.23],
    ];
    for (const fish of world.bodies) {
        if (fish.kind !== 'fish') continue;
        const [x, y] = lanes[(fish.id - 1) % lanes.length];
        fish.x = world.w * x;
        fish.y = world.h * y;
        fish.heading = (x < 0.5 ? 0 : Math.PI) + ((fish.id % 3) - 1) * 0.3;
    }
}
`;
if (!source.includes(koiMarker)) {
    const oldMarker = ['/* local-ocean-koi-v3 */', '/* local-ocean-koi-v2 */', '/* local-ocean-koi-v1 */']
        .find((candidate) => source.includes(candidate));
    if (oldMarker) {
        const start = source.indexOf(oldMarker);
        const end = source.indexOf('function D(', start);
        if (end < 0) throw new Error('The installed koi patch could not be located.');
        source = source.slice(0, start) + koiDrawing + source.slice(end);
    } else {
        const drawDefinition = 'function D(e,n,o,a,r=[],i=[0,0]){';
        const drawFish = 'J(s,o,r,u,f):';
        const drawFrame = 'D(e,k,x,t(u().depth),m,M)';
        for (const needle of [drawDefinition, drawFish, drawFrame]) {
            if (source.split(needle).length !== 2) {
                throw new Error('The Asciify ocean code changed; review the koi patch before building.');
            }
        }
        source = source.replace(drawDefinition, koiDrawing + 'function D(e,n,o,a,r=[],i=[0,0],koi=false){');
        source = source.replace(drawFish, '(J(s,o,r,u,f),koi&&r.kind===\"fish\"&&localDrawKoi(s.pen,o,r,u)):');
        source = source.replace(drawFrame, 'D(e,k,x,t(u().depth),m,M,u().koi)');
    }
}
const arrangementMarker = '/* local-ocean-koi-arrangement-v1 */';
if (!source.includes(arrangementMarker)) {
    const warmup = 'for(let t=0;t<1.5;t+=p)z(k,p,o);b=!0';
    if (source.split(warmup).length !== 2) {
        throw new Error('The Asciify ocean startup changed; review the koi arrangement before building.');
    }
    source = source.replace(warmup, arrangementMarker + 'u().koi&&localArrangeKoi(k);' + warmup);
}
const toneMarker = '/* local-ocean-koi-tones-v1 */';
if (!source.includes(toneMarker)) {
    const original = 'const[n,a,r]=q(s(o),e/63)';
    if (source.split(original).length !== 2) {
        throw new Error('The Asciify ocean palette changed; review the koi patch before building.');
    }
    // Keep the pale body visible on both grounds; the standard palette ramps to white.
    source = source.replace(original,
        'const[n,a,r]=' + toneMarker + 'u().koi?s(o).map(t=>t*(.5+.5*e/63)):q(s(o),e/63)');
}
fs.writeFileSync(file, source);
