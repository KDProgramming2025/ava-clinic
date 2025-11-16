import 'dotenv/config';
import prisma from '../prismaClient.js';

function isAscii(str) {
  return /^[\x00-\x7F]*$/.test(str || '');
}

function isUntranslated(data) {
  if (!data || typeof data !== 'object') return false;
  const en = String(data.en || '').trim();
  const fa = String(data.fa || '').trim();
  if (!en) return false; // nothing to compare with
  if (!fa) return true; // missing
  if (fa === en) return true; // identical
  if (isAscii(fa)) return true; // likely English
  return false;
}

async function main() {
  const items = await prisma.translation.findMany();
  const bad = [];
  for (const t of items) {
    if (isUntranslated(t.data)) bad.push({ key: t.key, data: t.data });
  }
  console.log(`Total translations: ${items.length}`);
  console.log(`Untranslated (fa missing/ASCII/identical): ${bad.length}`);
  if (bad.length) {
    // print sample of first 20 keys
    for (const b of bad.slice(0, 20)) {
      console.log(` - ${b.key} => en: ${String(b.data?.en || '')} | fa: ${String(b.data?.fa || '')}`);
    }
  }
}

main().then(() => process.exit(0)).catch(err => { console.error(err); process.exit(1); });
