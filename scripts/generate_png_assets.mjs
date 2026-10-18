import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

/**
 * Minimal pure-Node PNG generator
 * Creates valid PNG files without external native dependencies.
 */
function createPNG(width, height, getPixel) {
  // RGBA 8-bit per channel
  const rowLength = 1 + width * 4; // 1 filter byte (0) + 4 bytes per pixel
  const rawData = Buffer.alloc(height * rowLength);

  let offset = 0;
  for (let y = 0; y < height; y++) {
    rawData[offset++] = 0; // Filter type 0 (None)
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = getPixel(x, y);
      rawData[offset++] = r;
      rawData[offset++] = g;
      rawData[offset++] = b;
      rawData[offset++] = a;
    }
  }

  const deflated = zlib.deflateSync(rawData);

  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR Chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type 6: RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const ihdrChunk = makeChunk('IHDR', ihdr);
  const idatChunk = makeChunk('IDAT', deflated);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function makeChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(12 + len);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);

  const crcTarget = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = crc32(crcTarget);
  chunk.writeUInt32BE(crc, 8 + len);
  return chunk;
}

// Standard CRC32 table
const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[n] = c >>> 0;
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

const outDir = path.resolve(process.cwd(), 'public/assets/images');
fs.mkdirSync(outDir, { recursive: true });

// 1. Bird PNG (34x24 sprite)
const birdPNG = createPNG(34, 24, (x, y) => {
  // Golden bird with white belly, black eye, orange beak
  const dx = x - 16;
  const dy = y - 12;
  const dist = (dx * dx) / 100 + (dy * dy) / 49;
  if (dist > 1.25) return [0, 0, 0, 0]; // Transparent
  if (dist > 1.0) return [32, 16, 4, 255]; // Dark outline
  if (x >= 24 && y >= 10 && y <= 14) return [255, 107, 0, 255]; // Beak
  if (x >= 18 && x <= 22 && y >= 6 && y <= 10) {
    if (x >= 20 && y <= 8) return [255, 255, 255, 255]; // Glint
    return [26, 26, 26, 255]; // Pupil
  }
  if (x < 14 && y > 12) return [255, 255, 255, 255]; // White wing
  return [248, 184, 0, 255]; // Body gold
});
fs.writeFileSync(path.join(outDir, 'bird.png'), birdPNG);

// 2. Pipe PNG (52x480)
const pipePNG = createPNG(52, 480, (x, y) => {
  if (x < 2 || x >= 50) return [39, 84, 17, 255]; // Border
  if (y < 26) {
    // Top collar
    if (y < 3) return [166, 235, 87, 255]; // Rim highlight
    if (x < 8) return [166, 235, 87, 255];
    if (x < 24) return [118, 196, 46, 255];
    if (x < 38) return [90, 169, 34, 255];
    return [47, 95, 18, 255]; // Shadow
  }
  // Body
  if (x < 6) return [166, 235, 87, 255];
  if (x < 22) return [118, 196, 46, 255];
  if (x < 36) return [90, 169, 34, 255];
  return [47, 95, 18, 255];
});
fs.writeFileSync(path.join(outDir, 'pipe.png'), pipePNG);

// 3. Ground PNG (480x96)
const groundPNG = createPNG(480, 96, (x, y) => {
  if (y < 2) return [44, 90, 20, 255]; // Top line
  if (y < 14) return [115, 191, 46, 255]; // Grass
  if (y < 18 && (x % 12 < 6)) return [115, 191, 46, 255]; // Blades
  if (y < 20 && (x % 12 >= 6)) return [44, 90, 20, 255]; // Dark separator
  if ((x + y * 7) % 37 === 0) return [166, 158, 89, 255]; // Pebble
  return [222, 216, 149, 255]; // Dirt base
});
fs.writeFileSync(path.join(outDir, 'ground.png'), groundPNG);

// 4. Background PNG (480x640)
const bgPNG = createPNG(480, 640, (x, y) => {
  if (y > 544) return [79, 169, 151, 255]; // Horizon bushes
  if (y > 480 && (x % 24 < 16)) return [90, 199, 190, 255]; // Skyline silhouette
  // Sky gradient
  const ratio = y / 544;
  const r = Math.floor(78 + (211 - 78) * ratio);
  const g = Math.floor(192 + (244 - 192) * ratio);
  const b = Math.floor(202 + (247 - 202) * ratio);
  return [r, g, b, 255];
});
fs.writeFileSync(path.join(outDir, 'background.png'), bgPNG);

// 5. Title Logo PNG (280x70)
const titlePNG = createPNG(280, 70, (x, y) => {
  // Transparent background with retro badge
  if (x < 10 || x > 270 || y < 10 || y > 60) return [0, 0, 0, 0];
  if (x === 10 || x === 270 || y === 10 || y === 60) return [32, 16, 4, 255];
  return [248, 184, 0, 255]; // Gold
});
fs.writeFileSync(path.join(outDir, 'title-logo.png'), titlePNG);

console.log('Successfully created PNG assets in', outDir);
