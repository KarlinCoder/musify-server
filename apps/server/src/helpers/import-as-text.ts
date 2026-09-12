import fs from "fs";
import path from "path";

const fragmentStartRe =
  /^\s*fragment\s+([A-Za-z_][A-Za-z0-9_]*)\s+on\s+[A-Za-z_][A-Za-z0-9_]*\s*\{/;

const fragmentSpreadRe = /\.\.\.\s*([A-Za-z_][A-Za-z0-9_]*)/g;

const importRe = /^#import\s+"([^"]+)"\s*$/gm;

function extractFragments(source: string): Map<string, string> {
  const fragments = new Map<string, string>();
  const lines = source.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(fragmentStartRe);
    if (!m) continue;

    const body: string[] = [];
    let depth = 0;
    let j = i;

    while (j < lines.length) {
      body.push(lines[j]);
      for (const ch of lines[j]) {
        if (ch === "{") depth++;
        else if (ch === "}") depth--;
      }
      j++;
      if (depth <= 0) break;
    }

    fragments.set(m[1], body.join("\n"));
    i = j - 1;
  }

  return fragments;
}

function collectUsedFragments(source: string): Set<string> {
  const used = new Set<string>();
  for (const match of source.matchAll(fragmentSpreadRe)) {
    const name = match[1];
    if (name !== "on") used.add(name);
  }
  return used;
}

export const importAsText = (filePath: string): string => {
  const dir = path.dirname(filePath);
  let source = fs.readFileSync(filePath, "utf-8");

  const library = new Map<string, string>();
  for (const match of source.matchAll(importRe)) {
    const importedPath = path.resolve(dir, match[1]);
    for (const [name, body] of extractFragments(
      fs.readFileSync(importedPath, "utf-8"),
    )) {
      library.set(name, body);
    }
  }

  source = source.replace(importRe, "");

  if (library.size === 0) return source;

  const used = new Set<string>();
  const queue = [...collectUsedFragments(source)];
  while (queue.length) {
    const name = queue.pop()!;
    if (used.has(name)) continue;
    used.add(name);
    const body = library.get(name);
    if (body) {
      for (const dep of collectUsedFragments(body)) queue.push(dep);
    }
  }

  const inline = [...used]
    .map((name) => library.get(name))
    .filter((body): body is string => !!body)
    .join("\n");

  return inline ? `${source}\n\n${inline}` : source;
};