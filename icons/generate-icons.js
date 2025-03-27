const sharp = require('sharp');
const fs = require('fs');

async function generateIcons() {
    const sizes = [192, 512];
    const svgBuffer = fs.readFileSync('icon.svg');
    
    for (const size of sizes) {
        await sharp(svgBuffer)
            .resize(size, size)
            .png()
            .toFile(`icon-${size}.png`);
        console.log(`Generated ${size}x${size} icon`);
    }
}

generateIcons().catch(console.error);
