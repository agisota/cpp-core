import { marked, type Tokens } from "marked";
import hljs from "highlight.js";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { spawnSync } from "child_process";
import { join } from "path";

// ── Configuration ────────────────────────────────────────────────────────────

const PAPER_ROOT = "/home/dev/serialization_design/paper";
const BUILD_DIR  = "/home/dev/serialization_design/paper/build";
const HTML_DIR   = join(BUILD_DIR, "html");
const PDF_DIR    = join(BUILD_DIR, "pdf");

// ── Per-document running headers ──────────────────────────────────────────────
// Shown in @top-center margin box. Cover gets empty string (no header).
const DOC_RUNNING_HEADERS: Record<string, string> = {
  "cover":             "",
  "investor-briefing": "Investor Briefing",
  "executive-summary": "Executive Summary",
  "master":            "Master Document",
  "paper-main":        "Working Paper",
  "deep-hypothesis":   "Deep Hypothesis",
  "financial-model":   "Financial Model",
  "one-pager":         "One-Pager",
};

// ── Title page HTML builder ───────────────────────────────────────────────────
// Prepended to master and paper-main so they open with a proper cover page.

function buildTitlePageHtml(
  title: string,
  subtitle: string,
  meta: string,
): string {
  // height:250mm fills A4 content area (297mm - 22mm top - 25mm bottom margins)
  // The sentinel div with page-break-before:always forces the markdown content
  // that follows to begin on a fresh page in Chromium headless --print-to-pdf.
  // height:250mm fills A4 content area causing natural overflow to next page.
  // No explicit page-break sentinel needed — the overflow itself advances the page.
  return `<div class="title-page">
  <div class="tp-logo">C&thinsp;P&thinsp;P</div>
  <h1 class="tp-title">${title}</h1>
  <p class="tp-subtitle">${subtitle}</p>
  <div class="tp-divider"></div>
  <div class="tp-meta">${meta}</div>
</div>
`;
}

// ── Colophon HTML block ───────────────────────────────────────────────────────
// Appended to master and paper-main before rendering
const COLOPHON_HTML = `
<div class="colophon">
  <h2>Colophon</h2>
  <p>Set in Inter and JetBrains Mono via system-ui stack.</p>
  <p>Rendered Markdown &rarr; HTML &rarr; PDF via marked + Chromium headless.</p>
  <p>Source: <a href="https://github.com/agisota/cpp-core">github.com/agisota/cpp-core</a></p>
  <p>Version: 0.1 &middot; 2026-05-21</p>
  <p>Contact: <a href="mailto:founder@cpp.dev">founder@cpp.dev</a></p>
  <p>CPP is an open standard, MIT licensed. This paper is the working draft, version&nbsp;0.1.</p>
</div>
`;

mkdirSync(HTML_DIR, { recursive: true });
mkdirSync(PDF_DIR,  { recursive: true });

// ── Highlight.js CSS (embedded — no CDN) ─────────────────────────────────────

const HLJS_CSS = readFileSync(
  join(BUILD_DIR, "node_modules/highlight.js/styles/atom-one-dark.min.css"),
  "utf-8"
);

// ── ASCII-art detection ───────────────────────────────────────────────────────
// Lines starting with box-drawing chars indicate ASCII art / box diagrams

const ASCII_ART_PATTERN = /^[╭╔┌╞╠╒╓╤╥╦║╫╪╬╧╨╩╪╫╬╭╮╰╯─━│┃┄┅┆┇┈┉┊┋┌┐└┘├┤┬┴┼╔╗╚╝╠╣╦╩╬╟╢╞╡╒╓╖╕╘╙╜╛█▄▀]/m;

function isAsciiArt(code: string): boolean {
  return ASCII_ART_PATTERN.test(code);
}

// ── Marked configuration ─────────────────────────────────────────────────────
// smartypants: false — prevents smart-quote corruption of ASCII art
// Server-side syntax highlighting via highlight.js

const renderer = new marked.Renderer();

// Override code block rendering: server-side highlight + ascii-art class
renderer.code = function({ text, lang }: Tokens.Code): string {
  const asciiClass = isAsciiArt(text) ? " ascii-art" : "";

  // Escape HTML entities in the code (marked already does this but be safe)
  const escapeHtml = (s: string) =>
    s.replace(/&/g, "&amp;")
     .replace(/</g, "&lt;")
     .replace(/>/g, "&gt;")
     .replace(/"/g, "&quot;");

  if (lang && hljs.getLanguage(lang)) {
    try {
      const highlighted = hljs.highlight(text, { language: lang, ignoreIllegals: true }).value;
      return `<pre class="hljs${asciiClass}"><code class="hljs language-${lang}">${highlighted}</code></pre>\n`;
    } catch (_) {
      // fall through to auto-detect
    }
  }

  // No language specified — try auto-detect, but only for non-ASCII-art
  if (!asciiClass) {
    try {
      const result = hljs.highlightAuto(text, undefined);
      if (result.relevance > 5) {
        return `<pre class="hljs${asciiClass}"><code class="hljs language-${result.language}">${result.value}</code></pre>\n`;
      }
    } catch (_) {
      // fall through to plain
    }
  }

  return `<pre class="${asciiClass}"><code>${escapeHtml(text)}</code></pre>\n`;
};

marked.use({
  renderer,
  gfm: true,
  breaks: false,
  // @ts-ignore — marked v14 drops pedantic but still accepts it silently
  smartypants: false,
  // Prevent smart quote / dash substitution
  smartLists: false,
} as Parameters<typeof marked.use>[0]);

// ── Source files ──────────────────────────────────────────────────────────────

const FILES: Array<{ src: string; out: string; title: string; isCover?: boolean }> = [
  { src: "COVER.md",             out: "cover",             title: "CPP — Cover · Context Provenance Protocol",            isCover: true },
  { src: "INVESTOR-BRIEFING.md", out: "investor-briefing", title: "CPP — Investor Briefing · Context Provenance Protocol" },
  { src: "00-EXECUTIVE-SUMMARY.md", out: "executive-summary", title: "CPP — Executive Summary · Context Provenance Protocol" },
  { src: "MASTER.md",            out: "master",            title: "CPP — Master Document · Context Provenance Protocol" },
  { src: "01-PAPER.md",          out: "paper-main",        title: "CPP — Main Paper · Context Provenance Protocol" },
  { src: "02-DEEP-HYPOTHESIS.md",out: "deep-hypothesis",   title: "CPP — Deep Hypothesis · Context Provenance Protocol" },
  { src: "05-FINANCIAL-MODEL.md",out: "financial-model",   title: "CPP — Financial Model · Context Provenance Protocol" },
  { src: "strategy/one-pager.md",out: "one-pager",         title: "CPP — One-Pager · Context Provenance Protocol" },
];

// ── Template ──────────────────────────────────────────────────────────────────

const templateHtml = readFileSync(join(BUILD_DIR, "template.html"), "utf-8");

function renderHtml(title: string, content: string, bodyClass: string, runningHeader: string): string {
  // Build a small CSS block that sets the --running-header custom property.
  // Chromium headless supports CSS custom properties in @page margin boxes
  // via the content property referencing var(). We inject it as a <style> block.
  // For the cover, suppress the @top-left "Context Provenance Protocol" text too.
  let runningHeaderCss: string;
  if (!runningHeader) {
    // Cover page: blank out all running headers
    runningHeaderCss = `
      @page { @top-left { content: ""; } @top-center { content: ""; } @top-right { content: ""; } @bottom-center { content: ""; } }
    `;
  } else {
    runningHeaderCss = `
      @page { @top-center { content: "${runningHeader}"; font-family: system-ui, -apple-system, sans-serif; font-size: 7.5pt; color: #888888; } }
    `;
  }

  return templateHtml
    .replace("{{TITLE}}", title)
    .replace("{{CONTENT}}", content)
    .replace("{{BODY_CLASS}}", bodyClass)
    .replace("{{HLJS_CSS}}", HLJS_CSS)
    .replace("{{RUNNING_HEADER_CSS}}", runningHeaderCss);
}

// ── Markdown → HTML ───────────────────────────────────────────────────────────

function mdToHtml(mdPath: string): string {
  const md = readFileSync(mdPath, "utf-8");
  return marked.parse(md) as string;
}

// ── Cover HTML — bespoke single-page layout ───────────────────────────────────
// Returns a self-contained HTML document (no template) that fits exactly 1 A4 page.
// Bypasses COVER.md markdown parsing; uses curated content with CSS transform scaling.
function buildCoverHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>CPP — Cover · Context Provenance Protocol</title>
  <style>
    @page {
      size: A4;
      margin: 0;
      @top-left   { content: ""; }
      @top-center { content: ""; }
      @top-right  { content: ""; }
      @bottom-center { content: ""; }
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body {
      width: 210mm;
      height: 297mm;
      overflow: hidden;
      background: #050505;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    body {
      font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
      color: #e8e8e0;
      background: linear-gradient(to bottom, #000000 0%, #0d0d0d 55%, #050505 100%);
    }
    .page {
      width: 210mm;
      height: 297mm;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 16mm 14mm 12mm;
      position: relative;
    }
    .logo {
      font-size: 9pt;
      color: #00d4aa;
      line-height: 1.25;
      text-align: center;
      letter-spacing: 0;
      white-space: pre;
      margin-bottom: 10mm;
      text-shadow: 0 0 24px rgba(0,212,170,0.4);
    }
    .title-block {
      text-align: center;
      margin-bottom: 8mm;
    }
    .title {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      font-size: 28pt;
      font-weight: 800;
      letter-spacing: -0.025em;
      color: #ffffff;
      line-height: 1.1;
      margin-bottom: 3mm;
    }
    .subtitle {
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 10pt;
      font-weight: 400;
      color: #888888;
      letter-spacing: 0.12em;
      text-transform: uppercase;
    }
    .divider {
      width: 100%;
      height: 0.5pt;
      background: linear-gradient(to right, transparent, rgba(0,212,170,0.35), transparent);
      margin: 5mm 0;
    }
    .tagline {
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 10pt;
      color: #aaaaaa;
      text-align: center;
      margin-bottom: 7mm;
      font-style: italic;
      letter-spacing: 0.02em;
    }
    .toc {
      width: 100%;
      border: 0.5pt solid rgba(0,212,170,0.2);
      border-radius: 3pt;
      padding: 5mm 6mm;
      margin-bottom: 7mm;
      font-size: 8pt;
      color: #cccccc;
      line-height: 1.7;
    }
    .toc-row {
      display: flex;
      gap: 6mm;
    }
    .toc-num {
      color: #00d4aa;
      font-weight: 700;
      min-width: 6mm;
      flex-shrink: 0;
    }
    .toc-text {
      color: #cccccc;
    }
    .key-number {
      background: rgba(0,212,170,0.07);
      border: 0.5pt solid rgba(0,212,170,0.25);
      border-radius: 3pt;
      padding: 4mm 8mm;
      text-align: center;
      margin-bottom: 7mm;
      width: 100%;
    }
    .key-number .value {
      font-size: 30pt;
      font-weight: 800;
      color: #00d4aa;
      letter-spacing: -0.03em;
      line-height: 1;
    }
    .key-number .label {
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 8pt;
      color: #888888;
      margin-top: 1.5mm;
      letter-spacing: 0.04em;
    }
    .meta-row {
      display: flex;
      gap: 4mm;
      flex-wrap: wrap;
      justify-content: center;
      font-size: 7.5pt;
      color: #555555;
      margin-bottom: 5mm;
    }
    .meta-item {
      display: flex;
      align-items: center;
      gap: 1.5mm;
    }
    .dot {
      width: 3pt;
      height: 3pt;
      border-radius: 50%;
      background: #00d4aa;
      display: inline-block;
      flex-shrink: 0;
    }
    .footer-bar {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 22pt;
      background: rgba(0,212,170,0.06);
      border-top: 0.5pt solid rgba(0,212,170,0.2);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 10mm;
      font-size: 7pt;
      color: #444444;
      letter-spacing: 0.06em;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .footer-bar a { color: #444444; text-decoration: none; }
  </style>
</head>
<body>
<div class="page">
  <div class="logo">  ██████╗ ██████╗  ██████╗
 ██╔════╝██╔══██╗██╔══██╗
 ██║     ██████╔╝██████╔╝
 ██║     ██╔═══╝ ██╔═══╝
 ╚██████╗██║     ██║
  ╚═════╝╚═╝     ╚═╝</div>

  <div class="title-block">
    <div class="title">Context Provenance Protocol</div>
    <div class="subtitle">Canonical Infrastructure for the AI Economy</div>
  </div>

  <div class="divider"></div>

  <div class="tagline">Тот, кто канонизирует первым — становится infrastructure layer.</div>

  <div class="toc">
    <div class="toc-row"><span class="toc-num">01</span><span class="toc-text">Парадокс масштабирования — 687 MB сессий, 13 worktrees, 9 с байт-идентичным контекстом</span></div>
    <div class="toc-row"><span class="toc-num">02</span><span class="toc-text">Теория канонизации — DAG-CBOR + CIDv1, детерминизм как основа верификации</span></div>
    <div class="toc-row"><span class="toc-num">03</span><span class="toc-text">Глубинная гипотеза — canonical hashes как substrate для AI feedback loops</span></div>
    <div class="toc-row"><span class="toc-num">04</span><span class="toc-text">Финансовая модель — $400K ARR Y1 · $12M ARR Y3 · bear / base / bull</span></div>
    <div class="toc-row"><span class="toc-num">05</span><span class="toc-text">План действий — 12-недельный операционный календарь с конференциями и fundraising</span></div>
  </div>

  <div class="key-number">
    <div class="value">−70%</div>
    <div class="label">экономии на LLM input-токенах для команд с shared context · подтверждено на реальных данных</div>
  </div>

  <div class="meta-row">
    <span class="meta-item"><span class="dot"></span>Working paper v0.1</span>
    <span class="meta-item"><span class="dot"></span>2026-05-21</span>
    <span class="meta-item"><span class="dot"></span>MIT + CC BY 4.0</span>
    <span class="meta-item"><span class="dot"></span>83 tests passing</span>
    <span class="meta-item"><span class="dot"></span>TypeScript + Bun</span>
  </div>

  <div class="footer-bar">
    <span>github.com/agisota/cpp-core</span>
    <span>Issue 01 · 2026-05</span>
    <span>founder@cpp.dev</span>
  </div>
</div>
</body>
</html>`;
}

// ── HTML → PDF via Chromium ───────────────────────────────────────────────────

function htmlToPdf(htmlPath: string, pdfPath: string): boolean {
  const result = spawnSync("/usr/bin/chromium", [
    "--headless",
    "--no-sandbox",
    "--disable-gpu",
    "--disable-dev-shm-usage",
    "--run-all-compositor-stages-before-draw",
    "--virtual-time-budget=10000",
    `--print-to-pdf=${pdfPath}`,
    "--no-pdf-header-footer",
    "--print-to-pdf-no-header",
    `file://${htmlPath}`,
  ], { stdio: "inherit", timeout: 90000 });

  return result.status === 0;
}

// ── Main build loop ───────────────────────────────────────────────────────────

console.log("CPP Paper Builder v2\n" + "=".repeat(50));

interface Result { out: string; html: boolean; pdf: boolean; error?: string }
const results: Result[] = [];

for (const file of FILES) {
  const srcPath  = join(PAPER_ROOT, file.src);
  const htmlPath = join(HTML_DIR, `${file.out}.html`);
  const pdfPath  = join(PDF_DIR,  `${file.out}.pdf`);

  process.stdout.write(`\n[${file.out.padEnd(20)}] `);

  if (!existsSync(srcPath)) {
    console.log(`SKIP — source not found`);
    results.push({ out: file.out, html: false, pdf: false, error: "source not found" });
    continue;
  }

  // Markdown → HTML
  let htmlOk = false;
  try {
    let fullHtml: string;
    if (file.isCover) {
      // Cover uses a bespoke single-page layout, not the markdown template
      fullHtml = buildCoverHtml();
    } else {
      let content = mdToHtml(srcPath);
      // Prepend title page + append colophon for master and paper-main
      if (file.out === "paper-main") {
        const titlePage = buildTitlePageHtml(
          "Context Provenance Protocol",
          "От оптимизации затрат к игротеоретической инфраструктуре обратной связи",
          "Working paper · v0.1 · 2026-05-21<br>github.com/agisota/cpp-core",
        );
        content = titlePage + content;
        content += COLOPHON_HTML;
      } else if (file.out === "master") {
        const titlePage = buildTitlePageHtml(
          "Context Provenance Protocol",
          "Master Document — полный корпус",
          "Working paper · v0.1 · 2026-05-21<br>github.com/agisota/cpp-core",
        );
        content = titlePage + content;
        content += COLOPHON_HTML;
      }
      const runningHeader = DOC_RUNNING_HEADERS[file.out] ?? "";
      fullHtml = renderHtml(file.title, content, "", runningHeader);
    }
    writeFileSync(htmlPath, fullHtml, "utf-8");
    process.stdout.write("HTML OK  ");
    htmlOk = true;
  } catch (e) {
    console.log(`HTML FAIL — ${e}`);
    results.push({ out: file.out, html: false, pdf: false, error: String(e) });
    continue;
  }

  // HTML → PDF
  const pdfOk = htmlToPdf(htmlPath, pdfPath);
  process.stdout.write(pdfOk ? "PDF OK" : "PDF FAIL");
  results.push({ out: file.out, html: htmlOk, pdf: pdfOk });
}

// ── Summary ───────────────────────────────────────────────────────────────────

console.log("\n\n" + "=".repeat(50));
console.log("Build summary:\n");
for (const r of results) {
  const status = r.pdf ? "OK" : r.html ? "HTML only" : "FAIL";
  console.log(`  ${status.padEnd(12)} ${r.out}${r.error ? "  <- " + r.error : ""}`);
}
const pdfCount = results.filter(r => r.pdf).length;
console.log(`\n${pdfCount}/${FILES.length} PDFs produced.\n`);

// ── Index page ────────────────────────────────────────────────────────────────

generateIndex(results);
console.log("Index HTML written -> html/index.html");

// ─────────────────────────────────────────────────────────────────────────────

interface DocMeta { out: string; title: string; description: string; readingTime: string; stars: string; category: string }

function generateIndex(results: Result[]): void {
  const docs: DocMeta[] = [
    { out: "cover",             title: "Cover Page",        description: "CPP working paper cover with logo, table of contents overview, and key number (-70%).",                                                            readingTime: "1 min",  stars: "★★★★★", category: "overview"  },
    { out: "investor-briefing", title: "Investor Briefing", description: "Full investor pitch: key metrics, market size, traction, financial scenario, team, risks, and round details.",                                       readingTime: "8 min",  stars: "★★★★★", category: "investor"  },
    { out: "executive-summary", title: "Executive Summary", description: "One-page summary: numerical hypothesis, TAM/SAM/SOM, investment strategy, team, key risks, and investor paragraph.",                                 readingTime: "5 min",  stars: "★★★★★", category: "overview"  },
    { out: "master",            title: "Master Document",   description: "The complete compiled corpus — all sections in one document. Start here for the full picture.",                                                       readingTime: "60+ min",stars: "★★★★★", category: "complete"  },
    { out: "paper-main",        title: "Main Paper",        description: "Full research paper (~15K words): problem, theory, prior art, real validation, economic model, deep hypothesis, architecture, GTM, investment.",      readingTime: "50 min", stars: "★★★★★", category: "technical" },
    { out: "deep-hypothesis",   title: "Deep Hypothesis",   description: "Philosophical and strategic core: canonical hashes as game-theoretic substrate for AI feedback loops.",                                               readingTime: "20 min", stars: "★★★★☆", category: "technical" },
    { out: "financial-model",   title: "Financial Model",   description: "3-year financial model: revenue by year, unit economics (ARPU, CAC, LTV), OpEx, bear/base/bull sensitivity analysis.",                               readingTime: "15 min", stars: "★★★★★", category: "investor"  },
    { out: "one-pager",         title: "One-Pager",         description: "Cold outreach one-pager: problem, solution, metrics, market, team, ask. Fits one scroll.",                                                           readingTime: "3 min",  stars: "★★★★★", category: "investor"  },
  ];

  const catColors: Record<string, string> = { overview: "#6c7ae0", investor: "#00d4aa", technical: "#e07a5f", complete: "#1a1a1a" };
  const catLabels: Record<string, string> = { overview: "Overview", investor: "Investor", technical: "Technical", complete: "Complete" };

  const cards = docs.map(doc => {
    const res = results.find(r => r.out === doc.out);
    const pdfBtn  = res?.pdf  ? `<a class="btn btn-pdf"  href="../pdf/${doc.out}.pdf" target="_blank">PDF</a>`  : `<span class="btn btn-pdf btn-disabled">PDF</span>`;
    const htmlBtn = res?.html ? `<a class="btn btn-html" href="${doc.out}.html" target="_blank">HTML</a>` : `<span class="btn btn-html btn-disabled">HTML</span>`;
    const color = catColors[doc.category] ?? "#999";
    const label = catLabels[doc.category] ?? doc.category;
    return `
    <div class="card">
      <div class="card-header">
        <span class="badge" style="background:${color}">${label}</span>
        <span class="read-time">${doc.readingTime}</span>
      </div>
      <h3 class="card-title">${doc.title}</h3>
      <p class="card-desc">${doc.description}</p>
      <div class="card-stars">${doc.stars}</div>
      <div class="card-actions">${pdfBtn}${htmlBtn}</div>
    </div>`;
  }).join("\n");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Context Provenance Protocol &#8212; Paper Collection</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: #0e0f11; color: #e8e8e4; min-height: 100vh; -webkit-font-smoothing: antialiased; }
    .hero { background: linear-gradient(160deg, #0e0f11 0%, #131820 60%, #0d1a17 100%); border-bottom: 1px solid rgba(0,212,170,0.15); padding: 80px 24px 64px; text-align: center; }
    .hero-logo { font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace; font-size: clamp(22px,5vw,40px); font-weight: 700; color: #00d4aa; letter-spacing: 0.14em; margin-bottom: 18px; text-shadow: 0 0 40px rgba(0,212,170,0.35); }
    .hero-title { font-size: clamp(26px,4vw,46px); font-weight: 700; color: #fff; letter-spacing: -0.025em; line-height: 1.15; margin-bottom: 14px; }
    .hero-sub { font-size: clamp(14px,2vw,17px); color: #888; max-width: 540px; margin: 0 auto 32px; line-height: 1.65; }
    .hero-meta { display: flex; gap: 20px; justify-content: center; flex-wrap: wrap; font-size: 12px; color: #555; }
    .hero-meta span { display: flex; align-items: center; gap: 6px; }
    .dot { width: 5px; height: 5px; border-radius: 50%; background: #00d4aa; display: inline-block; }
    .main { max-width: 1100px; margin: 0 auto; padding: 60px 24px 80px; }
    .section-head { display: flex; align-items: center; gap: 16px; margin-bottom: 32px; }
    .section-head h2 { font-size: 18px; font-weight: 600; color: #fff; white-space: nowrap; }
    .section-head .line { flex: 1; height: 1px; background: rgba(255,255,255,0.07); }
    .grid { display: grid; grid-template-columns: repeat(auto-fill,minmax(300px,1fr)); gap: 20px; }
    .card { background: #13161a; border: 1px solid rgba(255,255,255,0.07); border-radius: 12px; padding: 24px; display: flex; flex-direction: column; transition: border-color 0.2s, transform 0.15s, box-shadow 0.2s; }
    .card:hover { border-color: rgba(0,212,170,0.3); transform: translateY(-2px); box-shadow: 0 8px 32px rgba(0,212,170,0.08); }
    .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
    .badge { font-size: 10px; font-weight: 600; letter-spacing: 0.09em; text-transform: uppercase; padding: 3px 8px; border-radius: 4px; color: #fff; }
    .read-time { font-size: 12px; color: #555; }
    .card-title { font-size: 18px; font-weight: 600; color: #fff; letter-spacing: -0.01em; margin-bottom: 8px; line-height: 1.3; }
    .card-desc { font-size: 13px; color: #888; line-height: 1.6; flex: 1; margin-bottom: 14px; }
    .card-stars { font-size: 13px; color: #f0c040; margin-bottom: 16px; letter-spacing: 2px; }
    .card-actions { display: flex; gap: 10px; }
    .btn { display: inline-block; font-size: 11px; font-weight: 600; letter-spacing: 0.07em; text-transform: uppercase; padding: 7px 16px; border-radius: 6px; text-decoration: none; cursor: pointer; transition: background 0.15s; }
    .btn-pdf { background: #00d4aa; color: #0e0f11; }
    .btn-pdf:hover { background: #00ebbf; }
    .btn-html { background: rgba(255,255,255,0.07); color: #ccc; border: 1px solid rgba(255,255,255,0.1); }
    .btn-html:hover { background: rgba(255,255,255,0.12); color: #fff; }
    .btn-disabled { opacity: 0.25; cursor: not-allowed; pointer-events: none; }
    .reading-guide { margin-top: 56px; background: #13161a; border: 1px solid rgba(0,212,170,0.15); border-radius: 12px; padding: 32px; }
    .reading-guide h2 { font-size: 18px; font-weight: 600; color: #fff; margin-bottom: 24px; }
    .tracks { display: grid; grid-template-columns: repeat(auto-fill,minmax(220px,1fr)); gap: 20px; }
    .track { border-left: 2px solid #00d4aa; padding-left: 16px; }
    .track-label { font-size: 10px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #00d4aa; margin-bottom: 6px; }
    .track-name { font-size: 14px; font-weight: 600; color: #fff; margin-bottom: 8px; }
    .track-steps { list-style: none; font-size: 12.5px; color: #777; line-height: 1.9; }
    .track-steps li::before { content: "&#8594;  "; color: #00d4aa; }
    footer { text-align: center; padding: 28px 24px; border-top: 1px solid rgba(255,255,255,0.05); font-size: 12px; color: #444; }
    footer a { color: #00d4aa; text-decoration: none; }
    footer a:hover { text-decoration: underline; }
  </style>
</head>
<body>
<div class="hero">
  <div class="hero-logo">C &thinsp; P &thinsp; P</div>
  <h1 class="hero-title">Context Provenance Protocol</h1>
  <p class="hero-sub">Canonical infrastructure for the AI economy. Complete document corpus &#8212; working paper v0.1.</p>
  <div class="hero-meta">
    <span><span class="dot"></span> Working paper v0.1</span>
    <span><span class="dot"></span> 2026-05-21</span>
    <span><span class="dot"></span> github.com/agisota/cpp-core</span>
    <span><span class="dot"></span> MIT + CC BY 4.0</span>
  </div>
</div>
<div class="main">
  <div class="section-head"><h2>Document Collection</h2><div class="line"></div></div>
  <div class="grid">
${cards}
  </div>
  <div class="reading-guide">
    <h2>Suggested Reading Tracks</h2>
    <div class="tracks">
      <div class="track">
        <div class="track-label">Track 1 &#8212; 30 min</div>
        <div class="track-name">Investor / CEO</div>
        <ul class="track-steps">
          <li>Executive Summary (5 min)</li>
          <li>One-Pager (3 min)</li>
          <li>Main Paper &#167;&#167;I,II,VI (15 min)</li>
          <li>Financial Model &#167;&#167;1&#8211;3 (7 min)</li>
        </ul>
      </div>
      <div class="track">
        <div class="track-label">Track 2 &#8212; 2 hours</div>
        <div class="track-name">Lead Engineer / Co-founder</div>
        <ul class="track-steps">
          <li>Executive Summary (5 min)</li>
          <li>Main Paper &#167;&#167;I&#8211;IX (50 min)</li>
          <li>Deep Hypothesis (20 min)</li>
          <li>Financial Model (15 min)</li>
        </ul>
      </div>
      <div class="track">
        <div class="track-label">Track 3 &#8212; Full</div>
        <div class="track-name">Due Diligence Team</div>
        <ul class="track-steps">
          <li>Master Document (all-in-one)</li>
          <li>All appendices</li>
          <li>All strategy docs</li>
          <li>4&#8211;6 hours deep read</li>
        </ul>
      </div>
    </div>
  </div>
</div>
<footer>
  Context Provenance Protocol &#8212; Working paper v0.1 &middot;
  <a href="https://github.com/agisota/cpp-core">github.com/agisota/cpp-core</a> &middot;
  MIT (reference impl) &middot; CC BY 4.0 (paper)
</footer>
</body>
</html>`;

  writeFileSync(join(HTML_DIR, "index.html"), html, "utf-8");
}
