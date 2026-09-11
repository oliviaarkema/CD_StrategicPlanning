const fmt   = n => n.toLocaleString("en-US");
const fmtD  = n => "$" + n.toLocaleString("en-US");
const fmtK  = n => "$" + (n/1000).toFixed(0) + "K";
const fmtM  = n => "$" + (n/1e6).toFixed(2) + "M";

// ─── Palette ─────────────────────────────────────────────────────
const C = {
  green:   "#074d1a",
  kelly:   "#3dae2b",
  mid:     "#1a6b35",
  light:   "#5ab547",
  muted:   "#9ab09a",
  amber:   "#d97706",
  red:     "#dc2626",
  blue:    "#2563eb",
};
const gridColor  = () => getComputedStyle(document.documentElement).getPropertyValue("--chart-grid").trim();
const textColor  = () => getComputedStyle(document.documentElement).getPropertyValue("--chart-text").trim();

// ─── Chart defaults ─────────────────────────────────────────────────────────
function setupChartDefaults() {
  Chart.defaults.font.family = '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif';
  Chart.defaults.font.size = 12;
  Chart.defaults.color = textColor();
  Chart.defaults.borderColor = gridColor();
}

// ─── Section switching ──────────────────────────────────────────────────────────
const sectionInit = {};
function showSection(name) {
  document.querySelectorAll(".page-section").forEach(s =>
    s.classList.toggle("active", s.id === "sec-" + name));
  document.querySelectorAll("nav.topnav button").forEach(b =>
    b.classList.toggle("active", b.dataset.section === name));
  if (!sectionInit[name]) {
    sectionInit[name] = true;
    initSection(name);
  }
}
document.querySelectorAll("nav.topnav button").forEach(b =>
  b.addEventListener("click", () => { showSection(b.dataset.section); closeNavMenu(); }));

// ─── Section nav: hamburger popout menu ───────────────────────────────────────────
const menuBtn = document.getElementById("menuBtn");
const topnavEl = document.getElementById("topnav");
function closeNavMenu() {
  topnavEl.classList.remove("open");
  menuBtn.setAttribute("aria-expanded", "false");
}
function openNavMenu() {
  topnavEl.classList.add("open");
  menuBtn.setAttribute("aria-expanded", "true");
}
menuBtn.addEventListener("click", e => {
  e.stopPropagation();
  topnavEl.classList.contains("open") ? closeNavMenu() : openNavMenu();
});
document.addEventListener("click", e => {
  if (!topnavEl.contains(e.target) && e.target !== menuBtn) closeNavMenu();
});
document.addEventListener("keydown", e => { if (e.key === "Escape") closeNavMenu(); });

// ─── Init dispatcher ─────────────────────────────────────────────────────
function initSection(name) {
  ({home:initHome, milk:initMilk, animals:initAnimals,
    rawmilk:initRawMilk, plant:initPlant, crops:initCrops, costs:initCosts,
    market:initMarket, competitive:initCompetitive, growth:initGrowth, swot:initSwot,
    trends:initTrends}[name] || (()=>{}))();
}

// ─── Print / export current page as PDF ─────────────────────────────────────────
// Uses the browser's native print-to-PDF (no external library needed). Chart.js
// canvases are sized to their on-screen container by default, so if print layout
// ever changes a container's width, the canvas would print at the wrong size —
// resizing every live chart right before printing keeps them correctly sized for
// whatever the print page's layout ends up being, avoiding cut-off/blank charts.
let printPrevTitle = document.title;
document.getElementById("printPageBtn")?.addEventListener("click", () => {
  const h2 = document.querySelector(".page-section.active h2");
  const pageName = h2 ? h2.textContent.trim() : "Dashboard";
  printPrevTitle = document.title;
  document.title = `Country Dairy - ${pageName} - ${new Date().toISOString().slice(0,10)}`;
  window.print();
});
window.addEventListener("beforeprint", () => {
  Object.values(Chart.instances || {}).forEach(c => { try { c.resize(); } catch(e) {} });
});
window.addEventListener("afterprint", () => {
  document.title = printPrevTitle;
  Object.values(Chart.instances || {}).forEach(c => { try { c.resize(); } catch(e) {} });
});

// Chart.js's own ResizeObserver-driven auto-resize can occasionally leave a
// stacked bar chart's layout stale after a window resize (e.g. maximizing,
// or a DPI/zoom change) — force every live chart to recompute its layout
// and repaint once things settle, same fix already applied around print above.
let resizeChartsTimer = null;
window.addEventListener("resize", () => {
  clearTimeout(resizeChartsTimer);
  resizeChartsTimer = setTimeout(() => {
    Object.values(Chart.instances || {}).forEach(c => { try { c.resize(); } catch(e) {} });
  }, 150);
});
