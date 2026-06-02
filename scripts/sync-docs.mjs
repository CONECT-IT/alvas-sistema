#!/usr/bin/env node
/**
 * Sincroniza docs/ (ADRs, specs, guías) hacia apps/docs/src/content/docs/
 * Agrega frontmatter automático para Starlight.
 * Se ejecuta antes de docs:build.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { resolve, dirname, basename } from "path";

const ORIGEN = (...p) => resolve(process.cwd(), ...p);
const DESTINO = (...p) => ORIGEN("apps/docs/src/content/docs", ...p);

function slugify(name) {
  return name
    .replace(/\.(spec|md)$/i, "")
    .replace(/\s+/g, "-")
    .toLowerCase();
}

function leerTitle(contenido) {
  const match = contenido.match(/^#\s+(.+)/m);
  return match ? match[1].trim() : "Documento";
}

function leerDescription(contenido) {
  const lines = contenido.split("\n").slice(0, 6);
  for (const line of lines) {
    const trimmed = line.replace(/^##?\s+/, "").trim();
    if (trimmed && !trimmed.startsWith("#")) return trimmed;
  }
  return "";
}

function syncFile(origenPath, destinoPath, extraFrontmatter = {}) {
  const raw = readFileSync(origenPath, "utf-8");

  // Saltar si ya tiene frontmatter
  if (raw.startsWith("---")) return;

  const title = extraFrontmatter.title || leerTitle(raw);
  const description = extraFrontmatter.description || leerDescription(raw);
  const sidebar = extraFrontmatter.sidebar
    ? `\nsidebar:\n  order: ${extraFrontmatter.sidebar}`
    : "";

  const frontmatter = `---
title: "${title}"
description: "${description}"${sidebar}
---

`;

  mkdirSync(dirname(destinoPath), { recursive: true });
  writeFileSync(destinoPath, frontmatter + raw);
  console.log(`  ✓ ${origenPath} → ${destinoPath}`);
}

// ── ADRs ──
console.log("\n📋 ADRs...");
const adrDir = ORIGEN("docs/adr");
if (existsSync(adrDir)) {
  const adrFiles = [
    ["0001-ddd-tactico.md", { title: "ADR 0001: DDD Táctico", sidebar: 1 }],
    ["0002-aggregate-roots.md", { title: "ADR 0002: Aggregate Roots", sidebar: 2 }],
  ];
  for (const [file, opts] of adrFiles) {
    const src = resolve(adrDir, file);
    if (existsSync(src)) {
      syncFile(src, DESTINO("arquitectura", `adr-${file}`), opts);
    }
  }
}

// ── Especificaciones (SDD) ──
console.log("\n📋 Especificaciones SDD...");
const specsDir = ORIGEN("docs/specs");
if (existsSync(specsDir)) {
  const specs = [
    "ventas-leads-clientes.spec.md",
    "usuarios-roles-permisos.spec.md",
    "propiedades.spec.md",
    "integraciones-whatsapp.spec.md",
    "reportes.spec.md",
    "web-ux-design-system.spec.md",
  ];
  specs.forEach((file, i) => {
    const src = resolve(specsDir, file);
    if (existsSync(src)) {
      syncFile(src, DESTINO("especificaciones", file.replace(/\.spec\.md$/, ".md")), {
        sidebar: i + 1,
      });
    }
  });
}

// ── Guías ──
console.log("\n📋 Guías...");
const guias = [
  ["docs/context-map.md", "arquitectura/context-map.md", { title: "Context Map", sidebar: 3 }],
  [
    "docs/mutation-testing.md",
    "calidad/mutation-testing.md",
    { title: "Mutation Testing", sidebar: 1 },
  ],
  [
    "docs/walkthrough-log.md",
    "calidad/walkthrough-log.md",
    { title: "Walkthrough Log", sidebar: 2 },
  ],
];
for (const [origen, destino, opts] of guias) {
  const src = ORIGEN(origen);
  if (existsSync(src)) {
    syncFile(src, DESTINO(destino), opts);
  }
}

console.log("\n✅ Sync completo.");
