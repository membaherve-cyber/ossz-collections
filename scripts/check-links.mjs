import { readFileSync } from "node:fs";
import path from "node:path";

/**
 * Link checker — crawls every page of the running dev server, extracts the
 * hrefs, and requests each internal one. Reports 404s and dead media files.
 *
 *   BASE_URL=http://localhost:63480 node scripts/check-links.mjs
 */

const BASE = process.env.BASE_URL || "http://localhost:63480";

async function statusOf(url) {
  try {
    const res = await fetch(url, { redirect: "follow" });
    return res.status;
  } catch {
    return 0;
  }
}

/** Pages discovered from src/app — same set a real visitor can navigate. */
import { readdirSync, statSync } from "node:fs";
const appDir = path.join(process.cwd(), "src", "app");
const pages = [];

function collect(dir, prefix = "") {
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) {
      if (entry.startsWith("[") || entry.startsWith("api")) continue; // dynamic/API checked separately
      collect(full, `${prefix}/${entry}`);
    } else if (entry === "page.tsx") {
      pages.push(prefix || "/");
    }
  }
}
collect(appDir);

const seenPages = new Set();
const seenLinks = new Set();
const broken = [];

for (const page of pages) {
  if (seenPages.has(page)) continue;
  seenPages.add(page);
  const url = `${BASE}${page}`;
  const status = await statusOf(url);
  if (status !== 200) {
    broken.push({ page, url, status });
    continue;
  }
  const html = await (await fetch(url)).text();
  // Internal links (href="/...") excluding anchors, tel:, mailto:, whatsapp deep links
  for (const m of html.matchAll(/href="(\/[^"#]*)"/g)) {
    seenLinks.add(m[1]);
  }
}

for (const link of seenLinks) {
  const code = await statusOf(`${BASE}${link}`);
  if (code !== 200) broken.push({ page: "(referenced)", url: link, status: code });
}

// Static media referenced in the seeded catalogue/lookbook DB rows
for (const page of seenPages) {
  const html = await (await fetch(`${BASE}${page}`)).text();
  for (const m of html.matchAll(/(?:src|poster)="(\/(?:catalogue|uploads|logo[^"]*|ossz-logo)[^"]*)"/g)) {
    const code = await statusOf(`${BASE}${m[1]}`);
    if (code !== 200) broken.push({ page, url: m[1], status: code });
  }
}

if (broken.length) {
  console.log(`✗ ${broken.length} broken link(s):`);
  for (const b of broken) console.log(`  ${b.status || "ERR"}  ${b.url}   (on ${b.page})`);
  process.exit(1);
} else {
  console.log(`✓ All ${seenPages.size} pages and ${seenLinks.size} internal links resolve.`);
}
