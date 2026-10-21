import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

import { execSync } from 'child_process';

const RAW_DIR = '/tmp/runor_extracted_plates';
const OUT_DIR = path.resolve('public/images/runor');
const MANIFEST_PATH = path.resolve('docs/runor/bildmanifest-e16.json');
const PILOT_JSON_PATH = path.resolve('docs/runor/pilot-20-inskrifter.json');
const PILOT_TS_PATH = path.resolve('lib/runor/pilot-data.ts');

const IMAGE_SPECS = [
  {
    canonicalSignum: 'Öl 1',
    canonicalSlug: 'ol-1',
    isDepicted: true,
    sourceVolume: 'sri_oland_b01_h01.pdf',
    sourceVolumeTitle: 'Ölands runinskrifter (SRI band 1, 1900–1906)',
    sourcePage: 21,
    sourcePlateOrFigure: 'Plansch I',
    photographerOrArtist: 'Sven Söderberg',
    year: 1900,
    license: 'Public Domain',
    isPubliclyDistributable: true,
    isEditorialDrawing: false,
    caption: 'Karlevistenen (Öl 1), runristad framsida med skaldestrof på dróttkvætt',
    altText: 'Fotografisk plansch av Karlevistenen sedd framifrån med tydliga runrader i vertikala band.'
  },
  {
    canonicalSignum: 'Öl 2',
    canonicalSlug: 'ol-2',
    isDepicted: true,
    sourceVolume: 'sri_oland_b01_h01.pdf',
    sourceVolumeTitle: 'Ölands runinskrifter (SRI band 1, 1900–1906)',
    sourcePage: 44,
    sourcePlateOrFigure: 'Plansch för Algutsrums kyrka',
    photographerOrArtist: 'Sven Söderberg',
    year: 1900,
    license: 'Public Domain',
    isPubliclyDistributable: true,
    isEditorialDrawing: false,
    caption: 'Runstensfragment Öl 2, inmurat i kyrkvägg, ur Ölands runinskrifter',
    altText: 'Fotografi av det bevarade runstensfragmentet Öl 2 med delar av runslinga och ornamentik.'
  },
  {
    canonicalSignum: 'Öl 9',
    canonicalSlug: 'ol-9',
    isDepicted: true,
    sourceVolume: 'sri_oland_b01_h01.pdf',
    sourceVolumeTitle: 'Ölands runinskrifter (SRI band 1, 1900–1906)',
    sourcePage: 63,
    sourcePlateOrFigure: 'Plansch för Kastlösa kyrka',
    photographerOrArtist: 'Sven Söderberg',
    year: 1900,
    license: 'Public Domain',
    isPubliclyDistributable: true,
    isEditorialDrawing: false,
    caption: 'Kastlösa kyrka (Öl 9), runstensfragment med slingor ur Ölands runinskrifter',
    altText: 'Detaljplansch av fragmentariskt bevarade runstenen Öl 9 från Kastlösa kyrka.'
  },
  {
    canonicalSignum: 'Öl 15',
    canonicalSlug: 'ol-15',
    isDepicted: false,
    sourceVolume: 'sri_oland_b01_h01.pdf',
    sourceVolumeTitle: 'Ölands runinskrifter (SRI band 1, 1900–1906)',
    sourcePage: 74,
    sourcePlateOrFigure: 'Ej avbildad',
    photographerOrArtist: 'Ej avbildad',
    year: null,
    license: 'Public Domain',
    isPubliclyDistributable: true,
    isEditorialDrawing: false,
    caption: 'Öl 15 är förlorad och har ingen bevarad samtida avbildning i källorna.',
    altText: 'Ingen bild tillgänglig. Inskriften är förlorad och saknar avbildning i Sveriges runinskrifter.'
  },
  {
    canonicalSignum: 'Öl 16',
    canonicalSlug: 'ol-16',
    isDepicted: true,
    sourceVolume: 'sri_oland_b01_h01.pdf',
    sourceVolumeTitle: 'Ölands runinskrifter (SRI band 1, 1900–1906)',
    sourcePage: 77,
    sourcePlateOrFigure: 'Träsnitt ur Bautil s. 63 (nr 1070)',
    photographerOrArtist: 'Johan Peringskiöld',
    year: 1750,
    license: 'Public Domain',
    isPubliclyDistributable: true,
    isEditorialDrawing: true,
    caption: 'Gräsgårds kyrkogård (Öl 16), träsnitt ur Johan Peringskiölds Bautil (1750)',
    altText: 'Historiskt träsnitt av den numera förlorade runstenen Öl 16 med ormslingor och kors ur Bautil.'
  },
  {
    canonicalSignum: 'Öl 18',
    canonicalSlug: 'ol-18',
    isDepicted: true,
    sourceVolume: 'sri_oland_b01_h01.pdf',
    sourceVolumeTitle: 'Ölands runinskrifter (SRI band 1, 1900–1906)',
    sourcePage: 78,
    sourcePlateOrFigure: 'Plansch för Seby',
    photographerOrArtist: 'Sven Söderberg',
    year: 1900,
    license: 'Public Domain',
    isPubliclyDistributable: true,
    isEditorialDrawing: false,
    caption: 'Sebystenen (Öl 18), stående runsten på Ölands alvar ur Ölands runinskrifter',
    altText: 'Fotografisk plansch av den resta runstenen Öl 18 i öppet landskap vid Seby.'
  },
  {
    canonicalSignum: 'Öl 23',
    canonicalSlug: 'ol-23',
    isDepicted: true,
    sourceVolume: 'sri_oland_b01_h01.pdf',
    sourceVolumeTitle: 'Ölands runinskrifter (SRI band 1, 1900–1906)',
    sourcePage: 94,
    sourcePlateOrFigure: 'Plansch för Stenåsa',
    photographerOrArtist: 'Sven Söderberg',
    year: 1900,
    license: 'Public Domain',
    isPubliclyDistributable: true,
    isEditorialDrawing: false,
    caption: 'Stenåsa kyrkogård (Öl 23), ornerad gravhäll med runslingor och kors',
    altText: 'Fotografi av den liggande gravhällen Öl 23 med rundrake och korsornamentik från Stenåsa kyrkogård.'
  },
  {
    canonicalSignum: 'Öl 25',
    canonicalSlug: 'ol-25',
    isDepicted: true,
    sourceVolume: 'sri_oland_b01_h01.pdf',
    sourceVolumeTitle: 'Ölands runinskrifter (SRI band 1, 1900–1906)',
    sourcePage: 99,
    sourcePlateOrFigure: 'Plansch för Dröstorp',
    photographerOrArtist: 'Sven Söderberg',
    year: 1900,
    license: 'Public Domain',
    isPubliclyDistributable: true,
    isEditorialDrawing: false,
    caption: 'Dröstorps häll (Öl 25), ristning på flat berghäll ur Ölands runinskrifter',
    altText: 'Fotografi av berghällen vid Dröstorp på Stora Alvaret med synlig runslinga.'
  },
  {
    canonicalSignum: 'Ög 136',
    canonicalSlug: 'og-136',
    isDepicted: true,
    sourceVolume: 'sri_ostergotland_b02_h03_plansch.pdf',
    sourceVolumeTitle: 'Östergötlands runinskrifter (SRI band 2, 1911–1918)',
    sourcePage: 24,
    sourcePlateOrFigure: 'Pl. XXXIII',
    photographerOrArtist: 'Erik Brate / C.F. Lindberg',
    year: 1911,
    license: 'Public Domain',
    isPubliclyDistributable: true,
    isEditorialDrawing: false,
    caption: 'Rökstenen (Ög 136), framsidan och kantsida ur Östergötlands runinskrifter',
    altText: 'Fotografisk plansch av Rökstenens framsida tätt täckt av kortkvistrunor och chifferrunor.'
  },
  {
    canonicalSignum: 'Ög 181',
    canonicalSlug: 'og-181',
    isDepicted: true,
    sourceVolume: 'sri_ostergotland_b02_h02_plansch.pdf',
    sourceVolumeTitle: 'Östergötlands runinskrifter (SRI band 2, 1911–1918)',
    sourcePage: 29,
    sourcePlateOrFigure: 'Pl. XLIV',
    photographerOrArtist: 'Erik Brate',
    year: 1911,
    license: 'Public Domain',
    isPubliclyDistributable: true,
    isEditorialDrawing: false,
    caption: 'Ledbergsstenen (Ög 181), bildstensristning med Fenrisulven ur Östergötlands runinskrifter',
    altText: 'Fotografi av Ledbergsstenens figursida visande en hjälmprydd krigare och vargliknande odjur.'
  },
  {
    canonicalSignum: 'U 11',
    canonicalSlug: 'u-11',
    isDepicted: true,
    sourceVolume: 'sri_uppland_b06_plansch_1.pdf',
    sourceVolumeTitle: 'Upplands runinskrifter del 1 (SRI band 6, 1940–1943)',
    sourcePage: 4,
    sourcePlateOrFigure: 'Pl. 4',
    photographerOrArtist: 'Sven B.F. Jansson / Harald Faith-Ell',
    year: 1940,
    license: 'Public Domain',
    isPubliclyDistributable: true,
    isEditorialDrawing: false,
    caption: 'Hovgårdsstenen (U 11), kunglig runristning vid Mälaren ur Upplands runinskrifter',
    altText: 'Fotografi av det stora runblocket U 11 vid Alsnö hus på Hovgården.'
  },
  {
    canonicalSignum: 'U 29',
    canonicalSlug: 'u-29',
    isDepicted: true,
    sourceVolume: 'sri_uppland_b06_plansch_1.pdf',
    sourceVolumeTitle: 'Upplands runinskrifter del 1 (SRI band 6, 1940–1943)',
    sourcePage: 13,
    sourcePlateOrFigure: 'Pl. 12',
    photographerOrArtist: 'Sven B.F. Jansson',
    year: 1940,
    license: 'Public Domain',
    isPubliclyDistributable: true,
    isEditorialDrawing: false,
    caption: 'Hillersjöhällen (U 29), arvsberättelsen om Geirlög ur Upplands runinskrifter',
    altText: 'Översiktsfoto av den vidsträckta ristningen på Hillersjöhällen med invecklade runslingor.'
  },
  {
    canonicalSignum: 'U 73',
    canonicalSlug: 'u-73',
    isDepicted: true,
    sourceVolume: 'sri_uppland_b06_plansch_1.pdf',
    sourceVolumeTitle: 'Upplands runinskrifter del 1 (SRI band 6, 1940–1943)',
    sourcePage: 45,
    sourcePlateOrFigure: 'Pl. 32',
    photographerOrArtist: 'Sven B.F. Jansson / Harald Faith-Ell',
    year: 1940,
    license: 'Public Domain',
    isPubliclyDistributable: true,
    isEditorialDrawing: false,
    caption: 'Hansta (U 73), Greklandssten rest till minne av söner som dog i Grekland',
    altText: 'Fotografisk plansch av runstenen U 73 med kors och drakslinga.'
  },
  {
    canonicalSignum: 'U 101',
    canonicalSlug: 'u-101',
    isDepicted: true,
    sourceVolume: 'sri_uppland_b06_plansch_1.pdf',
    sourceVolumeTitle: 'Upplands runinskrifter del 1 (SRI band 6, 1940–1943)',
    sourcePage: 63,
    sourcePlateOrFigure: 'Pl. 45',
    photographerOrArtist: 'Sven B.F. Jansson',
    year: 1940,
    license: 'Public Domain',
    isPubliclyDistributable: true,
    isEditorialDrawing: false,
    caption: 'Sjöstugan (U 101), Jarlabankes självberömmande ristning ur Upplands runinskrifter',
    altText: 'Fotografi av runstenen U 101 rest i öppen terräng vid Sjöstugan, Sollentuna.'
  },
  {
    canonicalSignum: 'U 104',
    canonicalSlug: 'u-104',
    isDepicted: true,
    sourceVolume: 'sri_uppland_b06_plansch_1.pdf',
    sourceVolumeTitle: 'Upplands runinskrifter del 1 (SRI band 6, 1940–1943)',
    sourcePage: 67,
    sourcePlateOrFigure: 'Pl. 48',
    photographerOrArtist: 'Sven B.F. Jansson',
    year: 1940,
    license: 'Public Domain',
    isPubliclyDistributable: true,
    isEditorialDrawing: false,
    caption: 'Eds kyrka (U 104), runsten ristad av runmästaren Öpir ur Upplands runinskrifter',
    altText: 'Fotografi av Öpirs typiska ormslingor och distinkta ristning på stenen U 104.'
  },
  {
    canonicalSignum: 'U 112A',
    canonicalSlug: 'u-112a',
    isDepicted: true,
    sourceVolume: 'sri_uppland_b06_plansch_1.pdf',
    sourceVolumeTitle: 'Upplands runinskrifter del 1 (SRI band 6, 1940–1943)',
    sourcePage: 72,
    sourcePlateOrFigure: 'Pl. 51',
    photographerOrArtist: 'Sven B.F. Jansson',
    year: 1940,
    license: 'Public Domain',
    isPubliclyDistributable: true,
    isEditorialDrawing: false,
    caption: 'Runblocket i Ed (U 112A), västra sidans monumentala runslinga vid Kyrkstigen',
    altText: 'Fotografi av det massiva flyttblocket i Ed med den västra runslingan belyst från sidan.'
  },
  {
    canonicalSignum: 'U 112B',
    canonicalSlug: 'u-112b',
    isDepicted: true,
    sourceVolume: 'sri_uppland_b06_plansch_1.pdf',
    sourceVolumeTitle: 'Upplands runinskrifter del 1 (SRI band 6, 1940–1943)',
    sourcePage: 73,
    sourcePlateOrFigure: 'Pl. 52',
    photographerOrArtist: 'Sven B.F. Jansson',
    year: 1940,
    license: 'Public Domain',
    isPubliclyDistributable: true,
    isEditorialDrawing: false,
    caption: 'Runblocket i Ed (U 112B), östra sidan med inskriften om Ragnvald som förde här i Grekland',
    altText: 'Fotografi av den östra ristningsytan på runblocket i Ed med kors och greklandsfarartext.'
  },
  {
    canonicalSignum: 'Sö 101',
    canonicalSlug: 'so-101',
    isDepicted: true,
    sourceVolume: 'sri_sodermanland_b03_h04_plansch.pdf',
    sourceVolumeTitle: 'Södermanlands runinskrifter (SRI band 3, 1924–1936)',
    sourcePage: 7,
    sourcePlateOrFigure: 'Pl. 38',
    photographerOrArtist: 'Erik Brate / Elias Wessén',
    year: 1924,
    license: 'Public Domain',
    isPubliclyDistributable: true,
    isEditorialDrawing: false,
    caption: 'Ramsundsristningen (Sö 101), Sigurdsristningen på berghäll vid Sundbyholm',
    altText: 'Fotografisk plansch av den monumentala berghällen med Sigurd Fafnesbane och smeden Regin.'
  },
  {
    canonicalSignum: 'Sö 179',
    canonicalSlug: 'so-179',
    isDepicted: true,
    sourceVolume: 'sri_sodermanland_b03_h03_plansch_1.pdf',
    sourceVolumeTitle: 'Södermanlands runinskrifter (SRI band 3, 1924–1936)',
    sourcePage: 6,
    sourcePlateOrFigure: 'Pl. 67',
    photographerOrArtist: 'Elias Wessén',
    year: 1936,
    license: 'Public Domain',
    isPubliclyDistributable: true,
    isEditorialDrawing: false,
    caption: 'Gripsholmsstenen (Sö 179), rest efter Ingvarståget mot Särkland',
    altText: 'Fotografi av runstenen Sö 179 vid Gripsholms slott med kors och runorm.'
  },
  {
    canonicalSignum: 'Vs 24',
    canonicalSlug: 'vs-24',
    isDepicted: true,
    sourceVolume: 'sri_vastmanland_b13_plansch.pdf',
    sourceVolumeTitle: 'Västmanlands runinskrifter (SRI band 13, 1964)',
    sourcePage: 26,
    sourcePlateOrFigure: 'Pl. 18',
    photographerOrArtist: 'Marianne Gustafsson / Sven B.F. Jansson',
    year: 1964,
    license: 'Public Domain',
    isPubliclyDistributable: true,
    isEditorialDrawing: false,
    caption: 'Hassmyrastenen (Vs 24), minnesstenen över husfrun Odendisa ur Västmanlands runinskrifter',
    altText: 'Fotografi av Hassmyrastenen med runband och den poetiska versen om Odendisa.'
  }
];

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  if (!fs.existsSync(RAW_DIR) || fs.readdirSync(RAW_DIR).length === 0) {
    console.log('Extraherar råa planschbilder via Python...');
    execSync('python3 scripts/runor/extract-plates-e16.py', { stdio: 'inherit' });
  }
  console.log(`Bearbetar och optimerar bilder till ${OUT_DIR}...`);

  const manifest = {
    version: '1.0.0',
    phase: 'E16',
    generatedAt: new Date().toISOString(),
    totalInscriptions: IMAGE_SPECS.length,
    depictedCount: 0,
    nonDepictedCount: 0,
    images: []
  };

  for (const spec of IMAGE_SPECS) {
    const slug = spec.canonicalSlug;
    if (!spec.isDepicted) {
      manifest.nonDepictedCount++;
      manifest.images.push({
        ...spec,
        displayImage: {
          url: '/images/runor/ej-avbildad.svg',
          width: 600,
          height: 400,
          format: 'svg',
          isPlaceholder: true
        },
        thumbImage: {
          url: '/images/runor/ej-avbildad.svg',
          width: 600,
          height: 400,
          format: 'svg',
          isPlaceholder: true
        }
      });
      continue;
    }

    manifest.depictedCount++;
    const rawJpg = path.join(RAW_DIR, `${slug}.jpg`);
    if (!fs.existsSync(rawJpg)) {
      throw new Error(`Kunde inte hitta rå JPEG för ${slug}: ${rawJpg}`);
    }

    const displayFile = `${slug}.webp`;
    const thumbFile = `${slug}-thumb.webp`;
    const displayPath = path.join(OUT_DIR, displayFile);
    const thumbPath = path.join(OUT_DIR, thumbFile);

    // 1. Skapa display version (max 1100 px bredd/höjd, webp quality 82)
    const displayInfo = await sharp(rawJpg)
      .resize({ width: 1100, height: 1100, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 82, effort: 4 })
      .toFile(displayPath);

    // 2. Skapa thumbnail version (max 360 px bredd/höjd, webp quality 80)
    const thumbInfo = await sharp(rawJpg)
      .resize({ width: 360, height: 360, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80, effort: 4 })
      .toFile(thumbPath);

    console.log(`[${slug.padEnd(8)}] Display: ${displayInfo.width}x${displayInfo.height} (${(displayInfo.size / 1024).toFixed(1)} KB) | Thumb: ${thumbInfo.width}x${thumbInfo.height} (${(thumbInfo.size / 1024).toFixed(1)} KB)`);

    manifest.images.push({
      ...spec,
      displayImage: {
        url: `/images/runor/${displayFile}`,
        width: displayInfo.width,
        height: displayInfo.height,
        sizeBytes: displayInfo.size,
        format: 'webp',
        aspectRatio: +(displayInfo.width / displayInfo.height).toFixed(3)
      },
      thumbImage: {
        url: `/images/runor/${thumbFile}`,
        width: thumbInfo.width,
        height: thumbInfo.height,
        sizeBytes: thumbInfo.size,
        format: 'webp',
        aspectRatio: +(thumbInfo.width / thumbInfo.height).toFixed(3)
      }
    });
  }

  // Skriv manifest
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2), 'utf-8');
  console.log(`\nSparade bildmanifest: ${MANIFEST_PATH}`);

  // Uppdatera pilot-20-inskrifter.json
  const pilotData = JSON.parse(fs.readFileSync(PILOT_JSON_PATH, 'utf-8'));
  for (const insc of pilotData.inscriptions) {
    const entry = manifest.images.find(m => m.canonicalSlug === insc.canonicalSlug);
    if (entry) {
      insc.images = [
        {
          id: `img-${entry.canonicalSlug}`,
          imageUrl: entry.displayImage.url,
          thumbnailUrl: entry.thumbImage.url,
          caption: entry.caption,
          photographerOrArtist: entry.photographerOrArtist,
          year: entry.year,
          license: entry.license,
          isPubliclyDistributable: entry.isPubliclyDistributable,
          isEditorialDrawing: entry.isEditorialDrawing
        }
      ];
    }
  }

  fs.writeFileSync(PILOT_JSON_PATH, JSON.stringify(pilotData, null, 2), 'utf-8');
  console.log(`Uppdaterade ${PILOT_JSON_PATH}`);

  // Synka till lib/runor/pilot-data.ts
  const tsContent = `// Autogenererad fil från build-pilot-dataset / E16 bildoptimering
// Innehåller 20 granskade pilotinskrifter med fullständiga källhänvisningar, koordinater och bilder.

import type { RunicInscription } from './types.ts';

export const RUNIC_PILOT_INSCRIPTIONS: RunicInscription[] = ${JSON.stringify(pilotData.inscriptions, null, 2)};
export const PILOT_INSCRIPTIONS = RUNIC_PILOT_INSCRIPTIONS;
`;
  fs.writeFileSync(PILOT_TS_PATH, tsContent, 'utf-8');
  console.log(`Uppdaterade ${PILOT_TS_PATH}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
