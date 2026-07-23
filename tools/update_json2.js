const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, 'data', 'instrumen.json');
let data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

data.forEach(inst => {
    if (inst.laras) {
        Object.values(inst.laras).forEach(larasObj => {
            if (larasObj.notes) {
                const count = larasObj.notes.length;
                const width = 1.0 / count;
                const margin = width * 0.3; // Margin besar agar kotak di X mengecil
                
                larasObj.notes.forEach((nada, i) => {
                    // Update hitbox agar berbentuk "persegi kecil" (small square-ish)
                    // Posisikan kotak tepat di tengah (vertikal) dengan tinggi yang sempit
                    nada.hitbox.xMin = parseFloat((i * width + margin).toFixed(3));
                    nada.hitbox.xMax = parseFloat(((i + 1) * width - margin).toFixed(3));
                    nada.hitbox.yMin = 0.45; // Turunkan Y atas
                    nada.hitbox.yMax = 0.55; // Naikkan Y bawah
                });
            }
        });
    }
});

fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));
console.log("Updated hitboxes to small squares successfully!");
