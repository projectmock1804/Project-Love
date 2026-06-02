const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const dir = path.join(__dirname, '../public/images/celebrities');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

function downloadImage(url, filepath, redirectCount = 0) {
  return new Promise((resolve) => {
    if (redirectCount > 5) { console.log(`  Redirect limit: ${filepath}`); return resolve(false); }

    const client = url.startsWith('https') ? https : http;
    client.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return resolve(downloadImage(res.headers.location, filepath, redirectCount + 1));
      }
      if (res.statusCode !== 200) {
        console.log(`  HTTP ${res.statusCode}: ${path.basename(filepath)}`);
        return resolve(false);
      }
      const file = fs.createWriteStream(filepath);
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(true); });
      file.on('error', () => resolve(false));
    }).on('error', () => resolve(false));
  });
}

async function downloadAll() {
  console.log('Downloading real face images from randomuser.me...\n');
  let ok = 0;

  // Female: randomuser.me portraits/women/1-16
  for (let i = 1; i <= 16; i++) {
    const url = `https://randomuser.me/api/portraits/women/${i}.jpg`;
    const fp = path.join(dir, `female_${i}.jpg`);
    const success = await downloadImage(url, fp);
    if (success) { ok++; console.log(`✓ female_${i}.jpg`); }
    else console.log(`✗ female_${i}.jpg`);
    await new Promise(r => setTimeout(r, 150));
  }

  // Male: randomuser.me portraits/men/1-16
  for (let i = 1; i <= 16; i++) {
    const url = `https://randomuser.me/api/portraits/men/${i}.jpg`;
    const fp = path.join(dir, `male_${i}.jpg`);
    const success = await downloadImage(url, fp);
    if (success) { ok++; console.log(`✓ male_${i}.jpg`); }
    else console.log(`✗ male_${i}.jpg`);
    await new Promise(r => setTimeout(r, 150));
  }

  console.log(`\nDone: ${ok}/32 images`);
  console.log(`Location: ${dir}`);

  // Show sizes
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.jpg'));
  let allGood = true;
  files.forEach(f => {
    const size = fs.statSync(path.join(dir, f)).size;
    if (size < 1000) { console.log(`  WARNING 0KB: ${f}`); allGood = false; }
  });
  if (allGood) console.log('All images have content!');
}

downloadAll().catch(console.error);
