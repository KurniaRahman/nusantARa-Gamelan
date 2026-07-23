const fs = require('fs');
const path = require('path');

const audioDir = path.join(__dirname, 'aset', 'audio');
const jsonPath = path.join(__dirname, 'data', 'instrumen.json');

let data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

// Helper function to extract note value for sorting
function getNoteValue(filename) {
    let match = filename.match(/([.\d+-]+)\.WAV$/i);
    if (!match) return 999;
    let str = match[1];
    
    // Custom sort values
    if (str === '-') return -1;
    if (str === '+') return 100;
    
    let val = 0;
    if (str.startsWith('..')) {
        val = parseFloat(str.substring(2)) - 20;
    } else if (str.startsWith('.')) {
        val = parseFloat(str.substring(1)) - 10;
    } else if (str.endsWith('.')) {
        val = parseFloat(str.substring(0, str.length - 1)) + 10;
    } else {
        val = parseFloat(str);
    }
    return isNaN(val) ? 999 : val;
}

data.forEach(inst => {
    // Map instrument ID to audio folder name
    let folderName = inst.nama.toLowerCase();
    if (inst.id === 'gong') folderName = 'gong';
    else if (inst.id === 'kendang') folderName = 'kendang';
    else if (inst.id === 'kenong') folderName = 'kenong';
    else if (inst.id === 'bonang-barung') folderName = 'bonang barung';
    else if (inst.id === 'bonang-penerus') folderName = 'bonang penerus';
    else if (inst.id === 'saron-barung') folderName = 'saron barung';
    else if (inst.id === 'saron-panembung') folderName = 'saron panembung';
    else if (inst.id === 'saron-penerus') folderName = 'saron penerus';
    
    const instDir = path.join(audioDir, folderName);
    if (!fs.existsSync(instDir)) {
        console.log(`Directory missing for ${inst.id}: ${instDir}`);
        return;
    }
    
    let files = fs.readdirSync(instDir).filter(f => f.toLowerCase().endsWith('.wav'));
    
    // Function to process a specific laras
    const processLaras = (larasName) => {
        if (!inst.laras || !inst.laras[larasName]) return;
        
        let larasFiles = files.filter(f => f.toLowerCase().includes(larasName) || folderName === 'gong' || folderName === 'kendang');
        
        // For gong and kendang, logic is slightly different since they might not have explicit pelog/slendro in all filenames
        if (folderName === 'gong') {
             larasFiles = files.filter(f => larasName === 'slendro' ? (f.toLowerCase().includes('slendro') || !f.toLowerCase().includes('pelog')) : (!f.toLowerCase().includes('slendro')));
        }
        
        larasFiles.sort((a, b) => getNoteValue(a) - getNoteValue(b));
        
        // Remove duplicates if any
        larasFiles = [...new Set(larasFiles)];
        
        // Generate hitboxes evenly
        const notes = [];
        const count = larasFiles.length;
        larasFiles.forEach((f, i) => {
            const width = 1.0 / count;
            const margin = width * 0.1;
            notes.push({
                id: f.replace('.WAV', '').replace('.wav', ''),
                file: f,
                hitbox: {
                    xMin: parseFloat((i * width + margin).toFixed(3)),
                    xMax: parseFloat(((i + 1) * width - margin).toFixed(3)),
                    yMin: 0.3,
                    yMax: 0.7
                }
            });
        });
        
        inst.laras[larasName].audioPath = `./aset/audio/${folderName}/`;
        inst.laras[larasName].notes = notes;
    };
    
    processLaras('slendro');
    processLaras('pelog');
});

fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));
console.log("Updated instrumen.json successfully!");

