import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the complete graduation gallery", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Momentos · Recuerdos de graduación<\/title>/i);
  assert.match(html, /Un día que queda/);
  assert.match(html, /Pequeños instantes/);
  assert.match(html, /Descargar selección/);
  assert.match(html, /Imprimir/);
  assert.equal((html.match(/class="photo-card /g) ?? []).length, 6);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton|Your site is taking shape/i);
});

test("keeps the gallery assets and interactive controls in the final source", async () => {
  const [page, css] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
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

  assert.match(page, /aria-modal="true"/);
  assert.match(page, /background\.inert = true/);
  assert.match(page, /await import\("fflate"\)/);
  assert.match(page, /momentos-graduacion-seleccion\.zip/);
  assert.match(page, /printWindow\.print/);
  assert.match(page, /onPointerMove/);
  assert.match(page, /aria-live="polite"/);
  assert.match(css, /@media \(max-width: 620px\)/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
});
