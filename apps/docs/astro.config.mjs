import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import starlightUtils from "@lorenzo_lewis/starlight-utils";
import starlightCelestiaTheme from "starlight-theme-celestia-monorepo/packages/starlight-theme-celestia";
import { createStarlightTypeDocPlugin } from "starlight-typedoc";

const [apiTypeDoc] = createStarlightTypeDocPlugin();
const [webTypeDoc] = createStarlightTypeDocPlugin();

const docsBase = process.env.DOCS_BASE ?? "";
const docsPath = (path) => `${docsBase}${path}`;

export default defineConfig({
  site: process.env.DOCS_SITE ?? "https://alvas-docs.pages.dev",
  base: docsBase,
  integrations: [
    starlight({
      title: "ALVAS Docs",
      description: "Arquitectura, dominio, API y UI del CRM inmobiliario ALVAS",
      defaultLocale: "root",
      locales: {
        root: { label: "Español", lang: "es" },
      },
      plugins: [
        starlightUtils({
          multiSidebar: {
            switcherStyle: "hidden",
          },
        }),
        apiTypeDoc({
          entryPoints: ["../../apps/api/src"],
          output: "referencias/typedoc/api/ref",
          sidebar: { label: "Contenido API", collapsed: false },
          tsconfig: "../../apps/api/tsconfig.json",
          typeDoc: {
            entryPointStrategy: "expand",
            readme: "../../README.md",
            router: "kind",
            entryFileName: "index",
            modulesFileName: "modulos",
            membersWithOwnFile: ["Class", "Interface", "Enum", "TypeAlias"],
            indexFormat: "table",
            parametersFormat: "table",
            interfacePropertiesFormat: "table",
            classPropertiesFormat: "table",
            propertyMembersFormat: "table",
            typeAliasPropertiesFormat: "table",
            typeDeclarationFormat: "table",
            groupOrder: [
              "Classes",
              "Interfaces",
              "Type Aliases",
              "Enumerations",
              "Functions",
              "Variables",
              "*",
            ],
            kindSortOrder: ["Class", "Interface", "TypeAlias", "Enum", "Function", "Variable"],
            sort: ["kind", "source-order", "alphabetical-ignoring-documents"],
            exclude: [
              "**/*.test.ts",
              "**/*.spec.ts",
              "**/test/**",
              "**/drizzle/**",
              "**/worker-configuration.d.ts",
            ],
            excludePrivate: false,
            excludeProtected: false,
            excludeInternal: false,
            excludeNotDocumented: true,
            excludeNotDocumentedKinds: ["Function", "Variable"],
            excludeReferences: true,
            categorizeByGroup: true,
            navigation: {
              includeCategories: true,
              includeGroups: true,
              includeFolders: true,
              compactFolders: false,
              excludeReferences: true,
            },
            includeVersion: true,
          },
        }),
        webTypeDoc({
          entryPoints: ["../../apps/web/src/lib"],
          output: "referencias/typedoc/web/ref",
          sidebar: { label: "Contenido Web", collapsed: false },
          tsconfig: "../../apps/web/tsconfig.json",
          typeDoc: {
            entryPointStrategy: "expand",
            readme: "../../README.md",
            router: "kind",
            entryFileName: "index",
            modulesFileName: "modulos",
            membersWithOwnFile: ["Class", "Interface", "Enum", "TypeAlias"],
            indexFormat: "table",
            parametersFormat: "table",
            interfacePropertiesFormat: "table",
            classPropertiesFormat: "table",
            propertyMembersFormat: "table",
            typeAliasPropertiesFormat: "table",
            typeDeclarationFormat: "table",
            groupOrder: [
              "Classes",
              "Interfaces",
              "Type Aliases",
              "Enumerations",
              "Functions",
              "Variables",
              "*",
            ],
            kindSortOrder: ["Class", "Interface", "TypeAlias", "Enum", "Function", "Variable"],
            sort: ["kind", "source-order", "alphabetical-ignoring-documents"],
            exclude: [
              "**/*.svelte",
              "**/*.test.ts",
              "**/*.spec.ts",
              "**/*.stories.ts",
              "**/*.stories.svelte",
              "**/test/**",
              "**/__tests__/**",
            ],
            excludePrivate: false,
            excludeProtected: false,
            excludeInternal: false,
            excludeNotDocumented: true,
            excludeNotDocumentedKinds: ["Function", "Variable"],
            excludeReferences: true,
            categorizeByGroup: true,
            navigation: {
              includeCategories: true,
              includeGroups: true,
              includeFolders: true,
              compactFolders: false,
              excludeReferences: true,
            },
            includeVersion: true,
          },
        }),
        starlightCelestiaTheme({
          nav: [
            { label: "Home", href: docsPath("/") },
            { label: "TypeDoc API", href: docsPath("/referencias/typedoc/api/") },
            { label: "TypeDoc Web", href: docsPath("/referencias/typedoc/web/") },
            { label: "GitHub", href: "https://github.com/CONECT-IT/alvas-sistema" },
          ],
        }),
      ],
      social: [],
      customCss: ["./src/assets/custom.css"],
      components: {
        Head: "@astrojs/starlight/components/Head.astro",
      },
      sidebar: [
        {
          label: "Documentación",
          items: [
            { label: "Inicio", slug: "index" },
            {
              label: "Arquitectura",
              items: [
                { label: "Visión general", slug: "arquitectura/vision-general" },
                { label: "DDD y hexagonal", slug: "arquitectura/hexagonal-ddd" },
                { label: "Context Map", slug: "arquitectura/context-map" },
                { label: "ADR 0001: DDD Táctico", slug: "arquitectura/adr-0001-ddd-tactico" },
                {
                  label: "ADR 0002: Aggregate Roots",
                  slug: "arquitectura/adr-0002-aggregate-roots",
                },
              ],
            },
            {
              label: "Dominio",
              items: [
                { label: "Lenguaje ubicuo", slug: "dominio/lenguaje-ubicuo" },
                { label: "Módulos", slug: "dominio/modulos" },
              ],
            },
            {
              label: "Flujos",
              items: [{ label: "Captaciones y leads", slug: "flujos/captaciones-leads" }],
            },
            {
              label: "Especificaciones",
              items: [
                {
                  label: "Ventas, leads y clientes",
                  slug: "especificaciones/ventas-leads-clientes",
                },
                {
                  label: "Usuarios, roles y permisos",
                  slug: "especificaciones/usuarios-roles-permisos",
                },
                { label: "Propiedades", slug: "especificaciones/propiedades" },
                {
                  label: "Integraciones WhatsApp",
                  slug: "especificaciones/integraciones-whatsapp",
                },
                { label: "Reportes", slug: "especificaciones/reportes" },
                { label: "Web y design system", slug: "especificaciones/web-ux-design-system" },
              ],
            },
            {
              label: "Calidad",
              items: [
                { label: "Mutation Testing", slug: "calidad/mutation-testing" },
                { label: "Walkthrough Log", slug: "calidad/walkthrough-log" },
              ],
            },
            {
              label: "Referencias",
              items: [
                { label: "Vista general", slug: "referencias" },
                { label: "API y Scalar", slug: "referencias/api" },
                { label: "Storybook", slug: "referencias/storybook" },
                { label: "TypeDoc", slug: "referencias/typedoc" },
              ],
            },
          ],
        },
        {
          label: "TypeDoc API",
          items: [
            { label: "Vista general", slug: "referencias/typedoc/api" },
            { label: "Overview", slug: "referencias/typedoc/api/ref" },
            {
              label: "Clases",
              items: [
                {
                  autogenerate: {
                    directory: "referencias/typedoc/api/ref/classes",
                    collapsed: true,
                  },
                },
              ],
            },
            {
              label: "Interfaces",
              items: [
                {
                  autogenerate: {
                    directory: "referencias/typedoc/api/ref/interfaces",
                    collapsed: true,
                  },
                },
              ],
            },
            {
              label: "Tipos",
              items: [
                {
                  autogenerate: {
                    directory: "referencias/typedoc/api/ref/types",
                    collapsed: true,
                  },
                },
              ],
            },
            {
              label: "Módulos",
              items: [
                {
                  autogenerate: {
                    directory: "referencias/typedoc/api/ref/modules",
                    collapsed: true,
                  },
                },
              ],
            },
            {
              label: "Funciones",
              items: [
                {
                  autogenerate: {
                    directory: "referencias/typedoc/api/ref/functions",
                    collapsed: true,
                  },
                },
              ],
            },
            {
              label: "Variables",
              items: [
                {
                  autogenerate: {
                    directory: "referencias/typedoc/api/ref/variables",
                    collapsed: true,
                  },
                },
              ],
            },
          ],
        },
        {
          label: "TypeDoc Web",
          items: [
            { label: "Vista general", slug: "referencias/typedoc/web" },
            { label: "Overview", slug: "referencias/typedoc/web/ref" },
            {
              label: "Clases",
              items: [
                {
                  autogenerate: {
                    directory: "referencias/typedoc/web/ref/classes",
                    collapsed: true,
                  },
                },
              ],
            },
            {
              label: "Interfaces",
              items: [
                {
                  autogenerate: {
                    directory: "referencias/typedoc/web/ref/interfaces",
                    collapsed: true,
                  },
                },
              ],
            },
            {
              label: "Tipos",
              items: [
                {
                  autogenerate: {
                    directory: "referencias/typedoc/web/ref/types",
                    collapsed: true,
                  },
                },
              ],
            },
            {
              label: "Módulos",
              items: [
                {
                  autogenerate: {
                    directory: "referencias/typedoc/web/ref/modules",
                    collapsed: true,
                  },
                },
              ],
            },
            {
              label: "Funciones",
              items: [
                {
                  autogenerate: {
                    directory: "referencias/typedoc/web/ref/functions",
                    collapsed: true,
                  },
                },
              ],
            },
            {
              label: "Variables",
              items: [
                {
                  autogenerate: {
                    directory: "referencias/typedoc/web/ref/variables",
                    collapsed: true,
                  },
                },
              ],
            },
          ],
        },
      ],
    }),
  ],
});
