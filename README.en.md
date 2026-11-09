# copy-web Project Guide

[简体中文](./README.md) | **English**

| Item | Value |
| --- | --- |
| Project name | `copy-web` |
| Version | `v1.0.0` (stable) |
| Pipeline contract version | `1.0.0` |
| Type | CodeBuddy Skill (single skill + pluggable components) |
| Status | Generated; not installed, not packaged |
| Location | `c:\Users\HP\Desktop\test\copy-web\` |
| Languages | Documentation in Simplified Chinese and English; generated code identifiers in English |

## 1. What It Is

`copy-web` turns "observing a website's UI" into "generating a runnable replica project" through a pluggable pipeline: first scan the site with browser automation and write a human-perspective interface description, then turn that description into a systematic theme specification, and finally generate a Vue3 + TailwindCSS project strictly from that specification.

`copy-web` itself is the **core dispatcher**. It only handles the startup questionnaire, the component registry, the runtime configuration and the quality gates. It does not produce design documents and does not generate code. Components do the actual work, exchanging data through fixed file names and directory contracts, and new components can be appended continuously.

Three components ship with it:

| Stage | Component | Input | Output |
| --- | --- | --- | --- |
| 1 | `web-scan` | Target URL, auth mode, output directory | `webui-theme.txt`, `scan/**` |
| 2 | `word-theme` | `webui-theme.txt`, `scan/manifest.json` | `copy-themeUI.md` |
| 3 | `web-maker` | `copy-themeUI.md`, `scan/assets/**`, `pipeline.json` | `web/**` |

Data flow: `target URL → webui-theme.txt → copy-themeUI.md → web/**`. Requirements only travel downstream; a downstream stage must never invent requirements belonging to an upstream stage.

## 2. Directory Structure

```text
copy-web/
├── README.md                          Chinese guide (v1.0.0 stable)
├── README.en.md                       English guide (v1.0.0 stable)
├── SKILL.md                           Skill entry: dispatcher, startup flow, component registry, extension rules
├── references/
│   ├── pipeline.md                    Directory contract, file contract, pipeline.json schema, global quality gates, glossary
│   ├── writing-style.md               Writing rules and observation order for webui-theme.txt
│   ├── browser-automation.md          Browser automation skill operating instructions
│   ├── web-maker-js.md                vue3-js project form: dependencies, structure, commands
│   ├── web-maker-ts.md                vue3-ts project form: dependencies, structure, commands
│   ├── components/
│   │   ├── web-scan.md                Component spec: I/O contract, workflow, quality checks, failure handling
│   │   ├── word-theme.md              Same as above
│   │   └── web-maker.md               Same as above
│   └── sample/
│       └── achen-theme-description.txt  User-supplied textual UI description sample (original, 10764 bytes)
├── assets/templates/
│   ├── webui-theme.template.txt       Narrative interface description template
│   ├── copy-themeUI.template.md       Systematic theme specification template
│   └── component.template.md          New component documentation template
└── scripts/
    └── fetch-assets.mjs               Static asset localization script (Node built-ins only, no external dependencies)
```

## 3. Quick Start

### 3.1 Installation (choose one)

```text
User level (cross-project):   C:\Users\HP\.codebuddy\skills\copy-web\
Project level (team-shared): <project root>\.codebuddy\skills\copy-web\
```

Copy the entire `copy-web` directory there. No build step and no dependency installation are required. The current directory only holds the generated artifacts and has not been installed yet.

### 3.2 Triggering

Use prompts similar to:

```text
Replicate the front end of https://example.com
Scan this site, write an interface description, then build a Vue3 project from it
Generate the TS replica from copy-themeUI.md
```

### 3.3 Startup Questionnaire (mandatory)

Before running any component, the skill must confirm all of the following parameters in a single pass. It must not start until they are confirmed:

| Parameter | Description |
| --- | --- |
| `targetUrl` | Entry URL of the target site |
| `authMode` | `none` / `manual-login` / `cookie`. When login is required the user logs in manually or supplies a Cookie; bypassing login is forbidden |
| `projectType` | `vue3-js` (Vite + Vue3 + JavaScript) or `vue3-ts` (Vite + Vue3 + TypeScript). **Must be chosen explicitly by the user; no defaults, no guessing, no deferring the question to the web-maker stage** |
| `scope` | Run the full pipeline, or only the specified stages |
| `outputDir` | Defaults to `./copy-web-out/`; the user may override it |

Once confirmed, write `pipeline.json` and execute components in `stage` order. At the end of each stage, run that component's quality checks plus the global quality gate; the next stage is blocked until they pass.

### 3.4 Output Location

```text
copy-web-out/
├── pipeline.json                 Runtime configuration and stage statuses
├── webui-theme.txt               Narrative Chinese interface description (plain text; no tables, code blocks or Markdown)
├── copy-themeUI.md               Systematic theme specification (design tokens, component list, per-page specs, acceptance checklist)
├── scan/                         Screenshots, DOM/computed-style snapshots, static assets, manifest and download results
└── web/                          Vue3 + TailwindCSS project (includes its own README.md)
```

Outputs are isolated from the skill directory; no runtime artifacts are ever written into the skill directory.

## 4. Components

### web-scan (stage 1)

Load the `agent-browser` or `playwright-cli` skill and reuse a single browser session: observe the overall UI → click navigation and buttons to discover every functional screen (including dialogs and secondary pages) → record sections, fields, copy, state branches and interactions screen by screen → take desktop-viewport screenshots → read DOM and computed styles → collect and localize static assets → write `webui-theme.txt` in the sample's writing style.

Enabled capabilities: navigation-click screen discovery, static asset localization, authenticated sessions. The current version does not require both desktop and mobile screenshot sizes; a second size is added only when the site has obvious responsive differences and the user asks for it.

### word-theme (stage 2)

Number every description in `webui-theme.txt` as `D-xxx` and transcribe it, following the template, into design language, design tokens, layout system, component list, per-page specifications, interaction state machines, asset and fallback strategies, implementation constraints, a traceability matrix and an acceptance checklist. Rules: add no requirements, lose no details, and state parameters as concrete values. Items with insufficient evidence go into the "To be confirmed" table for user confirmation; fabrication is forbidden.

### web-maker (stage 3)

Read `pipeline.json.projectType`, load the matching project form document, and generate the project strictly from `copy-themeUI.md`: design tokens mapped into `tailwind.config.js` and CSS variables, global shell, reusable components, per-page routes and views, interaction flows, mock data, responsive behavior and motion, and static asset wiring. Finish with dependency installation and build verification, generate `web/README.md`, and check off the acceptance checklist item by item.

| Form | Key conventions |
| --- | --- |
| `vue3-js` | Vite `^5.4.0`, Vue `^3.5.0`, Vue Router `^4.4.0`, TailwindCSS `^3.4.0` (classic `tailwind.config.js`), `<script setup>`, no `.ts` files |
| `vue3-ts` | Same, plus TypeScript `~5.6.0` and `vue-tsc` `^2.1.0`, `<script setup lang="ts">`, type definitions and `npm run typecheck` |

Both require Node.js ≥ 20, and `npm install`, `npm run build` and `npm run dev` must succeed.

### Asset Localization Script

```bash
node scripts/fetch-assets.mjs ./copy-web-out/scan/assets-manifest.json
```

In the manifest, `outputDir` points at the output directory and `assets[].path` is relative to `scan/assets/`. The script downloads assets into `scan/assets/` and writes the results to `scan/fetch-result.json`. If any download fails it exits with code 1, and the failed entries must be recorded in the `gaps` of `scan/manifest.json`. Manifest files with a UTF-8 BOM on Windows are supported.

## 5. Sample and Documentation Conventions

`references/sample/achen-theme-description.txt` is a user-supplied textual description of an Apple-style Bento Grid multi-function dashboard. It serves two purposes:

1. As the **writing style and level-of-detail sample** for `webui-theme.txt`: overall style → site layout → each functional screen described one by one → details and fixes, written as natural Chinese prose.
2. As the **source for template extraction**: the sections and fields of the two templates under `assets/templates/` were derived from this sample.

The sample is not a pipeline input and is not a standalone acceptance case. Handwritten or externally supplied description text must not be wired in directly as `webui-theme.txt`; only intermediate artifacts previously generated by this pipeline with status `done` may be reused.

## 6. Adding a Component

1. Copy `assets/templates/component.template.md` to `references/components/<component-name>.md`; use lowercase hyphenated names.
2. Fill in the metadata table, I/O contract, workflow, quality checks, failure handling, component boundaries and extension points.
3. Append a row to the component registry in `SKILL.md`, and update the directory structure, file contract and data-flow diagram in `references/pipeline.md`.
4. Put deterministic logic in `scripts/`, artifact skeletons in `assets/templates/`, and long documents in `references/`.
5. Components exchange data only through the agreed files. Adding new artifact files does not bump the contract version; renaming existing ones requires bumping `contractVersion` and updating all component documents.

Possible future additions: dual-size mobile scanning, dark-theme scanning, visual regression comparison, component unit tests, i18n string extraction, static deployment.

## 7. Constraints and Known Boundaries

- Reproduce only what is visible. Inventing unobserved features, fields or data is forbidden; anything unreachable goes into `gaps`.
- No backend, no UI component libraries outside the specification, no real orders or payment requests.
- In-page scripts only read from the site; they must not modify site data. Stop and report on login failure.
- The skill contains no automatically executed program. At runtime CodeBuddy dispatches work according to `SKILL.md` and the component documents; browser automation depends on the `agent-browser` / `playwright-cli` skills.
- No usable Python is available on this machine, so skill-creator's `init_skill.py` and `package_skill.py` were not run; the directory was created manually to spec. To install or distribute, copy the directory directly or zip it yourself.
- The project specification is locked to TailwindCSS v3 classic configuration. Tailwind v4 support requires a new project form document rather than changing the existing contract.

## 8. Verification Record (v1.0.0)

| Check | Result |
| --- | --- |
| `SKILL.md` frontmatter | Pass: `name: copy-web` is valid, description has no angle brackets |
| Contract files complete | Pass: all 14 core files exist (excluding this guide) |
| `fetch-assets.mjs` syntax | Pass: `node --check` reports no errors |
| `fetch-assets.mjs` behavior | Pass: data-URL self-test download succeeds, result file correct, BOM compatible, exit code 0 |
| Lint diagnostics | Pass: 0 |
| Bilingual documentation | Pass: `README.md` (Chinese) and `README.en.md` (English) are kept in sync |
| Temporary test files | Cleaned up |

## 9. Versioning Rules

- `v1.0.0` is the current stable version; pipeline contract version is `1.0.0`.
- Adding components, appending documentation or fixing wording is backward compatible and does not bump the contract version.
- Renaming existing artifact files, changing the directory structure or changing `pipeline.json` fields is a breaking change: bump the contract version and update all component documents and templates.
