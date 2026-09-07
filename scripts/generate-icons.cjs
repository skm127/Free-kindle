const fs = require('fs');
const path = require('path');

// Simple function to create a basic PNG file
function createPngIcon(size, color) {
  // Create a simple PNG with a solid color
  const width = size;
  const height = size;
  
  // PNG header
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  
  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8); // bit depth
  ihdr.writeUInt8(2, 9); // color type (RGB)
  ihdr.writeUInt8(0, 10); // compression
  ihdr.writeUInt8(0, 11); // filter
  ihdr.writeUInt8(0, 12); // interlace
  
  const ihdrChunk = createChunk('IHDR', ihdr);
  
  // IDAT chunk with solid color data
  const pixelData = Buffer.alloc(width * height * 3);
  const rgb = hexToRgb(color);
  for (let i = 0; i < pixelData.length; i += 3) {
    pixelData[i] = rgb.r;
    pixelData[i + 1] = rgb.g;
    pixelData[i + 2] = rgb.b;
  }
  
  // Simple compression (no actual compression for simplicity)
  const idatChunk = createChunk('IDAT', pixelData);
  
  // IEND chunk
  const iendChunk = createChunk('IEND', Buffer.alloc(0));
  
  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  
  const typeBuffer = Buffer.from(type);
  const crc = calculateCrc(Buffer.concat([typeBuffer, data]));
  const crcBuffer = Buffer.alloc(4);
  crcBuffer.writeUInt32BE(crc, 0);
  
  return Buffer.concat([length, typeBuffer, data, crcBuffer]);
}

function calculateCrc(data) {
  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i++) {
    crc ^= data[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
}

// Generate icons
const publicDir = path.join(__dirname, '..', 'public');

try {
  const icon192 = createPngIcon(192, '#e6c898');
  fs.writeFileSync(path.join(publicDir, 'icon-192.png'), icon192);
  console.log('Created icon-192.png');

  const icon512 = createPngIcon(512, '#e6c898');
  fs.writeFileSync(path.join(publicDir, 'icon-512.png'), icon512);
  console.log('Created icon-512.png');
  
  console.log('Icons generated successfully!');
} catch (error) {
  console.error('Error generating icons:', error);
  console.log('Please use an online SVG to PNG converter instead.');
}