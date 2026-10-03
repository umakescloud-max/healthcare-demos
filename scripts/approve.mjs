// Moves pending/<slug>.json into demos.json. Usage: node scripts/approve.mjs <slug> [repoRoot]
import { existsSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import path from "node:path";

const slug = process.argv[2];
const root = process.argv[3] ?? process.cwd();
if (!slug || !/^[a-z0-9-]+$/.test(slug)) { console.error(`invalid slug: ${JSON.stringify(slug)}`); process.exit(1); }

const pendingFile = path.join(root, "pending", `${slug}.json`);
if (!existsSync(pendingFile)) { console.error(`pending/${slug}.json is missing`); process.exit(1); }
const entry = JSON.parse(readFileSync(pendingFile, "utf8"));
if (entry.slug !== slug) { console.error(`pending file slug ${JSON.stringify(entry.slug)} does not match ${slug}`); process.exit(1); }
for (const k of ["title", "one_liner", "live_url", "repo_url", "cover"]) if (!entry[k]) { console.error(`pending/${slug}.json has no ${k}`); process.exit(1); }

const demosFile = path.join(root, "demos.json");
const data = JSON.parse(readFileSync(demosFile, "utf8"));
data.demos = (data.demos ?? []).filter((d) => d.slug !== slug); // no duplicates by slug
data.demos.push(entry);
writeFileSync(demosFile, JSON.stringify(data, null, 2) + "\n");
unlinkSync(pendingFile);
console.log(`approved ${slug}; demos.json now has ${data.demos.length} demo(s)`);
