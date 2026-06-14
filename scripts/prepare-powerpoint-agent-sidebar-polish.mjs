import { readFileSync, writeFileSync } from 'node:fs';

const target = 'src/pages/PowerPointAgent.tsx';
const apply = process.argv.includes('--apply');
let source = readFileSync(target, 'utf8');
const original = source;

const replaceOnce = (needle, replacement, label) => {
  if (!source.includes(needle)) {
    console.warn(`⚠ skipped ${label}: needle not found or already patched`);
    return;
  }
  source = source.replace(needle, replacement);
  console.log(`✓ ${label}`);
};

replaceOnce(
  '<p className="text-[11px] text-muted-foreground truncate">Refine your deck — ask anything</p>',
  '<p className="text-[11px] text-muted-foreground truncate">Refine, edit, and send deck changes</p>',
  'tighten sidebar agent subtitle',
);

replaceOnce(
  `            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
              {history.length === 0 && (`,
  `            <div className="border-b bg-background/45 px-3 py-2 text-[11px] text-muted-foreground">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="rounded-full bg-primary/10 px-2 py-0.5 font-medium text-primary">Live editor</span>
                <span className="rounded-full bg-muted px-2 py-0.5">{useBrand && selectedBrand ? selectedBrand.name : 'No brand selected'}</span>
                <span className="rounded-full bg-muted px-2 py-0.5">{editorInitialSlides?.length || templateStarterSlides?.length || 0} slide{(editorInitialSlides?.length || templateStarterSlides?.length || 0) === 1 ? '' : 's'}</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
              {history.length === 0 && (`,
  'add live editor context chips',
);

replaceOnce(
  'Start chatting with the agent to refine slides, swap layouts, or generate a new deck.',
  'Ask the agent to rewrite a slide, swap a layout, add a section, tighten copy, or prepare export notes.',
  'improve empty sidebar prompt',
);

replaceOnce(
  'placeholder="Refine slides, swap layouts, add a section…"',
  'placeholder="Ask for a precise deck edit…"\n                aria-label="Ask the presentation agent for a deck edit"',
  'label sidebar prompt input',
);

replaceOnce(
  'className="w-full gap-1.5"\n                disabled={!topic.trim() || isGenerating}',
  'className="w-full gap-1.5"\n                disabled={!topic.trim() || isGenerating}\n                aria-label="Send deck edit request"',
  'label sidebar send action',
);

const requiredMarkers = [
  'Refine, edit, and send deck changes',
  'Live editor',
  'Ask the agent to rewrite a slide',
  'aria-label="Ask the presentation agent for a deck edit"',
  'aria-label="Send deck edit request"',
];

const missingMarkers = requiredMarkers.filter((marker) => !source.includes(marker));
if (missingMarkers.length > 0) {
  console.error('\n✖ PowerPoint agent sidebar polish validation failed. Missing markers:');
  for (const marker of missingMarkers) console.error(`- ${marker}`);
  process.exit(1);
}

if (source === original) {
  console.log('No PowerPointAgent changes detected. The file may already include sidebar polish. Validation passed.');
  process.exit(0);
}

if (apply) {
  writeFileSync(target, source);
  console.log('\n✓ PowerPointAgent sidebar polish applied and validated.');
} else {
  console.log('\nDry run only. PowerPointAgent sidebar polish validated. Re-run with --apply to update PowerPointAgent.tsx.');
}
