const sharp = require('sharp');
const path = require('path');
(async () => {
  try {
    const src = path.join(process.cwd(), 'public', 'fiche-don', 'logo-ong-gas.jpg');
    const out = path.join(process.cwd(), 'public');
    await sharp(src).resize(180, 180, { fit: 'cover' }).png().toFile(path.join(out, 'apple-touch-icon.png'));
    await sharp(src).resize(32, 32, { fit: 'cover' }).png().toFile(path.join(out, 'favicon-32.png'));
    await sharp(src).resize(16, 16, { fit: 'cover' }).png().toFile(path.join(out, 'favicon-16.png'));
    await sharp(src).resize(96, 96, { fit: 'cover' }).png().toFile(path.join(out, 'favicon-96.png'));
    console.log('Favicons generated');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
