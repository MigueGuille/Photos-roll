import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

test("produces a deployable standalone Next.js build", async () => {
  await access(new URL("../.next/BUILD_ID", import.meta.url));
  await access(new URL("../.next/standalone/server.js", import.meta.url));
  await access(new URL("../.next/static/", import.meta.url));
});

test("keeps the gallery assets and interactive controls", async () => {
  const [page, css, layout] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
  ]);

  for (const asset of [
    "graduation-together.jpg",
    "graduation-group.jpg",
    "graduation-family.jpg",
    "graduation-diploma.jpg",
    "graduation-signing.jpg",
    "graduation-portrait.jpg",
  ]) {
    await access(new URL(`../public/photos/${asset}`, import.meta.url));
  }

  assert.match(layout, /Momentos · Recuerdos de graduación/);
  assert.match(page, /aria-modal="true"/);
  assert.match(page, /background\.inert = true/);
  assert.match(page, /await import\("fflate"\)/);
  assert.match(page, /momentos-graduacion-seleccion\.zip/);
  assert.match(page, /printWindow\.print/);
  assert.match(page, /onPointerMove/);
  assert.match(css, /@media \(max-width: 620px\)/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
});
