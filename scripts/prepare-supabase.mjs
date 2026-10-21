import { readFile, writeFile } from 'node:fs/promises';
const migrations = ['20261017_svenska_dev.sql', '20261017_editorial_workflow.sql', '20261017_homepage.sql', '20261019_thesis_pilot.sql', '20261021_runic_storage.sql', '20261022_runic_editorial.sql'];
const bodies = await Promise.all(migrations.map(async name => {
  const source = await readFile(new URL(`../supabase/migrations/${name}`, import.meta.url), 'utf8');
  return `-- ${name}\n${source.replace(/^begin;\s*/m, '').replace(/^commit;\s*$/m, '').trim()}`;
}));
await writeFile(new URL('../supabase/install-svenska.sql', import.meta.url), '-- Nyinstallation av svenska.dev i Fornsvenska.se:s Supabase-projekt.\n-- Kör endast om svenska.dev-tabellerna inte redan finns.\n-- Ändrar inga Fornsvenska- eller Italo-tabeller.\n-- Genereras av node scripts/prepare-supabase.mjs.\nbegin;\n\n' + bodies.join('\n\n') + '\n\ncommit;\n');
console.log('supabase/install-svenska.sql är klar.');
