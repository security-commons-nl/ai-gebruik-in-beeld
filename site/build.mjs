// Build script: converts the Markdown chapters and KQL queries into a single
// static index.html with tab navigation and visual components. Output: dist/.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { marked } from 'marked';

import {
  escapeHtml, cardsFromTable, stepsFromList, tilesFromList,
  calloutFromBlockquote, adviceFromParagraph, chapterHeading,
} from './transforms.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const REPO_URL = 'https://github.com/security-commons-nl/ai-gebruik-in-beeld';

/** Tab manifest: source file, stable section id, short tab label, card title. */
const TABS = [
  { file: 'README.md', id: 'start', label: 'Start' },
  { file: 'draaiboek.md', id: 'draaiboek', label: 'Draaiboek', title: 'AI-gebruik in beeld brengen' },
];

const QUERY_FILES = [
  'ai-probe-bronnen.kql',
  'ai-noemer-apparaten.kql',
  'ai-diensten-netwerk.kql',
  'ai-diensten-per-proces.kql',
  'ai-contentverkeer.kql',
  'ai-directe-api.kql',
  'ai-software-inventaris.kql',
  'ai-ingebedde-assistent-schoon.kql',
  'ai-assistent-interacties.kql',
  'ai-office-apps-naar-ai.kql',
  'ai-browserextensies.kql',
  'ai-mailtoegang-apps.kql',
  'ai-organisatie-splitsing.kql',
  'ai-afdelingsclustering.kql',
  'ai-volledigheidssweep.kql',
];

/** Slug -> {num, title, id} map used by the card transform. */
const CHAPTER_META = new Map(
  TABS.filter((t) => t.title).map((t) => [t.id, { num: t.id.slice(0, 2), title: t.title, id: t.id }]),
);
CHAPTER_META.set('queries', { num: 'KQL', title: "Herbruikbare query's", id: 'queries' });

/**
 * Reads a site hint from an HTML-comment token.
 * @param {object} token Marked token.
 * @returns {string|null} Hint name or null.
 */
function readHint(token) {
  if (token.type !== 'html') return null;
  const m = token.text.match(/<!--\s*site:([a-z]+)\s*-->/);
  return m ? m[1] : null;
}

/**
 * Renders one Markdown token, applying a hint or heuristics where they match.
 * @param {object} token Marked token.
 * @param {{hint: string|null, lastH2: string, afterH1: boolean}} ctx Render context.
 * @returns {string} HTML for this token.
 */
function renderToken(token, ctx) {
  if (token.type === 'heading' && token.depth === 1) return chapterHeading(token);
  if (token.type === 'paragraph' && ctx.afterH1) {
    return `<p class="lead">${marked.parseInline(token.text.replace(/\n/g, ' '))}</p>`;
  }
  if (token.type === 'table') {
    const isContents = ctx.hint === 'cards'
      || token.header.some((h) => h.text.toLowerCase().includes('voor wie'));
    if (isContents) return cardsFromTable(token, CHAPTER_META);
    return `<div class="tablewrap">${marked.parser([token])}</div>`;
  }
  if (token.type === 'list' && token.ordered) {
    if (ctx.hint === 'steps' || ctx.lastH2.startsWith('volgorde')) return stepsFromList(token);
    if (ctx.hint === 'tiles' || ctx.lastH2.startsWith('drie uitgangspunten')) return tilesFromList(token);
  }
  if (token.type === 'blockquote' || ctx.hint === 'callout') {
    if (token.type === 'blockquote') return calloutFromBlockquote(token);
    return `<div class="callout">${marked.parser([token])}</div>`;
  }
  if (token.type === 'paragraph' && token.text.startsWith('**Advies:**')) {
    return adviceFromParagraph(token);
  }
  return marked.parser([token]);
}

/**
 * Renders a chapter's Markdown to section body HTML via the token walker.
 * @param {string} markdown Raw Markdown.
 * @returns {string} Section body HTML.
 */
function renderBody(markdown) {
  const tokens = marked.lexer(markdown, { gfm: true });
  const ctx = { hint: null, lastH2: '', afterH1: false };
  let html = '';
  for (const token of tokens) {
    const hint = readHint(token);
    if (hint) { ctx.hint = hint; continue; }
    if (ctx.hint === 'hide' && token.type !== 'space') { ctx.hint = null; continue; }
    if (token.type === 'space') continue;
    if (token.type === 'heading' && token.depth === 2) ctx.lastH2 = token.text.toLowerCase();
    html += renderToken(token, ctx);
    ctx.afterH1 = token.type === 'heading' && token.depth === 1;
    ctx.hint = null;
  }
  return html;
}

/**
 * Rewrites relative repo links in rendered HTML to in-page tab anchors.
 * @param {string} html Rendered chapter HTML.
 * @returns {string} HTML with rewritten hrefs.
 */
function rewriteLinks(html) {
  return html
    .replace(/href="(\d{2}-[a-z0-9-]+)\.md"/g, 'href="#$1"')
    .replace(/href="queries\/[^"]*"/g, 'href="#queries"')
    .replace(/href="LICENSE"/g, `href="${REPO_URL}/blob/main/LICENSE"`);
}

/**
 * Extracts the "Doel:" sentence from a KQL file's leading comment block.
 * @param {string} source Raw KQL file content.
 * @returns {string} Short purpose description, or an empty string.
 */
function queryPurpose(source) {
  const header = [];
  for (const line of source.split('\n')) {
    if (!line.startsWith('//')) break;
    header.push(line.replace(/^\/\/\s?/, '').trim());
  }
  const text = header.join(' ');
  const match = text.match(/Doel:\s*(.*?)\s*(?:Vereist:|Bewuste beperkingen|$)/);
  return match ? match[1].trim() : '';
}

/**
 * Builds the HTML for the queries tab: one expandable card per KQL file.
 * @returns {string} Section inner HTML.
 */
function buildQueriesSection() {
  const blocks = QUERY_FILES.map((name, i) => {
    const source = readFileSync(join(ROOT, 'queries', name), 'utf8').trimEnd();
    const purpose = queryPurpose(source);
    return [
      `<article class="query" style="--d:${i}">`,
      `<h2><code>${escapeHtml(name)}</code></h2>`,
      purpose ? `<p class="query-doel">${escapeHtml(purpose)}</p>` : '',
      `<details><summary>Toon query</summary>`,
      `<div class="codewrap"><button class="copy" type="button" data-copy>Kopieer</button>`,
      `<pre><code>${escapeHtml(source)}</code></pre></div></details>`,
      `</article>`,
    ].join('\n');
  });
  return [
    `<header class="chapter-head"><span class="chapter-num">KQL</span><h1>Herbruikbare query's</h1></header>`,
    `<p class="lead">Voor Microsoft Defender Advanced Hunting. Pas parent-processen en uitsluitingen aan op je`,
    ` eigen omgeving; de toelichting staat in de commentaarregels van elke query.</p>`,
    ...blocks,
  ].join('\n');
}

/**
 * Assembles the complete index.html document.
 * @returns {string} Full HTML document.
 */
function buildPage() {
  const css = ['base.css', 'components.css']
    .map((f) => readFileSync(join(ROOT, 'site', f), 'utf8')).join('\n');
  const js = readFileSync(join(ROOT, 'site', 'page.js'), 'utf8');
  const allTabs = [...TABS, { id: 'queries', label: "Query's" }];
  const nav = allTabs
    .map((t) => `<button type="button" class="tab" data-target="${t.id}">${escapeHtml(t.label)}</button>`)
    .join('\n');
  const sections = [
    ...TABS.map((t) => {
      const body = rewriteLinks(renderBody(readFileSync(join(ROOT, t.file), 'utf8')));
      return `<section id="${t.id}" class="tab-panel" aria-label="${escapeHtml(t.label)}">\n${body}\n</section>`;
    }),
    `<section id="queries" class="tab-panel" aria-label="Query's">\n${buildQueriesSection()}\n</section>`,
  ].join('\n');
  return `<!doctype html>
<html lang="nl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>AI-gebruik in beeld brengen · Security Commons NL</title>
<meta name="description" content="Evidence-based methode om als gemeente de security posture te verhogen, met ClickFix als casus.">
<style>
${css}
</style>
</head>
<body>
<header class="site-header">
  <div class="inner masthead">
    <span class="site-kicker">Security Commons NL</span>
    <span class="site-title">AI-gebruik in beeld</span>
  </div>
  <nav class="tabs inner" aria-label="Hoofdstukken">
${nav}
  </nav>
</header>
<main class="inner">
${sections}
</main>
<footer class="inner">
  <p>Licentie: <a href="${REPO_URL}/blob/main/LICENSE">EUPL-1.2</a> ·
     Bron en wijzigingsgeschiedenis: <a href="${REPO_URL}">GitHub</a> ·
     Deze pagina wordt automatisch gegenereerd uit de Markdown-bron.</p>
</footer>
<script>
${js}
</script>
</body>
</html>
`;
}

mkdirSync(join(ROOT, 'dist'), { recursive: true });
writeFileSync(join(ROOT, 'dist', 'index.html'), buildPage());
writeFileSync(join(ROOT, 'dist', '.nojekyll'), '');
console.log('Wrote dist/index.html');
