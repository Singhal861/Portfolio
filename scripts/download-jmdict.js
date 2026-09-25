const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');

async function main() {
  const latestRes = await fetch('https://api.github.com/repos/scriptin/jmdict-simplified/releases/latest');
  const latestJson = await latestRes.json();
  const asset = latestJson.assets.find(a => a.name.includes('jmdict-eng-common') && a.name.endsWith('.zip'));
  
  if (!asset) {
    console.error('Could not find JMdict common zip');
    return;
  }

  console.log(`Downloading ${asset.browser_download_url}...`);
  const zipRes = await fetch(asset.browser_download_url);
  const zipBuffer = await zipRes.arrayBuffer();
  
  console.log('Extracting...');
  const zip = new AdmZip(Buffer.from(zipBuffer));
  const zipEntries = zip.getEntries();
  const jsonEntry = zipEntries.find(e => e.entryName.endsWith('.json'));
  
  const rawJson = jsonEntry.getData().toString('utf8');
  console.log('Parsing JSON...');
  const dict = JSON.parse(rawJson);
  
  const verbList = [];

  for (const word of dict.words) {
    let isVerb = false;
    const meanings = [];
    const types = new Set();

    for (const sense of word.sense) {
      const pos = sense.partOfSpeech;
      const verbPos = pos.filter(p => p.startsWith('v'));
      if (verbPos.length > 0) {
        isVerb = true;
        verbPos.forEach(p => types.add(p));
        for (const gloss of sense.gloss) {
          if (gloss.type === 'literal' || !gloss.type) {
            meanings.push(gloss.text);
          }
        }
      }
    }

    if (isVerb) {
      const kanji = word.kanji.map(k => k.text);
      const kana = word.kana.map(k => k.text);
      
      verbList.push({
        kanji: kanji.length > 0 ? kanji : kana,
        kana: kana,
        types: Array.from(types),
        meanings: meanings
      });
    }
  }

  const outPath = path.join(__dirname, '../public/jmdict-verbs.json');
  fs.writeFileSync(outPath, JSON.stringify(verbList));
  console.log(`Wrote ${verbList.length} verbs to ${outPath}`);
}

main().catch(console.error);
