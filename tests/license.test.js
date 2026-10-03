// Copyright (c) 2026 Sabir Hussain. All rights reserved. See LICENSE.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");

test("proprietary licence is present and the package is marked UNLICENSED and private", () => {
  assert.match(read("LICENSE"), /All rights reserved/);
  assert.match(read("LICENSE"), /Sabir Hussain/);
  const pkg = JSON.parse(read("package.json"));
  assert.equal(pkg.license, "UNLICENSED");
  assert.equal(pkg.private, true);
  assert.ok(existsSync(new URL("../THIRD_PARTY_NOTICES.md", import.meta.url)));
});

test("every source file carries the copyright header", () => {
  const missing = [];
  const walk = (dir) => {
    for (const name of readdirSync(dir)) {
      const full = join(dir, name);
      if (statSync(full).isDirectory()) walk(full);
      else if (/\.(js|jsx|css)$/.test(name) && !/All rights reserved/.test(readFileSync(full, "utf8").slice(0, 200))) missing.push(full);
    }
  };
  walk(new URL("../src", import.meta.url).pathname);
  assert.deepEqual(missing, []);
});

test("source maps are disabled and security headers are configured", () => {
  assert.match(read("vite.config.js"), /sourcemap: false/);
  for (const f of ["public/_headers", "render.yaml"]) {
    const text = read(f);
    assert.match(text, /X-Frame-Options/);
    assert.match(text, /X-Content-Type-Options/);
    assert.match(text, /frame-ancestors 'none'/);
  }
});
