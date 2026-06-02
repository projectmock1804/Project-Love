const fs = require('fs');
const path = require('path');
const https = require('https');

const dir = path.join(__dirname, '../public/images/celebrities');

function downloadImage(url, filename) {
  return new Promise((resolve) => {
    const filepath = path.join(dir, filename);
    const file = fs.createWriteStream(filepath);

    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`✓ ${filename}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filepath, () => {});
      console.log(`✗ ${filename}`);
      resolve();
    });
  });
}

async function downloadMore() {
  console.log('Adding 16 more female images...\n');

  // Female 17-32
  for (let i = 17; i <= 32; i++) {
    const seed = `woman_${i}_portrait`;
    const url = `https://picsum.photos/seed/${seed}/500/500`;
    await downloadImage(url, `female_${i}.jpg`);
    await new Promise(resolve => setTimeout(resolve, 150));
  }

  console.log('\nAdding 16 more male images...\n');

  // Male 17-32
  for (let i = 17; i <= 32; i++) {
    const seed = `man_${i}_portrait`;
    const url = `https://picsum.photos/seed/${seed}/500/500`;
    await downloadImage(url, `male_${i}.jpg`);
    await new Promise(resolve => setTimeout(resolve, 150));
  }

  const files = fs.readdirSync(dir);
  console.log(`\nDone! Total: ${files.length} images`);
}

downloadMore().catch(console.error);
