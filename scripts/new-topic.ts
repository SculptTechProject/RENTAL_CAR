/* eslint-disable no-console */
// =============================================================================
// GENERATOR TEMATU — przełącza aktywny preset domeny w domain.config.ts.
//
//   npm run topic              -> lista dostępnych presetów
//   npm run topic -- vet       -> ustaw temat "weterynarz" + wypisz checklistę
//
// Co robi AUTOMATYCZNIE (bezpieczne):
//   - podmienia linię `@active-preset` w domain.config.ts na wybrany preset,
//     więc CAŁE UI (etykiety, tytuły, copy) zmienia się od razu.
//
// Czego NIE robi (za ryzykowne, by tknąć automatem) — wypisuje to jako TODO:
//   - schemat Prisma, seed, wpięcie innej rodziny algorytmu, walidatory.
//
// Patrz: ADAPT.md (pełna recepta) i src/.../config/presets/registry.ts.
// =============================================================================

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { PRESETS, findPreset } from "../src/server/domain/config/presets/registry";

const here = dirname(fileURLToPath(import.meta.url));
const CONFIG_PATH = resolve(
  here,
  "../src/server/domain/config/domain.config.ts",
);

const ACTIVE_LINE_RE = /^import .*\/\/ @active-preset\s*$/m;

function bold(s: string) {
  return `\x1b[1m${s}\x1b[0m`;
}
function dim(s: string) {
  return `\x1b[2m${s}\x1b[0m`;
}

function printList() {
  console.log(bold("\nDostępne tematy (presety):\n"));
  for (const p of PRESETS) {
    console.log(`  ${bold(p.key.padEnd(12))} ${p.label}`);
    console.log(`  ${" ".repeat(12)} ${dim(`algorytm: ${p.algorithm}`)}`);
  }
  console.log(`\nUżycie: ${bold("npm run topic -- <klucz>")}`);
  console.log(dim("np. npm run topic -- vet\n"));
}

function apply(key: string) {
  const preset = findPreset(key);
  if (!preset) {
    console.error(`\n❌ Nie znam presetu "${key}".`);
    printList();
    process.exit(1);
  }

  const src = readFileSync(CONFIG_PATH, "utf8");
  if (!ACTIVE_LINE_RE.test(src)) {
    console.error(
      `\n❌ Nie znalazłem linii oznaczonej "// @active-preset" w:\n   ${CONFIG_PATH}\n` +
        "   Czy plik nie został ręcznie zmieniony? Przywróć marker i spróbuj ponownie.",
    );
    process.exit(1);
  }

  const newLine = `import { ${preset.exportName} as activePreset } from "./presets/${preset.file}"; // @active-preset`;
  const updated = src.replace(ACTIVE_LINE_RE, newLine);
  writeFileSync(CONFIG_PATH, updated, "utf8");

  console.log(`\n✅ Aktywny temat: ${bold(preset.label)}`);
  console.log(dim(`   (domain.config.ts -> presets/${preset.file})`));
  console.log(`   Rodzina algorytmu: ${bold(preset.algorithm)}`);

  console.log(bold("\n📋 Co jeszcze musisz zrobić ręcznie:\n"));
  preset.checklist.forEach((step, i) => {
    console.log(`  ${i + 1}. ${step}`);
  });

  console.log(bold("\n🔍 Na koniec sprawdź, że nic się nie wysypało:\n"));
  console.log("  npm run typecheck");
  console.log("  npm test");
  console.log("  npm run db:reset   " + dim("# jeśli ruszałeś schemat/seed"));
  console.log("  npm run dev\n");
}

const arg = process.argv[2];
if (!arg) {
  printList();
} else {
  apply(arg);
}
