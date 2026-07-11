#!/usr/bin/env bun
/**
 * Sincroniza docs/ (ADRs, specs, guías) hacia apps/docs/src/content/docs/
 * Agrega frontmatter automático para Starlight.
 * Se ejecuta antes de docs:build.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from "fs";
import { resolve, dirname, basename, join } from "path";

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
  console.log(`  OK ${origenPath} -> ${destinoPath}`);
}

// ── ADRs ──
console.log("\nADRs...");
const adrDir = ORIGEN("docs/adr");
if (existsSync(adrDir)) {
  const adrRegex = /^(\d{4})-(.+)\.md$/;
  const adrFiles = readdirSync(adrDir)
    .filter((f) => adrRegex.test(f))
    .map((f) => {
      const [, number, name] = f.match(adrRegex);
      const src = resolve(adrDir, f);
      const content = readFileSync(src, "utf-8");
      const title =
        content.match(/^#\s+(.+)/m)?.[1]?.trim() ||
        `ADR ${number}: ${name
          .split("-")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ")}`;
      return { file: f, number, name, src, title };
    })
    .sort((a, b) => a.number.localeCompare(b.number));

  for (const adr of adrFiles) {
    syncFile(adr.src, DESTINO("arquitectura", `adr-${adr.file}`), {
      title: adr.title,
      sidebar: parseInt(adr.number, 10),
    });
  }

  // Auto-generar sidebar en astro.config.mjs
  const sidebarItems = adrFiles
    .map(
      (adr) =>
        `                { label: "${adr.title}", slug: "arquitectura/adr-${adr.number}-${adr.name}" },`,
    )
    .join("\n");

  const astroConfigPath = ORIGEN("apps/docs/astro.config.mjs");
  let astroConfig = readFileSync(astroConfigPath, "utf-8");
  astroConfig = astroConfig.replace(
    /(\s*)\/\/ ADR_SIDEBAR_AUTO[\s\S]*?\/\/ ADR_SIDEBAR_AUTO_END/,
    `$1// ADR_SIDEBAR_AUTO\n${sidebarItems}\n$1// ADR_SIDEBAR_AUTO_END`,
  );
  writeFileSync(astroConfigPath, astroConfig, "utf-8");
  console.log(`  Sidebar actualizado con ${adrFiles.length} ADRs`);
}

// ── Especificaciones (SDD) ──
console.log("\nEspecificaciones SDD...");
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
console.log("\nGuias...");
const guias = [
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

console.log("\nSync completo.");
