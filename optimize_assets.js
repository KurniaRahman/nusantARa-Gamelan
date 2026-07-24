const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
    });
}

// 1. Convert WAV to MP3
console.log("Converting WAV to MP3...");
walkDir('aset/audio', (filePath) => {
    if (filePath.endsWith('.WAV') || filePath.endsWith('.wav')) {
        const outPath = filePath.replace(/\.WAV$/i, '.mp3').replace(/\.wav$/i, '.mp3');
        console.log(`Converting ${filePath} -> ${outPath}`);
        try {
            execSync(`ffmpeg -y -i "${filePath}" -b:a 128k "${outPath}" -loglevel error`);
            fs.unlinkSync(filePath);
        } catch (e) {
            console.error(`Failed to convert ${filePath}`, e.message);
        }
    }
});

// 2. Convert PNG to WEBP (Only in gambar, ignore marker)
console.log("Converting PNG to WEBP...");
walkDir('aset/gambar', (filePath) => {
    if (filePath.endsWith('.png')) {
        const outPath = filePath.replace(/\.png$/i, '.webp');
        console.log(`Converting ${filePath} -> ${outPath}`);
        try {
            execSync(`ffmpeg -y -i "${filePath}" -c:v libwebp -lossless 0 -q:v 75 "${outPath}" -loglevel error`);
            fs.unlinkSync(filePath);
        } catch (e) {
            console.error(`Failed to convert ${filePath}`, e.message);
        }
    }
});

// 3. Replace text in files
console.log("Updating references in code...");
const filesToUpdate = [
    'data/instrumen.json',
    'index.html',
    'style.css',
    'js/app.js',
    'js/sejarahGamelan.js'
];

filesToUpdate.forEach(file => {
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');
        // Replace .WAV with .mp3
        content = content.replace(/\.WAV/g, '.mp3');
        content = content.replace(/\.wav/g, '.mp3');
        // Replace .png with .webp 
        content = content.replace(/\.png/g, '.webp');
        fs.writeFileSync(file, content);
        console.log(`Updated ${file}`);
    }
});

console.log("Optimization complete!");
